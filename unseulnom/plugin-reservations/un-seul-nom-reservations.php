<?php
/**
 * Plugin Name: Un Seul Nom - Reservations
 * Description: Reservation de places pour les evenements Un Seul Nom : compteur de places, limite par reservation, liste des inscrits et export CSV.
 * Version:     1.0.0
 * Author:      Un Seul Nom
 * License:     GPL-2.0-or-later
 *
 * Le comptage se fait cote serveur : c'est la seule facon d'avoir un total
 * partage entre tous les visiteurs et de garantir qu'on ne depasse pas la
 * capacite, meme si deux personnes reservent en meme temps.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Acces direct interdit.
}

final class USN_Reservations {

	const VERSION        = '1.0.0';
	const OPT_CAPACITE   = 'usn_capacite';        // Nombre total de places ouvertes (surbooking compris).
	const OPT_MAX        = 'usn_max_par_personne'; // Limite par reservation.
	const OPT_OUVERT     = 'usn_inscriptions_ouvertes';
	const OPT_DB_VERSION = 'usn_db_version';

	public static function table_reservations() {
		global $wpdb;
		return $wpdb->prefix . 'usn_reservations';
	}

	public static function table_compteur() {
		global $wpdb;
		return $wpdb->prefix . 'usn_compteur';
	}

	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'enregistrer_routes' ) );
		add_action( 'admin_menu', array( __CLASS__, 'menu_admin' ) );
		add_action( 'admin_init', array( __CLASS__, 'enregistrer_reglages' ) );
		add_action( 'admin_post_usn_export_csv', array( __CLASS__, 'exporter_csv' ) );
		add_shortcode( 'usn_places_restantes', array( __CLASS__, 'shortcode_places' ) );
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
				ip VARCHAR(45) NOT NULL DEFAULT '',
				cree_le DATETIME NOT NULL,
				PRIMARY KEY  (id),
				KEY email (email),
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
		update_option( self::OPT_DB_VERSION, self::VERSION );
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
				'nom'     => $nom,
				'email'   => $email,
				'places'  => $places,
				'ip'      => self::ip_visiteur(),
				'cree_le' => current_time( 'mysql' ),
			),
			array( '%s', '%s', '%d', '%s', '%s' )
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
	}

	public static function page_admin() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		global $wpdb;
		$etat  = self::etat();
		$table = self::table_reservations();

		$lignes = $wpdb->get_results( "SELECT * FROM {$table} ORDER BY cree_le DESC LIMIT 200" );
		$total  = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table}" );
		?>
		<div class="wrap">
			<h1>Réservations — Un Seul Nom</h1>

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
				</table>
				<?php submit_button( 'Enregistrer' ); ?>
			</form>

			<h2>Inscrits <?php echo $total > 200 ? '(200 plus récents)' : ''; ?></h2>
			<p>
				<a class="button button-primary"
					href="<?php echo esc_url( admin_url( 'admin-post.php?action=usn_export_csv&_wpnonce=' . wp_create_nonce( 'usn_export' ) ) ); ?>">
					Exporter tout en CSV
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

	public static function exporter_csv() {
		if ( ! current_user_can( 'manage_options' ) || ! isset( $_GET['_wpnonce'] )
			|| ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['_wpnonce'] ) ), 'usn_export' ) ) {
			wp_die( 'Action non autorisée.' );
		}

		global $wpdb;
		$table  = self::table_reservations();
		$lignes = $wpdb->get_results( "SELECT nom, email, places, cree_le FROM {$table} ORDER BY cree_le ASC", ARRAY_A );

		nocache_headers();
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename=reservations-un-seul-nom.csv' );

		$sortie = fopen( 'php://output', 'w' );
		fprintf( $sortie, chr( 0xEF ) . chr( 0xBB ) . chr( 0xBF ) ); // BOM, pour Excel.
		fputcsv( $sortie, array( 'Nom', 'E-mail', 'Places', 'Date' ), ';' );
		foreach ( $lignes as $l ) {
			fputcsv( $sortie, array( $l['nom'], $l['email'], $l['places'], $l['cree_le'] ), ';' );
		}
		fclose( $sortie );
		exit;
	}
}

register_activation_hook( __FILE__, array( 'USN_Reservations', 'activer' ) );
add_action( 'plugins_loaded', array( 'USN_Reservations', 'init' ) );
