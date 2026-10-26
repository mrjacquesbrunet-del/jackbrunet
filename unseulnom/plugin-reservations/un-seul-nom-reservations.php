<?php
/**
 * Plugin Name: Un Seul Nom - Reservations
 * Description: Reservation de places pour les evenements Un Seul Nom : compteur de places, limite par reservation, liste des inscrits et export CSV. Une ville apres l'autre, sans perdre les inscrits des precedentes.
 * Version:     1.2.0
 * Author:      Un Seul Nom
 * License:     GPL-2.0-or-later
 *
 * Le comptage se fait cote serveur : c'est la seule facon d'avoir un total
 * partage entre tous les visiteurs et de garantir qu'on ne depasse pas la
 * capacite, meme si deux personnes reservent en meme temps.
 *
 * UNE VILLE APRES L'AUTRE (depuis la version 1.1)
 * Chaque reservation porte le nom de la ville pour laquelle elle a ete
 * prise. Ouvrir une nouvelle ville remet le compteur a zero sans effacer
 * quoi que ce soit : les inscrits des editions precedentes restent en
 * base et restent exportables. Sans cela, le compteur d'une edition
 * terminee bloquait la suivante a « complet ».
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Acces direct interdit.
}

final class USN_Reservations {

	const VERSION        = '1.2.0';
	const OPT_CAPACITE   = 'usn_capacite';        // Nombre total de places ouvertes (surbooking compris).
	const OPT_MAX        = 'usn_max_par_personne'; // Limite par reservation.
	const OPT_OUVERT     = 'usn_inscriptions_ouvertes';
	const OPT_EVENEMENT  = 'usn_evenement';        // La ville pour laquelle on reserve en ce moment.
	const OPT_DB_VERSION = 'usn_db_version';
	// Brevo. La cle n'est jamais envoyee dans la page : elle ouvre tout
	// le compte, et une page est lisible par n'importe qui.
	const OPT_BREVO_CLE     = 'usn_brevo_cle';
	const OPT_BREVO_LISTES  = 'usn_brevo_listes';   // ville => identifiant de liste
	const OPT_BREVO_ATTRS   = 'usn_brevo_attributs';
	const OPT_BREVO_JOURNAL = 'usn_brevo_journal';  // le dernier envoi, reussi ou non

	// Nom donne aux reservations prises avant la version 1.1, quand le
	// module ne savait pas encore de quelle ville il s'agissait.
	const AVANT = 'Edition precedente';

	public static function table_reservations() {
		global $wpdb;
		return $wpdb->prefix . 'usn_reservations';
	}

	public static function table_compteur() {
		global $wpdb;
		return $wpdb->prefix . 'usn_compteur';
	}

	public static function init() {
		self::mettre_a_jour();
		add_action( 'rest_api_init', array( __CLASS__, 'enregistrer_routes' ) );
		add_action( 'admin_menu', array( __CLASS__, 'menu_admin' ) );
		add_action( 'admin_init', array( __CLASS__, 'enregistrer_reglages' ) );
		add_action( 'admin_post_usn_export_csv', array( __CLASS__, 'exporter_csv' ) );
		add_action( 'admin_post_usn_nouvelle_ville', array( __CLASS__, 'ouvrir_nouvelle_ville' ) );
		add_shortcode( 'usn_places_restantes', array( __CLASS__, 'shortcode_places' ) );
	}

	/**
	 * Rattrape une base restee a une version anterieure.
	 *
	 * Mettre a jour un plugin ne rejoue pas le crochet d'activation : sans
	 * ce passage, une installation existante garderait une table sans
	 * colonne « evenement » et le module tomberait en panne a la premiere
	 * reservation.
	 */
	public static function mettre_a_jour() {
		if ( self::VERSION === get_option( self::OPT_DB_VERSION ) ) {
			return;
		}
		self::activer();

		// Les reservations prises avant la 1.1 n'ont pas de ville : on leur
		// en donne une, sans quoi elles se melangeraient aux prochaines.
		global $wpdb;
		$table = self::table_reservations();
		$wpdb->query(
			$wpdb->prepare( "UPDATE {$table} SET evenement = %s WHERE evenement = ''", self::AVANT )
		);
		if ( '' === (string) get_option( self::OPT_EVENEMENT, '' ) ) {
			update_option( self::OPT_EVENEMENT, self::AVANT );
		}
	}

	/* ------------------------------------------------------------------ */
	/* Installation                                                        */
	/* ------------------------------------------------------------------ */

	public static function activer() {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$charset = $wpdb->get_charset_collate();

		$reservations = self::table_reservations();
		$compteur     = self::table_compteur();

		dbDelta(
			"CREATE TABLE {$reservations} (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				nom VARCHAR(120) NOT NULL,
				email VARCHAR(190) NOT NULL,
				places TINYINT UNSIGNED NOT NULL DEFAULT 1,
				evenement VARCHAR(80) NOT NULL DEFAULT '',
				ip VARCHAR(45) NOT NULL DEFAULT '',
				cree_le DATETIME NOT NULL,
				PRIMARY KEY  (id),
				KEY email (email),
				KEY evenement (evenement),
				KEY cree_le (cree_le)
			) {$charset};"
		);

		/*
		 * Le compteur vit dans sa propre table plutot que dans les options :
		 * il faut pouvoir l'incrementer de facon atomique, ce que les options
		 * WordPress (mises en cache) ne permettent pas de facon fiable.
		 */
		dbDelta(
			"CREATE TABLE {$compteur} (
				id TINYINT UNSIGNED NOT NULL,
				reservees INT UNSIGNED NOT NULL DEFAULT 0,
				PRIMARY KEY  (id)
			) {$charset};"
		);

		$wpdb->query( "INSERT IGNORE INTO {$compteur} (id, reservees) VALUES (1, 0)" );

		add_option( self::OPT_CAPACITE, 650 );
		add_option( self::OPT_MAX, 4 );
		add_option( self::OPT_OUVERT, 1 );
		add_option( self::OPT_EVENEMENT, '' );
		update_option( self::OPT_DB_VERSION, self::VERSION );
	}

	/* ------------------------------------------------------------------ */
	/* La ville en cours                                                   */
	/* ------------------------------------------------------------------ */

	public static function evenement() {
		$nom = trim( (string) get_option( self::OPT_EVENEMENT, '' ) );
		return '' === $nom ? self::AVANT : $nom;
	}

	/**
	 * Passe a la ville suivante.
	 *
	 * Rien n'est efface : les inscrits des editions precedentes gardent
	 * leur ligne et leur ville. Seul le compteur repart de zero, puisque
	 * c'est lui qui dit « complet ».
	 */
	public static function ouvrir_nouvelle_ville() {
		if ( ! current_user_can( 'manage_options' )
			|| ! isset( $_POST['_wpnonce'] )
			|| ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['_wpnonce'] ) ), 'usn_nouvelle_ville' ) ) {
			wp_die( 'Action non autorisée.' );
		}

		$nom = sanitize_text_field( wp_unslash( (string) ( $_POST['usn_nouvelle_ville'] ?? '' ) ) );
		$nom = trim( mb_substr( $nom, 0, 80 ) );
		if ( '' === $nom ) {
			wp_safe_redirect( add_query_arg( 'usn_message', 'nom-vide', admin_url( 'admin.php?page=usn-reservations' ) ) );
			exit;
		}

		global $wpdb;
		$compteur = self::table_compteur();
		$wpdb->query( "UPDATE {$compteur} SET reservees = 0 WHERE id = 1" );

		update_option( self::OPT_EVENEMENT, $nom );
		update_option( self::OPT_OUVERT, 1 );

		// La liste Brevo est creee tout de suite, avant la premiere
		// inscription : si la cle est mauvaise, on l'apprend maintenant
		// et non le soir de l'ouverture des reservations.
		if ( self::brevo_actif() ) {
			self::brevo_preparer_attributs();
			self::brevo_liste( $nom );
		}

		wp_safe_redirect( add_query_arg( 'usn_message', 'ville-ouverte', admin_url( 'admin.php?page=usn-reservations' ) ) );
		exit;
	}

	/* ------------------------------------------------------------------ */
	/* Reglages                                                            */
	/* ------------------------------------------------------------------ */

	public static function capacite() {
		return max( 0, (int) get_option( self::OPT_CAPACITE, 650 ) );
	}

	public static function max_par_personne() {
		return max( 1, min( 20, (int) get_option( self::OPT_MAX, 4 ) ) );
	}

	public static function inscriptions_ouvertes() {
		return (bool) get_option( self::OPT_OUVERT, 1 );
	}

	public static function places_reservees() {
		global $wpdb;
		$table = self::table_compteur();
		return (int) $wpdb->get_var( "SELECT reservees FROM {$table} WHERE id = 1" );
	}

	public static function etat() {
		$capacite  = self::capacite();
		$reservees = self::places_reservees();
		return array(
			'capacite'  => $capacite,
			'reservees' => $reservees,
			'restantes' => max( 0, $capacite - $reservees ),
			'max'       => self::max_par_personne(),
			'ouvert'    => self::inscriptions_ouvertes() && $reservees < $capacite,
			// La page n'envoie vers le formulaire Brevo que si le serveur
			// ne le fait pas : sinon le contact partirait deux fois, et la
			// seconde fois sans sa ville ni son nombre de places.
			'brevo'     => self::brevo_actif(),
		);
	}

	/* ------------------------------------------------------------------ */
	/* API publique                                                        */
	/* ------------------------------------------------------------------ */

	public static function enregistrer_routes() {
		register_rest_route(
			'usn/v1',
			'/places',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'route_places' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			'usn/v1',
			'/reserver',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'route_reserver' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	public static function route_places() {
		return new WP_REST_Response( self::etat(), 200 );
	}

	public static function route_reserver( WP_REST_Request $requete ) {
		if ( ! self::inscriptions_ouvertes() ) {
			return new WP_REST_Response(
				array( 'ok' => false, 'erreur' => 'fermees', 'message' => 'Les inscriptions sont closes.' ),
				403
			);
		}

		// Piege a robots : ce champ doit rester vide.
		if ( '' !== trim( (string) $requete->get_param( 'site' ) ) ) {
			return new WP_REST_Response( array( 'ok' => false, 'erreur' => 'robot' ), 400 );
		}

		$nom    = sanitize_text_field( (string) $requete->get_param( 'nom' ) );
		$email  = sanitize_email( (string) $requete->get_param( 'email' ) );
		$places = (int) $requete->get_param( 'places' );
		$max    = self::max_par_personne();

		if ( '' === $nom || mb_strlen( $nom ) > 120 ) {
			return new WP_REST_Response(
				array( 'ok' => false, 'erreur' => 'nom', 'message' => 'Merci d\'indiquer ton nom.' ),
				400
			);
		}
		if ( ! is_email( $email ) ) {
			return new WP_REST_Response(
				array( 'ok' => false, 'erreur' => 'email', 'message' => 'Cette adresse e-mail n\'est pas valide.' ),
				400
			);
		}

		/*
		 * Une adresse, une reservation.
		 *
		 * A Avignon, 1300 places avaient ete prises pour environ 450
		 * personnes presentes : beaucoup n'avaient pas recu le courriel de
		 * confirmation et s'etaient reinscrites, parfois plusieurs fois. Le
		 * compteur devenait inutilisable pour decider de la salle.
		 *
		 * Le refus arrive avant l'increment : une tentative en double ne
		 * consomme aucune place. Et il porte sur la ville en cours, donc
		 * quelqu'un qui etait venu a Avignon peut s'inscrire a Tarbes.
		 */
		$ancienne = self::reservation_existante( $email );
		if ( $ancienne ) {
			/* Refuse, mais depose quand meme chez Brevo. Celui qui revient
			   le fait presque toujours parce qu'il n'a jamais recu la
			   confirmation, et la seule explication possible est qu'il ne
			   soit pas chez Brevo : l'envoi de la premiere fois a echoue
			   sans que personne le sache. Le refuser sans rien envoyer le
			   condamnait a ne jamais rien recevoir, a chaque essai. */
			self::brevo_envoyer( $nom, $email, (int) $ancienne->places, self::evenement(), 'reservation' );

			return new WP_REST_Response(
				array(
					'ok'      => false,
					'erreur'  => 'deja-inscrit',
					'places'  => (int) $ancienne->places,
					'message' => sprintf(
						'Tu es déjà inscrit avec cette adresse : %d place(s) sont réservées à ton nom. '
						. 'Si tu n\'as pas reçu la confirmation, regarde dans tes courriers indésirables.',
						(int) $ancienne->places
					),
				),
				409
			);
		}
		if ( $places < 1 || $places > $max ) {
			return new WP_REST_Response(
				array(
					'ok'      => false,
					'erreur'  => 'places',
					'message' => sprintf( 'Tu peux réserver entre 1 et %d places.', $max ),
				),
				400
			);
		}

		global $wpdb;
		$compteur = self::table_compteur();
		$capacite = self::capacite();

		/*
		 * Increment atomique : la condition est evaluee par la base de donnees
		 * au moment de l'ecriture. Si deux personnes reservent les dernieres
		 * places en meme temps, une seule des deux requetes modifie une ligne.
		 */
		$modifiees = $wpdb->query(
			$wpdb->prepare(
				"UPDATE {$compteur} SET reservees = reservees + %d WHERE id = 1 AND reservees + %d <= %d",
				$places,
				$places,
				$capacite
			)
		);

		if ( 1 !== (int) $modifiees ) {
			$etat = self::etat();
			return new WP_REST_Response(
				array(
					'ok'        => false,
					'erreur'    => 'complet',
					'restantes' => $etat['restantes'],
					'message'   => $etat['restantes'] > 0
						? sprintf( 'Il ne reste que %d place(s).', $etat['restantes'] )
						: 'Toutes les places sont réservées.',
				),
				409
			);
		}

		$insere = $wpdb->insert(
			self::table_reservations(),
			array(
				'nom'       => $nom,
				'email'     => $email,
				'places'    => $places,
				'evenement' => self::evenement(),
				'ip'        => self::ip_visiteur(),
				'cree_le'   => current_time( 'mysql' ),
			),
			array( '%s', '%s', '%d', '%s', '%s', '%s' )
		);

		if ( false === $insere ) {
			// On rend les places pour ne pas les perdre.
			$wpdb->query(
				$wpdb->prepare( "UPDATE {$compteur} SET reservees = GREATEST(0, reservees - %d) WHERE id = 1", $places )
			);
			return new WP_REST_Response(
				array( 'ok' => false, 'erreur' => 'enregistrement', 'message' => 'Enregistrement impossible, réessaie.' ),
				500
			);
		}

		// Depose dans la liste Brevo de la ville. Un echec ne remet jamais
		// la reservation en cause : la place est prise, et l'echec est
		// consigne pour le tableau de bord.
		self::brevo_envoyer( $nom, $email, $places, self::evenement(), 'reservation' );

		do_action( 'usn_reservation_enregistree', $nom, $email, $places );

		$etat = self::etat();
		return new WP_REST_Response(
			array(
				'ok'        => true,
				'places'    => $places,
				'restantes' => $etat['restantes'],
				'message'   => 'Ta réservation est enregistrée.',
			),
			201
		);
	}

	/**
	 * La reservation deja prise avec cette adresse, pour la ville en cours.
	 *
	 * La comparaison passe par LOWER() des deux cotes : « Jean@x.fr » et
	 * « jean@x.fr » sont la meme personne, et rien ne garantit que la
	 * table soit rangee dans un classement insensible a la casse.
	 */
	public static function reservation_existante( $email ) {
		global $wpdb;
		$table = self::table_reservations();
		return $wpdb->get_row(
			$wpdb->prepare(
				"SELECT id, places, cree_le FROM {$table}
				 WHERE LOWER(email) = LOWER(%s) AND evenement = %s
				 ORDER BY cree_le ASC LIMIT 1",
				$email,
				self::evenement()
			)
		);
	}

	private static function ip_visiteur() {
		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
		return substr( $ip, 0, 45 );
	}

	/* ------------------------------------------------------------------ */
	/* Raccourci                                                           */
	/* ------------------------------------------------------------------ */

	public static function shortcode_places() {
		$etat = self::etat();
		return esc_html( (string) $etat['restantes'] );
	}

	/* ------------------------------------------------------------------ */
	/* Administration                                                      */
	/* ------------------------------------------------------------------ */

	public static function menu_admin() {
		add_menu_page(
			'Réservations Un Seul Nom',
			'Réservations',
			'manage_options',
			'usn-reservations',
			array( __CLASS__, 'page_admin' ),
			'dashicons-tickets-alt',
			26
		);
	}

	public static function enregistrer_reglages() {
		register_setting( 'usn_reservations', self::OPT_CAPACITE, array( 'type' => 'integer', 'sanitize_callback' => 'absint' ) );
		register_setting( 'usn_reservations', self::OPT_MAX, array( 'type' => 'integer', 'sanitize_callback' => 'absint' ) );
		register_setting( 'usn_reservations', self::OPT_OUVERT, array( 'type' => 'integer', 'sanitize_callback' => 'absint' ) );
		register_setting( 'usn_reservations', self::OPT_BREVO_CLE, array( 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ) );
	}

	public static function page_admin() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		global $wpdb;
		$etat  = self::etat();
		$table = self::table_reservations();
		$ville = self::evenement();

		// La liste et les compteurs ne montrent que la ville en cours :
		// melanger deux editions donnerait un total qui ne veut rien dire.
		$lignes = $wpdb->get_results(
			$wpdb->prepare( "SELECT * FROM {$table} WHERE evenement = %s ORDER BY cree_le DESC LIMIT 200", $ville )
		);
		$total  = (int) $wpdb->get_var(
			$wpdb->prepare( "SELECT COUNT(*) FROM {$table} WHERE evenement = %s", $ville )
		);
		$tout   = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table}" );

		$message = isset( $_GET['usn_message'] ) ? sanitize_key( wp_unslash( $_GET['usn_message'] ) ) : '';
		if ( 'ville-ouverte' === $message ) {
			printf(
				'<div class="notice notice-success is-dismissible"><p>Les réservations sont ouvertes pour <strong>%s</strong>. Le compteur repart de zéro ; les inscrits des éditions précédentes sont conservés.</p></div>',
				esc_html( $ville )
			);
		} elseif ( 'nom-vide' === $message ) {
			echo '<div class="notice notice-error is-dismissible"><p>Il faut donner un nom à la ville.</p></div>';
		}
		?>
		<div class="wrap">
			<h1>Réservations — Un Seul Nom</h1>

			<p style="font-size:14px;margin:14px 0 0">
				Ville en cours :
				<strong style="font-size:17px"><?php echo esc_html( $ville ); ?></strong>
			</p>

			<div style="display:flex;gap:16px;flex-wrap:wrap;margin:20px 0">
				<?php
				$cartes = array(
					'Places ouvertes'  => $etat['capacite'],
					'Places réservées' => $etat['reservees'],
					'Places restantes' => $etat['restantes'],
					'Inscriptions'     => $total,
				);
				foreach ( $cartes as $libelle => $valeur ) {
					printf(
						'<div style="background:#fff;border:1px solid #dcdcde;border-radius:8px;padding:16px 22px;min-width:150px">
							<div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#646970">%s</div>
							<div style="font-size:30px;font-weight:700;line-height:1.2">%d</div>
						</div>',
						esc_html( $libelle ),
						(int) $valeur
					);
				}
				?>
			</div>

			<h2>Réglages</h2>
			<form method="post" action="options.php">
				<?php settings_fields( 'usn_reservations' ); ?>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="usn_cap">Places ouvertes</label></th>
						<td>
							<input name="<?php echo esc_attr( self::OPT_CAPACITE ); ?>" id="usn_cap" type="number" min="0" step="1"
								value="<?php echo esc_attr( self::capacite() ); ?>" class="small-text">
							<p class="description">
								Nombre total de places acceptées, surbooking compris.
								Exemple : salle de 500 places, ouvrez 650 pour compenser les absents.
							</p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="usn_max">Maximum par r&eacute;servation</label></th>
						<td>
							<input name="<?php echo esc_attr( self::OPT_MAX ); ?>" id="usn_max" type="number" min="1" max="20" step="1"
								value="<?php echo esc_attr( self::max_par_personne() ); ?>" class="small-text">
							<p class="description">Nombre de places maximum par réservation.</p>
						</td>
					</tr>
					<tr>
						<th scope="row">Inscriptions</th>
						<td>
							<label>
								<input name="<?php echo esc_attr( self::OPT_OUVERT ); ?>" type="checkbox" value="1"
									<?php checked( self::inscriptions_ouvertes() ); ?>>
								Ouvertes
							</label>
							<p class="description">Décochez pour fermer les inscriptions sans toucher au compteur.</p>
						</td>
					</tr>
					<tr>
						<th scope="row">Clé API Brevo</th>
						<td>
							<?php $cle = self::brevo_cle(); ?>
							<input name="<?php echo esc_attr( self::OPT_BREVO_CLE ); ?>" type="password"
								class="regular-text" autocomplete="off"
								value="<?php echo esc_attr( $cle ); ?>"
								placeholder="xkeysib-...">
							<p class="description" style="max-width:48em">
								Brevo &rarr; <strong>SMTP et API</strong> &rarr; <strong>Clés API</strong> &rarr;
								<em>Générer une nouvelle clé API</em>. Avec cette clé, chaque inscrit est déposé
								dans une liste Brevo <strong>au nom de sa ville</strong>, avec son nombre de
								places. La liste est créée toute seule quand vous ouvrez la ville.
							</p>
							<p class="description" style="max-width:48em">
								<strong>Sans clé</strong>, rien ne casse&nbsp;: la page continue d'envoyer les
								contacts au formulaire Brevo comme avant, mais toutes les villes arrivent
								dans la même liste, sans le nombre de places, et personne n'est prévenu
								quand un envoi échoue.
							</p>
							<?php
							$journal = self::brevo_journal();
							if ( $journal ) :
								$vert = ! empty( $journal['ok'] );
								?>
								<p style="margin-top:12px;padding:10px 12px;border-left:4px solid <?php echo $vert ? '#00a32a' : '#d63638'; ?>;background:#fff">
									<strong><?php echo $vert ? 'Dernier envoi : réussi' : 'Dernier envoi : ÉCHEC'; ?></strong><br>
									<?php echo esc_html( $journal['quand'] ?? '' ); ?>
									&mdash; <?php echo esc_html( $journal['email'] ?? '' ); ?>
									<?php if ( ! empty( $journal['ville'] ) ) : ?>
										&mdash; <?php echo esc_html( $journal['ville'] ); ?>
									<?php endif; ?>
									<?php if ( ! $vert ) : ?>
										<br><code><?php echo esc_html( ( $journal['code'] ?? '' ) . ' ' . ( $journal['message'] ?? '' ) ); ?></code>
									<?php endif; ?>
								</p>
							<?php endif; ?>
							<?php
							$listes = get_option( self::OPT_BREVO_LISTES, array() );
							if ( is_array( $listes ) && $listes ) :
								?>
								<p class="description" style="margin-top:10px">
									<strong>Listes créées :</strong>
									<?php echo esc_html( implode( ', ', array_keys( $listes ) ) ); ?>
								</p>
							<?php endif; ?>
						</td>
					</tr>
				</table>
				<?php submit_button( 'Enregistrer' ); ?>
			</form>

			<h2>Passer à la ville suivante</h2>
			<p class="description" style="max-width:62em">
				Remet le compteur à zéro pour une nouvelle ville. <strong>Rien n'est
				effacé</strong> : les inscrits des éditions précédentes gardent leur
				ligne et restent exportables, ils ne comptent simplement plus dans
				les places restantes. Pensez à exporter le CSV de la ville en cours
				avant de basculer.
			</p>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>"
				onsubmit="return confirm('Ouvrir les reservations pour cette nouvelle ville ? Le compteur repart de zero.');">
				<input type="hidden" name="action" value="usn_nouvelle_ville">
				<?php wp_nonce_field( 'usn_nouvelle_ville' ); ?>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="usn_ville">Nom de la ville</label></th>
						<td>
							<input name="usn_nouvelle_ville" id="usn_ville" type="text" maxlength="80"
								class="regular-text" placeholder="Tarbes 2026" required>
							<p class="description">
								Ce nom sert à retrouver les inscrits plus tard. Mettez la ville
								et l'année : « Tarbes 2026 », « Limours 2027 ».
							</p>
						</td>
					</tr>
				</table>
				<?php submit_button( 'Ouvrir cette ville', 'secondary' ); ?>
			</form>

			<h2>Inscrits de <?php echo esc_html( $ville ); ?> <?php echo $total > 200 ? '(200 plus récents)' : ''; ?></h2>
			<p>
				<a class="button button-primary"
					href="<?php echo esc_url( admin_url( 'admin-post.php?action=usn_export_csv&portee=ville&_wpnonce=' . wp_create_nonce( 'usn_export' ) ) ); ?>">
					Exporter <?php echo esc_html( $ville ); ?> en CSV
				</a>
				<a class="button"
					href="<?php echo esc_url( admin_url( 'admin-post.php?action=usn_export_csv&portee=tout&_wpnonce=' . wp_create_nonce( 'usn_export' ) ) ); ?>">
					Exporter toutes les villes (<?php echo (int) $tout; ?>)
				</a>
			</p>
			<table class="wp-list-table widefat fixed striped">
				<thead><tr><th>Date</th><th>Nom</th><th>E-mail</th><th>Places</th></tr></thead>
				<tbody>
				<?php if ( empty( $lignes ) ) : ?>
					<tr><td colspan="4">Aucune réservation pour le moment.</td></tr>
				<?php else : ?>
					<?php foreach ( $lignes as $l ) : ?>
						<tr>
							<td><?php echo esc_html( mysql2date( 'd/m/Y H:i', $l->cree_le ) ); ?></td>
							<td><?php echo esc_html( $l->nom ); ?></td>
							<td><?php echo esc_html( $l->email ); ?></td>
							<td><?php echo (int) $l->places; ?></td>
						</tr>
					<?php endforeach; ?>
				<?php endif; ?>
				</tbody>
			</table>
		</div>
		<?php
	}

	/* ================================================================== */
	/* BREVO                                                              */
	/*                                                                    */
	/* Une liste par ville, creee par le module lui-meme, et chaque       */
	/* inscrit depose dedans avec son nombre de places.                   */
	/*                                                                    */
	/* POURQUOI PASSER PAR L'API PLUTOT QUE PAR LE FORMULAIRE BREVO.      */
	/*                                                                    */
	/* Jusqu'ici la page envoyait le contact au formulaire Brevo dans un  */
	/* cadre invisible. Trois defauts, et ce sont ceux d'Avignon :        */
	/*                                                                    */
	/*  - Le formulaire depose dans la liste qui lui est attachee, une    */
	/*    seule et toujours la meme. Les villes se melangeaient.          */
	/*  - Il ne porte que les champs qu'on lui declare ; le nombre de     */
	/*    places n'arrivait jamais.                                       */
	/*  - Surtout : la page n'apprend JAMAIS si l'envoi a echoue. Le      */
	/*    cadre est invisible, personne ne lit sa reponse. C'est ainsi    */
	/*    qu'on se retrouve avec des inscrits qui ne sont nulle part.     */
	/*                                                                    */
	/* L'appel depuis le serveur repond, et sa reponse est gardee : le    */
	/* tableau de bord dit si le dernier envoi est passe, et pourquoi il  */
	/* n'est pas passe.                                                   */
	/*                                                                    */
	/* La cle n'est JAMAIS dans la page : elle ouvre tout le compte       */
	/* Brevo, et une page est lisible par n'importe qui.                  */
	/* ================================================================== */

	const BREVO_RACINE = 'https://api.brevo.com/v3';

	public static function brevo_cle() {
		return trim( (string) get_option( self::OPT_BREVO_CLE, '' ) );
	}

	public static function brevo_actif() {
		return '' !== self::brevo_cle();
	}

	/**
	 * Un appel a Brevo. Rend un tableau : ok, code, corps, message.
	 *
	 * Rien n'interrompt jamais une reservation : si Brevo ne repond pas,
	 * la place reste prise et l'echec est consigne. Perdre une place
	 * parce qu'un service tiers est en panne serait le pire des deux.
	 */
	public static function brevo_appel( $methode, $chemin, $corps = null ) {
		$cle = self::brevo_cle();
		if ( '' === $cle ) {
			return array( 'ok' => false, 'code' => 0, 'corps' => array(), 'message' => 'Aucune cle API enregistree.' );
		}

		$args = array(
			'method'  => $methode,
			'timeout' => 12,
			'headers' => array(
				'api-key'      => $cle,
				'accept'       => 'application/json',
				'content-type' => 'application/json',
			),
		);
		if ( null !== $corps ) {
			$args['body'] = wp_json_encode( $corps );
		}

		$reponse = wp_remote_request( self::BREVO_RACINE . $chemin, $args );

		if ( is_wp_error( $reponse ) ) {
			return array( 'ok' => false, 'code' => 0, 'corps' => array(), 'message' => $reponse->get_error_message() );
		}

		$code = (int) wp_remote_retrieve_response_code( $reponse );
		$lu   = json_decode( wp_remote_retrieve_body( $reponse ), true );
		$lu   = is_array( $lu ) ? $lu : array();

		return array(
			'ok'      => $code >= 200 && $code < 300,
			'code'    => $code,
			'corps'   => $lu,
			'message' => isset( $lu['message'] ) ? (string) $lu['message'] : '',
		);
	}

	/**
	 * Cree les attributs une fois pour toutes.
	 *
	 * Brevo refuse un contact qui porte un attribut inconnu : sans cette
	 * etape, le tout premier envoi echouerait avec « Invalid attributes »
	 * et rien ne partirait jamais. Un attribut deja present renvoie une
	 * erreur, qu'on ignore : c'est le resultat voulu.
	 */
	public static function brevo_preparer_attributs() {
		if ( get_option( self::OPT_BREVO_ATTRS, '' ) === self::VERSION ) {
			return;
		}
		$attributs = array( 'NOM' => 'text', 'VILLE' => 'text', 'SOURCE' => 'text', 'PLACES' => 'float' );
		foreach ( $attributs as $nom => $type ) {
			self::brevo_appel( 'POST', '/contacts/attributes/normal/' . rawurlencode( $nom ), array( 'type' => $type ) );
		}
		update_option( self::OPT_BREVO_ATTRS, self::VERSION );
	}

	/**
	 * L'identifiant de la liste Brevo d'une ville, creee au besoin.
	 *
	 * La correspondance ville - liste est gardee en base : on ne
	 * redemande pas a Brevo a chaque inscription.
	 */
	public static function brevo_liste( $ville ) {
		$ville = trim( (string) $ville );
		if ( '' === $ville ) {
			return 0;
		}

		$listes = get_option( self::OPT_BREVO_LISTES, array() );
		$listes = is_array( $listes ) ? $listes : array();
		if ( ! empty( $listes[ $ville ] ) ) {
			return (int) $listes[ $ville ];
		}

		// Brevo exige un dossier. On prend le premier qu'il nous donne.
		$dossier = 1;
		$d       = self::brevo_appel( 'GET', '/contacts/folders?limit=1&offset=0' );
		if ( $d['ok'] && ! empty( $d['corps']['folders'][0]['id'] ) ) {
			$dossier = (int) $d['corps']['folders'][0]['id'];
		}

		$creation = self::brevo_appel(
			'POST',
			'/contacts/lists',
			array( 'name' => 'Un Seul Nom - ' . $ville, 'folderId' => $dossier )
		);

		$id = 0;
		if ( $creation['ok'] && ! empty( $creation['corps']['id'] ) ) {
			$id = (int) $creation['corps']['id'];
		} elseif ( 400 === $creation['code'] ) {
			// Une liste de ce nom existe deja : on la retrouve au lieu
			// d'en creer une seconde qui porterait le meme nom.
			$toutes = self::brevo_appel( 'GET', '/contacts/lists?limit=50&offset=0' );
			if ( $toutes['ok'] && ! empty( $toutes['corps']['lists'] ) ) {
				foreach ( $toutes['corps']['lists'] as $l ) {
					if ( isset( $l['name'] ) && 'Un Seul Nom - ' . $ville === $l['name'] ) {
						$id = (int) $l['id'];
						break;
					}
				}
			}
		}

		if ( $id > 0 ) {
			$listes[ $ville ] = $id;
			update_option( self::OPT_BREVO_LISTES, $listes );
		}
		return $id;
	}

	/**
	 * Depose un inscrit dans la liste de sa ville.
	 *
	 * « updateEnabled » : une adresse deja connue est mise a jour, pas
	 * ajoutee une seconde fois. C'est ce qui permet d'appeler cette
	 * fonction aussi quand on REFUSE une inscription en double — celui
	 * qui revient le fait presque toujours parce qu'il n'a rien recu,
	 * et la seule explication possible est qu'il ne soit pas chez Brevo.
	 */
	public static function brevo_envoyer( $nom, $email, $places, $ville, $source = 'reservation' ) {
		if ( ! self::brevo_actif() ) {
			return false;
		}
		self::brevo_preparer_attributs();

		$liste  = self::brevo_liste( $ville );
		$listes = $liste > 0 ? array( $liste ) : array();

		$reponse = self::brevo_appel(
			'POST',
			'/contacts',
			array(
				'email'         => $email,
				'updateEnabled' => true,
				'listIds'       => $listes,
				'attributes'    => array(
					'NOM'    => $nom,
					'VILLE'  => $ville,
					'SOURCE' => $source,
					'PLACES' => (float) $places,
				),
			)
		);

		self::brevo_consigner( $reponse, $email, $ville );
		return $reponse['ok'];
	}

	/** Garde la trace du dernier envoi, reussi ou non. */
	public static function brevo_consigner( $reponse, $email, $ville ) {
		update_option(
			self::OPT_BREVO_JOURNAL,
			array(
				'quand'   => current_time( 'mysql' ),
				'ok'      => (bool) $reponse['ok'],
				'code'    => (int) $reponse['code'],
				'message' => (string) $reponse['message'],
				'email'   => (string) $email,
				'ville'   => (string) $ville,
			)
		);
	}

	public static function brevo_journal() {
		$j = get_option( self::OPT_BREVO_JOURNAL, array() );
		return is_array( $j ) ? $j : array();
	}

	public static function exporter_csv() {
		if ( ! current_user_can( 'manage_options' ) || ! isset( $_GET['_wpnonce'] )
			|| ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['_wpnonce'] ) ), 'usn_export' ) ) {
			wp_die( 'Action non autorisée.' );
		}

		global $wpdb;
		$table  = self::table_reservations();
		$portee = isset( $_GET['portee'] ) ? sanitize_key( wp_unslash( $_GET['portee'] ) ) : 'tout';
		$ville  = self::evenement();

		if ( 'ville' === $portee ) {
			$lignes = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT nom, email, places, evenement, cree_le FROM {$table} WHERE evenement = %s ORDER BY cree_le ASC",
					$ville
				),
				ARRAY_A
			);
			$fichier = 'reservations-' . sanitize_title( $ville ) . '.csv';
		} else {
			$lignes  = $wpdb->get_results(
				"SELECT nom, email, places, evenement, cree_le FROM {$table} ORDER BY cree_le ASC",
				ARRAY_A
			);
			$fichier = 'reservations-un-seul-nom.csv';
		}

		nocache_headers();
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename=' . $fichier );

		$sortie = fopen( 'php://output', 'w' );
		fprintf( $sortie, chr( 0xEF ) . chr( 0xBB ) . chr( 0xBF ) ); // BOM, pour Excel.
		fputcsv( $sortie, array( 'Nom', 'E-mail', 'Places', 'Ville', 'Date' ), ';' );
		foreach ( $lignes as $l ) {
			fputcsv( $sortie, array( $l['nom'], $l['email'], $l['places'], $l['evenement'], $l['cree_le'] ), ';' );
		}
		fclose( $sortie );
		exit;
	}
}

register_activation_hook( __FILE__, array( 'USN_Reservations', 'activer' ) );
add_action( 'plugins_loaded', array( 'USN_Reservations', 'init' ) );
