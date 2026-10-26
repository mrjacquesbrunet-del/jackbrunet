<?php
/**
 * Plugin Name: Un Seul Nom - Reservations
 * Description: Reservation de places pour les evenements Un Seul Nom : compteur de places, limite par reservation, liste des inscrits et export CSV. Une ville apres l'autre, sans perdre les inscrits des precedentes.
 * Version:     1.4.0
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

	const VERSION        = '1.4.0';
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

	// Presence et relance.
	const OPT_TAUX          = 'usn_taux_presence';  // taux constate, en pour cent
	const OPT_EXP_NOM       = 'usn_exp_nom';
	const OPT_EXP_EMAIL     = 'usn_exp_email';
	const OPT_RELANCE_SUJET = 'usn_relance_sujet';
	const OPT_RELANCE_HTML  = 'usn_relance_html';
	const OPT_PIECE_URL     = 'usn_piece_url';      // le billet PDF, dans la mediatheque
	const OPT_RELANCE_ETAT  = 'usn_relance_etat';   // la file en cours
	const OPT_RELANCE_FIN   = 'usn_relance_fin';    // le resultat du dernier envoi

	/* QUI PEUT FAIRE QUOI.
	 *
	 * Le jour J, c'est un benevole qui tient l'entree, pas le
	 * proprietaire du site. Il lui faut voir la liste et pointer les
	 * presents — il n'a aucune raison de pouvoir changer la cle API ni
	 * d'envoyer quatre cents courriels. Un compte « Editeur » suffit
	 * pour la salle ; les reglages restent aux administrateurs. */
	const CAP_GERER  = 'edit_pages';
	const CAP_REGLER = 'manage_options';

	// Les caracteres d'un jeton. Ni O ni 0, ni I ni 1 ni L : un jeton se
	// lit parfois a voix haute au telephone.
	const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

	// Nom donne aux reservations prises avant la version 1.1, quand le
	// module ne savait pas encore de quelle ville il s'agissait.
	const AVANT = 'Edition precedente';

	/** La table des evenements, un par ville. */
	public static function table_evenements() {
		global $wpdb;
		return $wpdb->prefix . 'usn_evenements';
	}

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
		add_action( 'admin_post_usn_tester_brevo', array( __CLASS__, 'tester_brevo' ) );
		add_action( 'admin_post_usn_marquer', array( __CLASS__, 'marquer' ) );
		add_action( 'admin_post_usn_relance', array( __CLASS__, 'relance_paquet' ) );
		// Les deux liens du courriel de relance sont interceptes avant
		// que WordPress ne decide quoi afficher : aucune page a creer.
		add_action( 'init', array( __CLASS__, 'intercepter_reponse' ) );

		/* LE RAPPEL PART TOUT SEUL.
		 *
		 * Toutes les heures, le module regarde si une ville entre dans
		 * sa fenetre de rappel — l'avant-veille — et envoie a ceux qui
		 * n'ont encore rien recu. Soixante messages par passage : une
		 * tache planifiee qui s'eternise se fait couper, et on ne sait
		 * plus qui a recu quoi. */
		add_action( 'usn_rappel_horaire', array( __CLASS__, 'rappel_automatique' ) );
		if ( ! wp_next_scheduled( 'usn_rappel_horaire' ) ) {
			wp_schedule_event( time() + 300, 'hourly', 'usn_rappel_horaire' );
		}
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

		/* LA VILLE EN COURS DEVIENT LA PREMIERE LIGNE DE LA TABLE.
		 *
		 * Rien n'est efface. Le compteur, la capacite et la limite par
		 * reservation sont recopies depuis les reglages, puis chaque
		 * reservation est rattachee a sa ville par son nom. Les villes
		 * passees retrouvent ainsi leur ligne elles aussi. */
		$evts = self::table_evenements();
		$noms = $wpdb->get_col( "SELECT DISTINCT evenement FROM {$table} WHERE evenement <> ''" );
		$courante = trim( (string) get_option( self::OPT_EVENEMENT, '' ) );
		if ( '' !== $courante && ! in_array( $courante, $noms, true ) ) {
			$noms[] = $courante;
		}
		foreach ( $noms as $nom ) {
			$deja = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$evts} WHERE nom = %s", $nom ) );
			if ( $deja ) {
				continue;
			}
			$actuelle = ( $nom === $courante );
			$wpdb->insert(
				$evts,
				array(
					'nom'        => $nom,
					'capacite'   => $actuelle ? max( 0, (int) get_option( self::OPT_CAPACITE, 400 ) ) : 0,
					'max_places' => max( 1, (int) get_option( self::OPT_MAX, 4 ) ),
					// Une ville passee ne reprend pas d'inscriptions.
					'ouvert'     => $actuelle ? (int) get_option( self::OPT_OUVERT, 1 ) : 0,
					'reservees'  => $actuelle
						? (int) $wpdb->get_var( "SELECT reservees FROM " . self::table_compteur() . " WHERE id = 1" )
						: (int) $wpdb->get_var( $wpdb->prepare( "SELECT COALESCE(SUM(places),0) FROM {$table} WHERE evenement = %s AND confirme <> %d", $nom, self::ANNULE ) ),
					'cree_le'    => current_time( 'mysql' ),
				),
				array( '%s', '%d', '%d', '%d', '%d', '%s' )
			);
		}
		// Chaque reservation retrouve sa ville.
		$wpdb->query(
			"UPDATE {$table} r JOIN {$evts} e ON e.nom = r.evenement
			 SET r.evenement_id = e.id WHERE r.evenement_id = 0"
		);

		// Les reservations prises avant la 1.3 n'ont pas de jeton : sans
		// lui, leurs liens « je viens » et « je libere ma place » ne
		// meneraient nulle part.
		$sans = $wpdb->get_col( "SELECT id FROM {$table} WHERE jeton = '' LIMIT 3000" );
		foreach ( $sans as $id ) {
			$wpdb->update( $table, array( 'jeton' => self::jeton_libre() ), array( 'id' => (int) $id ), array( '%s' ), array( '%d' ) );
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
		$evenements   = self::table_evenements();

		dbDelta(
			"CREATE TABLE {$reservations} (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				nom VARCHAR(120) NOT NULL,
				email VARCHAR(190) NOT NULL,
				places TINYINT UNSIGNED NOT NULL DEFAULT 1,
				evenement VARCHAR(80) NOT NULL DEFAULT '',
				evenement_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
				confirme TINYINT UNSIGNED NOT NULL DEFAULT 0,
				rappel_envoye TINYINT UNSIGNED NOT NULL DEFAULT 0,
				jeton VARCHAR(24) NOT NULL DEFAULT '',
				ip VARCHAR(45) NOT NULL DEFAULT '',
				cree_le DATETIME NOT NULL,
				PRIMARY KEY  (id),
				KEY email (email),
				KEY evenement (evenement),
				KEY evenement_id (evenement_id),
				KEY jeton (jeton),
				KEY confirme (confirme),
				KEY cree_le (cree_le)
			) {$charset};"
		);

		/*
		 * Le compteur vit dans sa propre table plutot que dans les options :
		 * il faut pouvoir l'incrementer de facon atomique, ce que les options
		 * WordPress (mises en cache) ne permettent pas de facon fiable.
		 */
		/* PLUSIEURS VILLES A LA FOIS.
		 *
		 * Jusqu'a la 1.3, une seule ville pouvait prendre des
		 * reservations : ouvrir Limours aurait ferme Tarbes. Elles sont
		 * pourtant a trois semaines d'intervalle, et il faut bien que
		 * les deux soient ouvertes en decembre.
		 *
		 * Chaque ville a donc sa ligne, et surtout SON COMPTEUR. C'est
		 * lui qui porte l'increment atomique : la condition est evaluee
		 * par la base au moment de l'ecriture, donc deux personnes qui
		 * prennent la derniere place au meme instant ne peuvent pas
		 * l'avoir toutes les deux. */
		dbDelta(
			"CREATE TABLE {$evenements} (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				nom VARCHAR(80) NOT NULL,
				capacite INT UNSIGNED NOT NULL DEFAULT 400,
				max_places TINYINT UNSIGNED NOT NULL DEFAULT 4,
				ouvert TINYINT UNSIGNED NOT NULL DEFAULT 1,
				reservees INT UNSIGNED NOT NULL DEFAULT 0,
				date_evenement DATE NULL,
				ferme_le DATETIME NULL,
				rappel_le DATETIME NULL,
				rappel_fait TINYINT UNSIGNED NOT NULL DEFAULT 0,
				cree_le DATETIME NOT NULL,
				PRIMARY KEY  (id),
				UNIQUE KEY nom (nom)
			) {$charset};"
		);

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
		add_option( self::OPT_TAUX, 50 );
		update_option( self::OPT_DB_VERSION, self::VERSION );
	}

	/* ------------------------------------------------------------------ */
	/* La ville en cours                                                   */
	/* ------------------------------------------------------------------ */

	/** L'evenement regarde en ce moment. Resolu une fois par requete. */
	protected static $courant = null;

	/**
	 * Trouve un evenement par son numero ou par son nom.
	 *
	 * Sans rien, c'est celui qui est marque par defaut dans les
	 * reglages ; a defaut, le plus recemment cree qui soit ouvert.
	 */
	public static function trouver_evenement( $ref = '' ) {
		global $wpdb;
		$evts = self::table_evenements();
		$ref  = is_string( $ref ) ? trim( $ref ) : $ref;

		if ( is_numeric( $ref ) && (int) $ref > 0 ) {
			$ligne = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$evts} WHERE id = %d", (int) $ref ) );
			if ( $ligne ) {
				return $ligne;
			}
		}
		if ( is_string( $ref ) && '' !== $ref ) {
			$ligne = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$evts} WHERE nom = %s", $ref ) );
			if ( $ligne ) {
				return $ligne;
			}
		}

		$defaut = trim( (string) get_option( self::OPT_EVENEMENT, '' ) );
		if ( '' !== $defaut ) {
			$ligne = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$evts} WHERE nom = %s", $defaut ) );
			if ( $ligne ) {
				return $ligne;
			}
		}
		return $wpdb->get_row( "SELECT * FROM {$evts} ORDER BY ouvert DESC, id DESC LIMIT 1" );
	}

	/** Designe l'evenement sur lequel porte la requete en cours. */
	public static function definir_evenement( $ref ) {
		self::$courant = self::trouver_evenement( $ref );
		return self::$courant;
	}

	/** L'evenement courant, sous forme de ligne. Peut etre nul. */
	public static function ev() {
		if ( null === self::$courant ) {
			self::$courant = self::trouver_evenement( '' );
		}
		return self::$courant;
	}

	public static function evenements() {
		global $wpdb;
		$evts = self::table_evenements();
		return $wpdb->get_results( "SELECT * FROM {$evts} ORDER BY ouvert DESC, id DESC" );
	}

	public static function evenement() {
		$ev = self::ev();
		return $ev ? (string) $ev->nom : self::AVANT;
	}

	public static function evenement_id() {
		$ev = self::ev();
		return $ev ? (int) $ev->id : 0;
	}

	/**
	 * Cree une ville, ou modifie celle que l'on regarde.
	 *
	 * Plus rien n'est remis a zero : chaque ville a son compteur. Ouvrir
	 * Limours ne touche donc pas a Tarbes, et les deux peuvent prendre
	 * des reservations en meme temps — elles sont a trois semaines
	 * d'intervalle.
	 */
	public static function ouvrir_nouvelle_ville() {
		if ( ! current_user_can( self::CAP_REGLER )
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
		$evts = self::table_evenements();
		$lire = function ( $cle, $defaut ) {
			return isset( $_POST[ $cle ] ) ? sanitize_text_field( wp_unslash( $_POST[ $cle ] ) ) : $defaut;
		};

		$champs = array(
			'capacite'       => max( 0, (int) $lire( 'usn_capacite', 400 ) ),
			'max_places'     => max( 1, min( 20, (int) $lire( 'usn_max', 4 ) ) ),
			'ouvert'         => isset( $_POST['usn_ouvert'] ) ? 1 : 0,
			'date_evenement' => '' === $lire( 'usn_date', '' ) ? null : $lire( 'usn_date', '' ),
			'ferme_le'       => '' === $lire( 'usn_ferme', '' ) ? null : str_replace( 'T', ' ', $lire( 'usn_ferme', '' ) ) . ':00',
		);

		$existe = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$evts} WHERE nom = %s", $nom ) );
		if ( $existe ) {
			$wpdb->update( $evts, $champs, array( 'id' => (int) $existe ), array( '%d', '%d', '%d', '%s', '%s' ), array( '%d' ) );
		} else {
			$champs['nom']     = $nom;
			$champs['cree_le'] = current_time( 'mysql' );
			$wpdb->insert( $evts, $champs );
		}

		// La ville que l'on vient de toucher devient celle que les pages
		// servent par defaut, si elles ne demandent rien d'autre.
		update_option( self::OPT_EVENEMENT, $nom );
		self::definir_evenement( $nom );

		/* La liste Brevo est creee tout de suite, avant la premiere
		   inscription : si la cle est mauvaise, on l'apprend maintenant
		   et non le soir de l'ouverture des reservations.

		   LA VERSION 1.2.0 LE FAISAIT EN SILENCE. Quand l'appel echouait
		   — cle absente, cle refusee, sortie reseau fermee — il ne se
		   passait rien du tout : pas de liste, et pas un mot pour le
		   dire. On cherchait dans Brevo une liste qui n'avait jamais pu
		   etre creee. Le resultat est desormais annonce. */
		$suite = 'ville-ouverte';
		if ( self::brevo_actif() ) {
			self::brevo_preparer_attributs();
			$suite = self::brevo_liste( $nom ) > 0 ? 'ville-ouverte' : 'ville-sans-liste';
		} else {
			$suite = 'ville-sans-cle';
		}

		wp_safe_redirect( add_query_arg( 'usn_message', $suite, admin_url( 'admin.php?page=usn-reservations' ) ) );
		exit;
	}

	/* ------------------------------------------------------------------ */
	/* Reglages                                                            */
	/* ------------------------------------------------------------------ */

	public static function capacite() {
		$ev = self::ev();
		return $ev ? max( 0, (int) $ev->capacite ) : 0;
	}

	public static function max_par_personne() {
		$ev = self::ev();
		return $ev ? max( 1, min( 20, (int) $ev->max_places ) ) : 4;
	}

	/**
	 * Les inscriptions sont-elles ouvertes ?
	 *
	 * Trois conditions, et la date en fait partie : on oublie toujours
	 * de fermer, et une inscription qui arrive le lendemain de
	 * l'evenement ne sert personne.
	 */
	public static function inscriptions_ouvertes() {
		$ev = self::ev();
		if ( ! $ev || ! (int) $ev->ouvert ) {
			return false;
		}
		if ( ! empty( $ev->ferme_le ) && current_time( 'mysql' ) >= $ev->ferme_le ) {
			return false;
		}
		return true;
	}

	public static function places_reservees() {
		$ev = self::ev();
		return $ev ? (int) $ev->reservees : 0;
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
			// La page peut afficher le nom de la ville qu'elle sert, et
			// verifier qu'elle parle bien de la bonne.
			'evenement' => self::evenement(),
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
				'args'                => array(
					'v' => array( 'required' => false, 'type' => 'string' ),
				),
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

	/**
	 * La ville demandee par la page.
	 *
	 * Sans rien, c'est celle par defaut : une page ecrite avant la 1.4
	 * continue donc de fonctionner telle quelle.
	 */
	public static function route_evenement( WP_REST_Request $requete ) {
		$ref = (string) $requete->get_param( 'v' );
		self::definir_evenement( $ref );
	}

	public static function route_places( WP_REST_Request $requete ) {
		self::route_evenement( $requete );
		return new WP_REST_Response( self::etat(), 200 );
	}

	public static function route_reserver( WP_REST_Request $requete ) {
		self::definir_evenement( (string) $requete->get_param( 'evenement' ) );
		if ( ! self::ev() ) {
			return new WP_REST_Response(
				array( 'ok' => false, 'erreur' => 'evenement', 'message' => 'Aucun événement ouvert.' ),
				503
			);
		}
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
		$evts   = self::table_evenements();
		$ev_id  = self::evenement_id();

		/*
		 * Increment atomique : la condition est evaluee par la base de donnees
		 * au moment de l'ecriture. Si deux personnes reservent les dernieres
		 * places en meme temps, une seule des deux requetes modifie une ligne.
		 *
		 * La capacite est lue DANS LA MEME REQUETE, et non d'avance : entre
		 * une lecture et une ecriture separees, un autre visiteur a le temps
		 * de prendre la place.
		 */
		$modifiees = $wpdb->query(
			$wpdb->prepare(
				"UPDATE {$evts} SET reservees = reservees + %d WHERE id = %d AND reservees + %d <= capacite",
				$places,
				$ev_id,
				$places
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
				'evenement_id' => $ev_id,
				'jeton'     => self::jeton_libre(),
				'ip'        => self::ip_visiteur(),
				'cree_le'   => current_time( 'mysql' ),
			),
			array( '%s', '%s', '%d', '%s', '%d', '%s', '%s', '%s' )
		);

		if ( false === $insere ) {
			// On rend les places pour ne pas les perdre.
			$wpdb->query(
				$wpdb->prepare( "UPDATE {$evts} SET reservees = GREATEST(0, reservees - %d) WHERE id = %d", $places, $ev_id )
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

	/**
	 * L'ECRAN DE L'ENTREE.
	 *
	 * Une page a lui, parce qu'on ne tient pas une porte avec un
	 * tableau de bord. Un champ de recherche, des noms, un gros bouton,
	 * et le compte de ceux qui sont deja dans la salle. Rien d'autre.
	 *
	 * Il tient dans un telephone, et un compte Editeur suffit.
	 */
	public static function page_entree() {
		if ( ! current_user_can( self::CAP_GERER ) ) {
			return;
		}
		global $wpdb;
		if ( isset( $_GET['ev'] ) ) {
			self::definir_evenement( sanitize_text_field( wp_unslash( $_GET['ev'] ) ) );
		}
		$table = self::table_reservations();
		$ville = self::evenement();
		$c     = self::chiffres();

		$cherche = isset( $_GET['q'] ) ? trim( sanitize_text_field( wp_unslash( $_GET['q'] ) ) ) : '';
		$lignes  = array();
		if ( '' !== $cherche ) {
			$comme  = '%' . $wpdb->esc_like( $cherche ) . '%';
			$lignes = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT * FROM {$table}
					 WHERE evenement = %s AND confirme <> %d
					   AND ( nom LIKE %s OR email LIKE %s OR jeton LIKE %s )
					 ORDER BY nom LIMIT 40",
					$ville,
					self::ANNULE,
					$comme,
					$comme,
					$wpdb->esc_like( $cherche ) . '%'
				)
			);
		}
		?>
		<div class="wrap" style="max-width:720px">
			<h1>Entrée — <?php echo esc_html( $ville ); ?></h1>

			<div style="display:flex;gap:12px;flex-wrap:wrap;margin:18px 0">
				<div style="flex:1;min-width:150px;background:#1B2FC4;color:#fff;border-radius:8px;padding:16px 20px">
					<div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;opacity:.8">Dans la salle</div>
					<div style="font-size:38px;font-weight:700;line-height:1.1"><?php echo (int) $c['presentes']; ?></div>
				</div>
				<div style="flex:1;min-width:150px;background:#fff;border:1px solid #dcdcde;border-radius:8px;padding:16px 20px">
					<div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#646970">Attendus</div>
					<div style="font-size:38px;font-weight:700;line-height:1.1"><?php echo (int) $c['attendues']; ?></div>
				</div>
			</div>

			<form method="get" action="">
				<input type="hidden" name="page" value="usn-entree">
				<?php if ( isset( $_GET['ev'] ) ) : ?>
					<input type="hidden" name="ev" value="<?php echo esc_attr( sanitize_text_field( wp_unslash( $_GET['ev'] ) ) ); ?>">
				<?php endif; ?>
				<input type="search" name="q" value="<?php echo esc_attr( $cherche ); ?>"
					placeholder="Trois lettres du nom suffisent" autofocus
					style="width:100%;font-size:20px;padding:14px 16px;border-radius:8px;border:2px solid #1B2FC4">
				<p class="description" style="margin-top:6px">
					Tapez le début du nom, l'adresse, ou la référence du billet. Puis
					<strong>Présent</strong>. Le compteur du haut suit en direct.
				</p>
			</form>

			<?php if ( '' !== $cherche ) : ?>
				<?php if ( empty( $lignes ) ) : ?>
					<p style="font-size:17px;margin-top:24px">
						Personne ne correspond à « <strong><?php echo esc_html( $cherche ); ?></strong> ».
						Essayez avec moins de lettres, ou vérifiez l'orthographe.
					</p>
				<?php else : ?>
					<div style="margin-top:20px">
						<?php foreach ( $lignes as $l ) : ?>
							<?php $present = self::PRESENT === (int) $l->confirme; ?>
							<div style="display:flex;align-items:center;gap:14px;background:#fff;border:1px solid #dcdcde;
								<?php echo $present ? 'border-left:5px solid #00a32a;' : ''; ?>
								border-radius:8px;padding:14px 16px;margin-bottom:10px;flex-wrap:wrap">
								<div style="flex:1;min-width:160px">
									<div style="font-size:19px;font-weight:700"><?php echo esc_html( $l->nom ); ?></div>
									<div style="font-size:13px;color:#646970">
										<?php echo (int) $l->places; ?> place(s)
										<?php if ( self::CONFIRME === (int) $l->confirme ) : ?>
											· <span style="color:#00a32a">a confirmé</span>
										<?php endif; ?>
										· <?php echo esc_html( $l->email ); ?>
									</div>
								</div>
								<a class="button <?php echo $present ? '' : 'button-primary'; ?>"
									style="font-size:17px;padding:10px 26px;height:auto"
									href="<?php
									echo esc_url(
										admin_url(
											'admin-post.php?action=usn_marquer&retour=entree&q=' . rawurlencode( $cherche )
											. '&id=' . (int) $l->id
											. '&etat=' . ( $present ? self::CONFIRME : self::PRESENT )
											. '&_wpnonce=' . wp_create_nonce( 'usn_marquer' )
										)
									);
									?>">
									<?php echo $present ? 'Annuler' : 'Présent'; ?>
								</a>
							</div>
						<?php endforeach; ?>
					</div>
				<?php endif; ?>
			<?php endif; ?>
		</div>
		<?php
	}

	public static function menu_admin() {
		add_menu_page(
			'Réservations Un Seul Nom',
			'Réservations',
			self::CAP_GERER,
			'usn-reservations',
			array( __CLASS__, 'page_admin' ),
			'dashicons-tickets-alt',
			26
		);

		add_submenu_page(
			'usn-reservations',
			'Entrée',
			'Entrée (jour J)',
			self::CAP_GERER,
			'usn-entree',
			array( __CLASS__, 'page_entree' )
		);
	}

	public static function enregistrer_reglages() {
		register_setting( 'usn_reservations', self::OPT_CAPACITE, array( 'type' => 'integer', 'sanitize_callback' => 'absint' ) );
		register_setting( 'usn_reservations', self::OPT_MAX, array( 'type' => 'integer', 'sanitize_callback' => 'absint' ) );
		register_setting( 'usn_reservations', self::OPT_OUVERT, array( 'type' => 'integer', 'sanitize_callback' => 'absint' ) );
		register_setting( 'usn_reservations', self::OPT_BREVO_CLE, array( 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ) );
		register_setting( 'usn_reservations', self::OPT_TAUX, array( 'type' => 'integer', 'sanitize_callback' => 'absint' ) );
		register_setting( 'usn_reservations', self::OPT_EXP_NOM, array( 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ) );
		register_setting( 'usn_reservations', self::OPT_EXP_EMAIL, array( 'type' => 'string', 'sanitize_callback' => 'sanitize_email' ) );
		register_setting( 'usn_reservations', self::OPT_RELANCE_SUJET, array( 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ) );
		register_setting( 'usn_reservations', self::OPT_PIECE_URL, array( 'type' => 'string', 'sanitize_callback' => 'esc_url_raw' ) );
		// Le message porte du HTML : « wp_kses_post » laisse passer les
		// liens et la mise en forme, et rien de dangereux.
		register_setting( 'usn_reservations', self::OPT_RELANCE_HTML, array( 'type' => 'string', 'sanitize_callback' => 'wp_kses_post' ) );
	}

	public static function page_admin() {
		if ( ! current_user_can( self::CAP_GERER ) ) {
			return;
		}
		global $wpdb;
		// La ville regardee se choisit dans l'adresse : c'est ce qui
		// permet de suivre Tarbes et Limours en meme temps.
		if ( isset( $_GET['ev'] ) ) {
			self::definir_evenement( sanitize_text_field( wp_unslash( $_GET['ev'] ) ) );
		}
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
		} elseif ( 'ville-sans-liste' === $message ) {
			printf(
				'<div class="notice notice-error is-dismissible"><p>Les réservations sont ouvertes pour <strong>%s</strong>, '
				. 'mais <strong>la liste Brevo n\'a pas pu être créée</strong>. Le détail est dans « Dernier échange avec Brevo », '
				. 'plus bas. Les inscriptions fonctionnent, elles n\'iront simplement pas dans une liste au nom de la ville.</p></div>',
				esc_html( $ville )
			);
		} elseif ( 'ville-sans-cle' === $message ) {
			printf(
				'<div class="notice notice-warning is-dismissible"><p>Les réservations sont ouvertes pour <strong>%s</strong>. '
				. '<strong>Aucune clé API Brevo n\'est enregistrée</strong> : aucune liste n\'a été créée. '
				. 'Collez la clé dans les réglages, puis rouvrez la ville.</p></div>',
				esc_html( $ville )
			);
		} elseif ( 'brevo-teste' === $message ) {
			$j = self::brevo_journal();
			if ( ! empty( $j['ok'] ) ) {
				printf(
					'<div class="notice notice-success is-dismissible"><p><strong>Brevo répond.</strong> Compte : %s</p></div>',
					esc_html( isset( $j['message'] ) ? $j['message'] : '' )
				);
			} else {
				printf(
					'<div class="notice notice-error is-dismissible"><p><strong>Brevo ne répond pas.</strong> %s</p></div>',
					esc_html( ( isset( $j['code'] ) ? $j['code'] . ' ' : '' ) . ( isset( $j['message'] ) ? $j['message'] : '' ) )
				);
			}
		} elseif ( 'nom-vide' === $message ) {
			echo '<div class="notice notice-error is-dismissible"><p>Il faut donner un nom à la ville.</p></div>';
		} elseif ( 'marque' === $message ) {
			echo '<div class="notice notice-success is-dismissible"><p>C\'est noté.</p></div>';
		} elseif ( 'relance-essai' === $message ) {
			echo '<div class="notice notice-success is-dismissible"><p><strong>L\'essai est parti</strong> vers votre adresse. Vérifiez l\'allure du message, la pièce jointe, et surtout <strong>que les deux boutons fonctionnent</strong> — les liens de l\'essai agissent pour de bon sur la dernière réservation enregistrée.</p></div>';
		} elseif ( 'relance-essai-rate' === $message ) {
			echo '<div class="notice notice-error is-dismissible"><p><strong>L\'essai n\'est pas parti.</strong> Le détail est dans « Dernier échange avec Brevo ». Le plus souvent, l\'adresse d\'expéditeur n\'est pas validée dans Brevo.</p></div>';
		} elseif ( 'relance-finie' === $message ) {
			echo '<div class="notice notice-success is-dismissible"><p>La relance est terminée.</p></div>';
		} elseif ( 'relance-arretee' === $message ) {
			echo '<div class="notice notice-warning is-dismissible"><p>Envoi interrompu. Ceux qui n\'ont pas encore reçu le message restent « sans réponse » : relancez quand vous voulez, ils ne recevront rien en double.</p></div>';
		}
		?>
		<div class="wrap">
			<h1>Réservations — Un Seul Nom</h1>

			<?php $toutes = self::evenements(); ?>
			<p style="font-size:14px;margin:14px 0 0">
				Ville regardée :
				<strong style="font-size:17px"><?php echo esc_html( $ville ); ?></strong>
			</p>
			<?php if ( count( $toutes ) > 1 ) : ?>
				<p style="margin:10px 0 0">
					<?php foreach ( $toutes as $t ) : ?>
						<?php $active = (int) $t->id === self::evenement_id(); ?>
						<a class="button <?php echo $active ? 'button-primary' : ''; ?>" style="margin-right:6px"
							href="<?php echo esc_url( add_query_arg( array( 'page' => 'usn-reservations', 'ev' => (int) $t->id ), admin_url( 'admin.php' ) ) ); ?>">
							<?php echo esc_html( $t->nom ); ?><?php echo (int) $t->ouvert ? '' : ' (fermée)'; ?>
						</a>
					<?php endforeach; ?>
				</p>
			<?php endif; ?>

			<?php $c = self::chiffres(); ?>

			<div style="display:flex;gap:16px;flex-wrap:wrap;margin:20px 0">
				<?php
				/* LE CHIFFRE QUI COMPTE EST LE DERNIER, PAS LE PREMIER.
				 *
				 * A Avignon, « 1300 places reservees » etait vrai et ne
				 * voulait rien dire. « Presence attendue » est une
				 * estimation, et c'est elle qui aurait fait choisir une
				 * autre salle. Elle est donc en couleur, et les autres
				 * en gris. */
				$cartes = array(
					array( 'Places ouvertes', $etat['capacite'], '#646970', '' ),
					array( 'Places réservées', $etat['reservees'], '#646970', '' ),
					array( 'Places restantes', $etat['restantes'], '#646970', '' ),
					array( 'Inscriptions', $total, '#646970', '' ),
					array( 'Présence attendue', $c['attendues'], '#1B2FC4',
						sprintf( '%d confirmées, %d non confirmées à %d %%', $c['confirmees'], $c['muettes'], $c['taux'] ) ),
				);
				foreach ( $cartes as $carte ) {
					printf(
						'<div style="background:#fff;border:1px solid %s;border-radius:8px;padding:16px 22px;min-width:150px">
							<div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:%s">%s</div>
							<div style="font-size:30px;font-weight:700;line-height:1.2;color:%s">%d</div>
							%s
						</div>',
						'#1B2FC4' === $carte[2] ? '#1B2FC4' : '#dcdcde',
						esc_attr( $carte[2] ),
						esc_html( $carte[0] ),
						'#1B2FC4' === $carte[2] ? '#1B2FC4' : 'inherit',
						(int) $carte[1],
						'' === $carte[3] ? '' : '<div style="font-size:11px;color:#646970;margin-top:3px">' . esc_html( $carte[3] ) . '</div>'
					);
				}
				?>
			</div>

			<div style="display:flex;gap:16px;flex-wrap:wrap;margin:0 0 24px">
				<?php
				$reponses = array(
					array( 'Confirmées', $c['confirmees'], '#00a32a' ),
					array( 'Pas encore confirmées', $c['muettes'], '#996800' ),
					array( 'Places libérées', $c['annulees'], '#646970' ),
					array( 'Présents pointés', $c['presentes'], '#1B2FC4' ),
				);
				foreach ( $reponses as $r ) {
					printf(
						'<div style="background:#fff;border:1px solid #dcdcde;border-left:4px solid %s;border-radius:6px;padding:10px 18px;min-width:130px">
							<div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#646970">%s</div>
							<div style="font-size:21px;font-weight:700">%d</div>
						</div>',
						esc_attr( $r[2] ),
						esc_html( $r[0] ),
						(int) $r[1]
					);
				}
				?>
			</div>

			<?php
			/* LA COURBE DES INSCRIPTIONS.
			 *
			 * Dessinee en HTML, sans aucune bibliotheque : trente barres
			 * et une hauteur en pour cent. C'est le creux qui previent,
			 * pas le pic — une semaine sans inscription, et il est temps
			 * de relancer les eglises. */
			$jours = self::par_jour( 30 );
			$haut  = 1;
			foreach ( $jours as $j ) {
				$haut = max( $haut, $j['places'] );
			}
			$somme = array_sum( wp_list_pluck( $jours, 'places' ) );
			?>
			<h2>Les trente derniers jours</h2>
			<p class="description" style="margin-top:-6px">
				<?php echo (int) $somme; ?> place(s) réservée(s) sur la période.
				Le creux prévient mieux que le pic : une semaine plate, et il est temps de relancer les églises.
			</p>
			<div style="background:#fff;border:1px solid #dcdcde;border-radius:8px;padding:18px 20px 12px;margin:10px 0 24px">
				<div style="display:flex;align-items:flex-end;gap:3px;height:110px">
					<?php foreach ( $jours as $j ) : ?>
						<div style="flex:1;min-width:4px;height:100%;display:flex;align-items:flex-end"
							title="<?php echo esc_attr( mysql2date( 'd/m/Y', $j['jour'] ) . ' : ' . $j['places'] . ' place(s)' ); ?>">
							<div style="width:100%;border-radius:2px 2px 0 0;background:<?php echo $j['places'] > 0 ? '#1B2FC4' : '#e8e8ea'; ?>;
								height:<?php echo (float) max( 2, $j['places'] / $haut * 100 ); ?>%"></div>
						</div>
					<?php endforeach; ?>
				</div>
				<div style="display:flex;justify-content:space-between;font-size:11px;color:#646970;margin-top:6px">
					<span><?php echo esc_html( mysql2date( 'd/m', $jours[0]['jour'] ) ); ?></span>
					<span>Maximum sur un jour : <?php echo (int) $haut; ?></span>
					<span><?php echo esc_html( mysql2date( 'd/m', $jours[ count( $jours ) - 1 ]['jour'] ) ); ?></span>
				</div>
			</div>

			<?php if ( current_user_can( self::CAP_REGLER ) ) : ?>
			<h2>Réglages</h2>
			<form method="post" action="options.php" id="usn-reglages">
				<?php settings_fields( 'usn_reservations' ); ?>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row">Taux de présence constaté</th>
						<td>
							<input name="<?php echo esc_attr( self::OPT_TAUX ); ?>" type="number" min="1" max="100"
								class="small-text" value="<?php echo (int) self::taux_presence(); ?>"> %
							<p class="description" style="max-width:48em">
								La part des inscrits <strong>sans réponse</strong> qui vient vraiment.
								À Avignon&nbsp;: environ 450 présents pour 1300 places, soit <strong>35&nbsp;%</strong>.
								Les places <em>confirmées</em>, elles, sont comptées à 90&nbsp;% — il y a toujours
								des empêchements de dernière minute.
							</p>
							<p class="description">
								Après chaque événement, reportez ici le taux réel que vous aurez pointé à
								l'entrée. C'est ce chiffre qui rendra l'estimation juste pour la ville suivante.
							</p>
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
									<strong><?php echo $vert ? 'Dernier échange avec Brevo : réussi' : 'Dernier échange avec Brevo : ÉCHEC'; ?></strong><br>
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
							$listes = is_array( $listes ) ? $listes : array();
							?>
							<p style="margin-top:12px">
								<a class="button"
									href="<?php echo esc_url( admin_url( 'admin-post.php?action=usn_tester_brevo&_wpnonce=' . wp_create_nonce( 'usn_tester_brevo' ) ) ); ?>">
									Tester la connexion Brevo
								</a>
								<span class="description" style="margin-left:8px">
									N'envoie rien : demande seulement à Brevo s'il reconnaît la clé.
								</span>
							</p>
							<p class="description" style="margin-top:10px">
								<strong>Liste de « <?php echo esc_html( $ville ); ?> » :</strong>
								<?php if ( ! empty( $listes[ $ville ] ) ) : ?>
									créée, numéro <?php echo (int) $listes[ $ville ]; ?>.
								<?php else : ?>
									<span style="color:#d63638">pas encore créée.</span>
									Enregistrez la clé, puis rouvrez la ville dans
									« Passer à la ville suivante » ci-dessous.
								<?php endif; ?>
								<?php if ( $listes ) : ?>
									<br>Toutes : <?php echo esc_html( implode( ', ', array_keys( $listes ) ) ); ?>
								<?php endif; ?>
							</p>
						</td>
					</tr>
				</table>
				<?php submit_button( 'Enregistrer' ); ?>
			</form>

			<h2>La ville : <?php echo esc_html( $ville ); ?></h2>
			<p class="description" style="max-width:62em">
				Chaque ville a <strong>sa jauge et son compteur</strong>. Ouvrir Limours
				ne touche pas à Tarbes&nbsp;: les deux peuvent prendre des réservations
				en même temps, et c'est bien le but — elles sont à trois semaines
				d'intervalle.
			</p>
			<p class="description" style="max-width:62em">
				Pour <strong>créer</strong> une ville, tapez un nom qui n'existe pas
				encore. Pour en <strong>modifier</strong> une, laissez son nom tel quel.
			</p>
			<?php $en_cours = self::ev(); ?>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<input type="hidden" name="action" value="usn_nouvelle_ville">
				<?php wp_nonce_field( 'usn_nouvelle_ville' ); ?>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="usn_ville">Nom de la ville</label></th>
						<td>
							<input name="usn_nouvelle_ville" id="usn_ville" type="text" maxlength="80"
								class="regular-text" placeholder="Tarbes 2026" required
								value="<?php echo esc_attr( $ville ); ?>">
							<p class="description">
								Ce nom sert à retrouver les inscrits plus tard, et c'est lui que
								la page du site demande. Mettez la ville et l'année&nbsp;:
								« Tarbes 2026 », « Limours 2027 ».
							</p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="usn_cap">Places ouvertes</label></th>
						<td>
							<input name="usn_capacite" id="usn_cap" type="number" min="0" step="1" class="small-text"
								value="<?php echo (int) self::capacite(); ?>">
							<p class="description">
								Total accepté, <strong>surbooking compris</strong>. Regardez la carte
								« présence attendue » plus haut&nbsp;: c'est elle qui dit si vous
								pouvez en ouvrir davantage.
							</p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="usn_max">Maximum par réservation</label></th>
						<td>
							<input name="usn_max" id="usn_max" type="number" min="1" max="20" step="1" class="small-text"
								value="<?php echo (int) self::max_par_personne(); ?>">
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="usn_date">Date de l'événement</label></th>
						<td>
							<input name="usn_date" id="usn_date" type="date"
								value="<?php echo esc_attr( $en_cours && $en_cours->date_evenement ? $en_cours->date_evenement : '' ); ?>">
							<p class="description">
								Sert au <strong>rappel automatique</strong>, envoyé l'avant-veille à 10h.
								Sans date, aucun rappel ne part tout seul.
							</p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="usn_ferme">Clôture des inscriptions</label></th>
						<td>
							<input name="usn_ferme" id="usn_ferme" type="datetime-local"
								value="<?php echo esc_attr( $en_cours && $en_cours->ferme_le ? str_replace( ' ', 'T', substr( $en_cours->ferme_le, 0, 16 ) ) : '' ); ?>">
							<p class="description">
								Passé cette date, les inscriptions se ferment toutes seules.
								<strong>Mettez le lendemain de l'événement</strong>&nbsp;: on peut encore
								s'inscrire le jour même, et plus jamais après.
							</p>
						</td>
					</tr>
					<tr>
						<th scope="row">Inscriptions</th>
						<td>
							<label>
								<input name="usn_ouvert" type="checkbox" value="1" <?php checked( $en_cours && (int) $en_cours->ouvert ); ?>>
								Ouvertes
							</label>
							<p class="description">Décochez pour fermer tout de suite, sans toucher au compteur.</p>
						</td>
					</tr>
				</table>
				<?php submit_button( 'Enregistrer cette ville' ); ?>
			</form>

			<h2>Le rappel avant l'événement</h2>
			<?php
			$file   = self::relance_etat();
			$fin    = get_option( self::OPT_RELANCE_FIN, array() );
			$fin    = is_array( $fin ) ? $fin : array();
			$exp    = self::expediteur();
			// Le rappel part a tout le monde, sauf aux places liberees.
			$vises  = (int) $c['confirmees'] + (int) $c['muettes'] + (int) $c['presentes'];
			$prets  = $vises > 0;
			$lien_r = function ( $etape ) {
				return admin_url(
					'admin-post.php?action=usn_relance&etape=' . $etape
					. '&_wpnonce=' . wp_create_nonce( 'usn_relance' )
				);
			};
			?>
			<p class="description" style="max-width:62em">
				Quelques jours avant, un rappel part à <strong>tous les inscrits</strong> — sauf
				ceux qui ont libéré leur place. Il donne le lieu, l'heure, et rappelle le billet
				en pièce jointe. <strong>Ce n'est pas une demande de réponse&nbsp;:</strong> personne
				n'ouvre un courriel pour rendre service à l'organisateur. Un rappel utile, oui.
			</p>
			<p class="description" style="max-width:62em">
				En bas du message, deux boutons&nbsp;: <strong>« Oui, je viens »</strong> et
				<strong>« Je libère ma place »</strong>. Ceux qui cliquent sont une minorité, et
				c'est normal — le calcul de la présence attendue en tient compte. Mais chaque
				place libérée <strong>retourne au compteur</strong> et repart à quelqu'un d'autre,
				et chaque confirmation rend l'estimation plus juste.
			</p>

			<table class="form-table" role="presentation">
				<tr>
					<th scope="row">Expéditeur</th>
					<td>
						<input name="<?php echo esc_attr( self::OPT_EXP_NOM ); ?>" form="usn-reglages" type="text"
							class="regular-text" placeholder="Un Seul Nom"
							value="<?php echo esc_attr( get_option( self::OPT_EXP_NOM, '' ) ); ?>">
						<input name="<?php echo esc_attr( self::OPT_EXP_EMAIL ); ?>" form="usn-reglages" type="email"
							class="regular-text" placeholder="contact@unseulnom.org"
							value="<?php echo esc_attr( get_option( self::OPT_EXP_EMAIL, '' ) ); ?>">
						<p class="description">
							Cette adresse doit être <strong>validée comme expéditeur dans Brevo</strong>,
							sinon Brevo refuse l'envoi. Enregistrez avec le bouton des réglages, plus haut.
						</p>
					</td>
				</tr>
				<tr>
					<th scope="row">Objet</th>
					<td>
						<input name="<?php echo esc_attr( self::OPT_RELANCE_SUJET ); ?>" form="usn-reglages" type="text"
							class="large-text" placeholder="Venez-vous toujours ? - <?php echo esc_attr( $ville ); ?>"
							value="<?php echo esc_attr( get_option( self::OPT_RELANCE_SUJET, '' ) ); ?>">
					</td>
				</tr>
				<tr>
					<th scope="row">Pièce jointe</th>
					<td>
						<input name="<?php echo esc_attr( self::OPT_PIECE_URL ); ?>" form="usn-reglages" type="url"
							class="large-text" placeholder="https://unseulnom.org/wp-content/uploads/.../billet.pdf"
							value="<?php echo esc_attr( get_option( self::OPT_PIECE_URL, '' ) ); ?>">
						<p class="description">
							L'adresse du billet PDF dans la médiathèque. Brevo va le chercher lui-même&nbsp;:
							il ne repasse pas par le site à chaque message. Laissez vide pour n'envoyer aucune
							pièce jointe.
						</p>
					</td>
				</tr>
				<tr>
					<th scope="row">Message</th>
					<td>
						<textarea name="<?php echo esc_attr( self::OPT_RELANCE_HTML ); ?>" form="usn-reglages"
							rows="9" class="large-text code"><?php echo esc_textarea( get_option( self::OPT_RELANCE_HTML, '' ) ); ?></textarea>
						<p class="description">
							Laissez vide pour le message par défaut. Repères disponibles&nbsp;:
							<code>{NOM}</code>, <code>{PLACES}</code>, <code>{VILLE}</code>,
							<code>{BOUTONS}</code> (les deux boutons),
							<code>{CONFIRMER}</code> et <code>{ANNULER}</code> (les deux adresses seules).
						</p>
					</td>
				</tr>
			</table>

			<?php if ( $file ) : ?>
				<?php $faits = (int) $file['envoyes'] + (int) $file['echecs']; ?>
				<div class="notice notice-info" style="padding:14px 16px">
					<p style="margin:0 0 10px">
						<strong>Envoi en cours :</strong>
						<?php echo (int) $faits; ?> sur <?php echo (int) $file['total']; ?>
						<?php if ( (int) $file['echecs'] > 0 ) : ?>
							<span style="color:#d63638">(<?php echo (int) $file['echecs']; ?> échec(s))</span>
						<?php endif; ?>
					</p>
					<div style="height:10px;background:#e8e8ea;border-radius:99px;overflow:hidden;max-width:420px">
						<div style="height:100%;background:#1B2FC4;width:<?php echo (float) ( $file['total'] > 0 ? $faits / $file['total'] * 100 : 0 ); ?>%"></div>
					</div>
					<p style="margin:12px 0 0">
						<a class="button button-primary" href="<?php echo esc_url( $lien_r( 'suite' ) ); ?>">Continuer</a>
						<a class="button" href="<?php echo esc_url( $lien_r( 'arreter' ) ); ?>">Arrêter</a>
					</p>
				</div>
				<?php if ( isset( $_GET['usn_reprendre'] ) ) : ?>
					<script>setTimeout(function () { window.location.href = <?php echo wp_json_encode( $lien_r( 'suite' ) ); ?>; }, 1200);</script>
				<?php endif; ?>
			<?php else : ?>
				<?php if ( ! empty( $fin ) ) : ?>
					<p class="description">
						Dernier envoi&nbsp;: <strong><?php echo (int) $fin['envoyes']; ?></strong> message(s) partis,
						<?php echo (int) $fin['echecs']; ?> échec(s), le
						<?php echo esc_html( mysql2date( 'd/m/Y à H:i', $fin['debut'] ) ); ?>.
					</p>
				<?php endif; ?>
				<p>
					<a class="button" href="<?php echo esc_url( $lien_r( 'test' ) ); ?>">
						M'envoyer un essai
					</a>
					<a class="button button-primary" href="<?php echo esc_url( $lien_r( 'demarrer' ) ); ?>"
						onclick="return confirm(<?php echo wp_json_encode( sprintf( 'Envoyer le rappel a %d inscrit(s) ?', $vises ) ); ?>);"
						<?php echo $prets ? '' : 'style="pointer-events:none;opacity:.5"'; ?>>
						Envoyer le rappel (<?php echo (int) $vises; ?>)
					</a>
					<span class="description" style="margin-left:8px">
						<?php if ( '' === $exp['email'] ) : ?>
							<span style="color:#d63638">Renseignez d'abord l'adresse d'expéditeur.</span>
						<?php elseif ( ! $prets ) : ?>
							Aucun inscrit pour le moment.
						<?php else : ?>
							Faites toujours un essai avant. L'envoi part par paquets de <?php echo (int) self::PAQUET; ?>.
						<?php endif; ?>
					</span>
				</p>
			<?php endif; ?>
			<?php endif; ?>

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
				<thead><tr><th>Date</th><th>Nom</th><th>E-mail</th><th style="width:70px">Places</th><th style="width:150px">Réponse</th><th style="width:130px">Le jour J</th></tr></thead>
				<tbody>
				<?php if ( empty( $lignes ) ) : ?>
					<tr><td colspan="6">Aucune réservation pour le moment.</td></tr>
				<?php else : ?>
					<?php
					$etiquettes = array(
						self::SANS_REPONSE => array( 'Pas confirmée', '#996800' ),
						self::CONFIRME     => array( 'Confirmée', '#00a32a' ),
						self::ANNULE       => array( 'Place libérée', '#646970' ),
						self::PRESENT      => array( 'Présent', '#1B2FC4' ),
					);
					?>
					<?php foreach ( $lignes as $l ) : ?>
						<?php
						$etat_ligne = isset( $etiquettes[ (int) $l->confirme ] )
							? $etiquettes[ (int) $l->confirme ]
							: $etiquettes[ self::SANS_REPONSE ];
						$present = self::PRESENT === (int) $l->confirme;
						?>
						<tr<?php echo self::ANNULE === (int) $l->confirme ? ' style="opacity:.55"' : ''; ?>>
							<td><?php echo esc_html( mysql2date( 'd/m/Y H:i', $l->cree_le ) ); ?></td>
							<td><strong><?php echo esc_html( $l->nom ); ?></strong></td>
							<td><?php echo esc_html( $l->email ); ?></td>
							<td><?php echo (int) $l->places; ?></td>
							<td><span style="color:<?php echo esc_attr( $etat_ligne[1] ); ?>;font-weight:600"><?php echo esc_html( $etat_ligne[0] ); ?></span></td>
							<td>
								<a class="button <?php echo $present ? '' : 'button-primary'; ?>"
									href="<?php
									echo esc_url(
										admin_url(
											'admin-post.php?action=usn_marquer&id=' . (int) $l->id
											. '&etat=' . ( $present ? self::CONFIRME : self::PRESENT )
											. '&_wpnonce=' . wp_create_nonce( 'usn_marquer' )
										)
									);
									?>">
									<?php echo $present ? 'Annuler' : 'Présent'; ?>
								</a>
							</td>
						</tr>
					<?php endforeach; ?>
				<?php endif; ?>
				</tbody>
			</table>

			<p class="description" style="max-width:62em">
				<strong>Le jour J.</strong> Ouvrez cette page sur un téléphone à l'entrée et
				pointez les arrivants. C'est ce pointage qui donnera le <em>vrai</em> taux de
				présence — celui à reporter dans les réglages pour la ville suivante.
				Un compte <strong>Éditeur</strong> suffit pour cet écran&nbsp;: la clé API et
				l'envoi des relances restent aux administrateurs.
			</p>
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
		} else {
			// Un echec muet est pire qu'un echec : on garde de quoi
			// comprendre pourquoi la liste n'existe pas.
			self::brevo_consigner( $creation, 'creation de la liste', $ville );
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

	/**
	 * Demande son identite a Brevo, et rien d'autre.
	 *
	 * C'est le seul appel qui distingue les quatre pannes possibles, et
	 * elles n'ont pas le meme remede :
	 *
	 *   aucune cle        -> le champ est vide, ou n'a pas ete enregistre
	 *   401 / 403         -> la cle est fausse, revoquee, ou mal collee
	 *   code 0            -> le serveur ne sort pas sur internet
	 *   200               -> tout va bien, le probleme est ailleurs
	 */
	public static function tester_brevo() {
		if ( ! current_user_can( self::CAP_REGLER )
			|| ! isset( $_GET['_wpnonce'] )
			|| ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['_wpnonce'] ) ), 'usn_tester_brevo' ) ) {
			wp_die( 'Action non autorisée.' );
		}

		$reponse = self::brevo_appel( 'GET', '/account' );
		if ( $reponse['ok'] ) {
			$nom = '';
			if ( ! empty( $reponse['corps']['companyName'] ) ) {
				$nom = (string) $reponse['corps']['companyName'];
			} elseif ( ! empty( $reponse['corps']['email'] ) ) {
				$nom = (string) $reponse['corps']['email'];
			}
			$reponse['message'] = '' === $nom ? 'compte joint' : $nom;
		} elseif ( '' === $reponse['message'] ) {
			$reponse['message'] = 0 === $reponse['code']
				? 'le serveur du site n\'a pas pu joindre api.brevo.com'
				: 'code ' . $reponse['code'];
		}

		self::brevo_consigner( $reponse, 'test de la connexion', self::evenement() );
		wp_safe_redirect( add_query_arg( 'usn_message', 'brevo-teste', admin_url( 'admin.php?page=usn-reservations' ) ) );
		exit;
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

	/* ================================================================== */
	/* SAVOIR QUI VIENT VRAIMENT                                          */
	/*                                                                    */
	/* A Avignon : 1300 places reservees, environ 450 personnes dans la    */
	/* salle. Le chiffre affiche ne voulait rien dire, et on ne l'a su     */
	/* que le soir meme.                                                  */
	/*                                                                    */
	/* Trois manques, et chacun a sa reponse ici.                         */
	/*                                                                    */
	/* 1. LE CHIFFRE ETAIT FAUX. Des gens s'inscrivaient plusieurs fois,  */
	/*    faute de confirmation recue. Repare depuis la 1.1 : une adresse */
	/*    deja inscrite est refusee.                                      */
	/*                                                                    */
	/* 2. PERSONNE NE CONFIRMAIT. Une place reservee trois mois avant ne  */
	/*    dit rien de la soiree. Chaque reservation porte maintenant deux */
	/*    liens — « je viens » et « je libere ma place » — a mettre dans  */
	/*    le courriel de relance. Liberer une place la REND au compteur : */
	/*    elle repart a quelqu'un d'autre.                                */
	/*                                                                    */
	/* 3. ON NE VOYAIT RIEN VENIR. Le tableau de bord montre desormais la */
	/*    presence attendue, les reponses, et la courbe des inscriptions  */
	/*    jour par jour. Une salle qui se remplit trop vite ou pas du     */
	/*    tout se voit des la premiere semaine, pas la veille.            */
	/* ================================================================== */

	const SANS_REPONSE = 0;
	const CONFIRME     = 1;
	const ANNULE       = 2;
	const PRESENT      = 3;

	/** Le taux de presence attendu, en pour cent. */
	public static function taux_presence() {
		$t = (int) get_option( self::OPT_TAUX, 50 );
		return min( 100, max( 1, $t ) );
	}

	/**
	 * Le jeton d'une reservation : ce qui identifie la personne dans les
	 * liens « je viens » et « je libere ma place ».
	 *
	 * Vingt caracteres tires au hasard. Il n'est pas devinable, et c'est
	 * ce qui permet de s'en servir sans demander a personne de se
	 * connecter — on ne fera pas ouvrir un compte a quelqu'un pour qu'il
	 * dise qu'il vient.
	 */
	public static function jeton_libre() {
		global $wpdb;
		$table = self::table_reservations();
		for ( $essai = 0; $essai < 8; $essai++ ) {
			$jeton = '';
			for ( $i = 0; $i < 20; $i++ ) {
				$jeton .= self::ALPHABET[ random_int( 0, strlen( self::ALPHABET ) - 1 ) ];
			}
			if ( ! $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE jeton = %s", $jeton ) ) ) {
				return $jeton;
			}
		}
		return strtoupper( substr( md5( uniqid( '', true ) ), 0, 20 ) );
	}

	public static function lien_reponse( $jeton, $reponse ) {
		return add_query_arg(
			array( 'usn_rep' => $reponse, 'usn_j' => $jeton ),
			home_url( '/' )
		);
	}

	/**
	 * Les deux liens du courriel de relance.
	 *
	 * Ils ne passent par aucune page du site : le module les intercepte
	 * avant que WordPress ne decide quoi afficher. Rien a creer, rien a
	 * coller, ils marchent le jour ou l'extension est installee.
	 */
	public static function intercepter_reponse() {
		if ( empty( $_GET['usn_rep'] ) || empty( $_GET['usn_j'] ) ) {
			return;
		}
		$reponse = sanitize_key( wp_unslash( $_GET['usn_rep'] ) );
		$jeton   = sanitize_text_field( wp_unslash( $_GET['usn_j'] ) );

		global $wpdb;
		$table = self::table_reservations();
		$ligne = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE jeton = %s", $jeton ) );

		if ( ! $ligne ) {
			self::page_reponse(
				'Lien expir&eacute;',
				'Ce lien ne correspond &agrave; aucune r&eacute;servation. Il a peut-&ecirc;tre &eacute;t&eacute; coup&eacute; en deux par votre messagerie&nbsp;: essayez de le copier en entier dans la barre d\'adresse.',
				false
			);
		}

		if ( 'annule' === $reponse ) {
			// Deja annulee : on ne rend pas les places une seconde fois.
			if ( self::ANNULE !== (int) $ligne->confirme ) {
				$wpdb->update( $table, array( 'confirme' => self::ANNULE ), array( 'id' => (int) $ligne->id ), array( '%d' ), array( '%d' ) );
				$wpdb->query(
					$wpdb->prepare(
						"UPDATE " . self::table_evenements() . " SET reservees = GREATEST(0, reservees - %d) WHERE id = %d",
						(int) $ligne->places,
						(int) $ligne->evenement_id
					)
				);
			}
			self::page_reponse(
				'C\'est not&eacute;',
				sprintf(
					'Votre place est lib&eacute;r&eacute;e, elle repart &agrave; quelqu\'un d\'autre. Merci de nous l\'avoir dit&nbsp;: c\'est exactement ce qui nous permet de remplir la salle.<br><br>Si vous changez d\'avis, vous pouvez vous r&eacute;inscrire sur <a href="%s">unseulnom.org</a>.',
					esc_url( home_url( '/evenement/' ) )
				),
				true
			);
		}

		// Confirmation. Une place liberee puis confirmee est reprise : on
		// la retire a nouveau du stock.
		if ( self::ANNULE === (int) $ligne->confirme ) {
			$wpdb->query(
				$wpdb->prepare(
					"UPDATE " . self::table_evenements() . " SET reservees = reservees + %d WHERE id = %d",
					(int) $ligne->places,
					(int) $ligne->evenement_id
				)
			);
		}
		$wpdb->update( $table, array( 'confirme' => self::CONFIRME ), array( 'id' => (int) $ligne->id ), array( '%d' ), array( '%d' ) );

		self::page_reponse(
			'&Agrave; tr&egrave;s bient&ocirc;t',
			sprintf(
				'Merci&nbsp;! Votre pr&eacute;sence est confirm&eacute;e pour <strong>%d place(s)</strong>.<br><br>Pensez &agrave; venir avec quelqu\'un qui a besoin de rencontrer J&eacute;sus.',
				(int) $ligne->places
			),
			true
		);
	}

	/** La page que voit celui qui a clique. Elle ne depend d'aucun theme. */
	public static function page_reponse( $titre, $texte, $bon ) {
		$couleur = $bon ? '#1B2FC4' : '#E4262B';
		$html    = sprintf(
			'<div style="max-width:30em;margin:0 auto;font-family:system-ui,-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#0C0B0A">'
			. '<div style="height:5px;background:linear-gradient(90deg,#1B2FC4 33%%,#fff 33%% 66%%,#E4262B 66%%);margin-bottom:28px"></div>'
			. '<p style="font-size:11px;font-weight:800;letter-spacing:.28em;text-transform:uppercase;color:#55565E;margin:0">Un Seul Nom</p>'
			. '<h1 style="font-size:30px;line-height:1.1;margin:10px 0 18px;color:%s">%s</h1>'
			. '<p style="font-size:16px;line-height:1.6;margin:0">%s</p>'
			. '</div>',
			esc_attr( $couleur ),
			$titre,
			$texte
		);
		wp_die( $html, wp_strip_all_tags( $titre ) . ' - Un Seul Nom', array( 'response' => 200 ) );
	}

	/* ------------------------------------------------------------------ */
	/* Les chiffres du tableau de bord                                     */
	/* ------------------------------------------------------------------ */

	public static function chiffres() {
		global $wpdb;
		$table = self::table_reservations();
		$ville = self::evenement();

		$par_etat = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT confirme, COUNT(*) AS lignes, SUM(places) AS places
				 FROM {$table} WHERE evenement = %s GROUP BY confirme",
				$ville
			),
			ARRAY_A
		);

		$c = array(
			'lignes' => 0, 'places' => 0,
			'confirmees' => 0, 'annulees' => 0, 'muettes' => 0, 'presentes' => 0,
		);
		foreach ( $par_etat as $l ) {
			$etat   = (int) $l['confirme'];
			$places = (int) $l['places'];
			$c['lignes'] += (int) $l['lignes'];
			if ( self::ANNULE !== $etat ) {
				$c['places'] += $places;
			}
			if ( self::CONFIRME === $etat ) {
				$c['confirmees'] = $places;
			} elseif ( self::ANNULE === $etat ) {
				$c['annulees'] = $places;
			} elseif ( self::PRESENT === $etat ) {
				$c['presentes'] = $places;
			} else {
				$c['muettes'] = $places;
			}
		}

		/* LA PRESENCE ATTENDUE.
		 *
		 * Une place confirmee vaut bien plus qu'une place muette : a
		 * Avignon, la moyenne de toutes les places confondues tournait
		 * autour du tiers. On compte donc les confirmees a 90 % — il y a
		 * toujours des empechements de derniere minute — et les muettes
		 * au taux constate, que vous reglez vous-meme.
		 */
		$taux = self::taux_presence();
		$c['attendues'] = (int) round(
			$c['presentes'] + $c['confirmees'] * 0.9 + $c['muettes'] * $taux / 100
		);
		$c['taux'] = $taux;
		return $c;
	}

	/** Les inscriptions des trente derniers jours, pour la courbe. */
	public static function par_jour( $jours = 30 ) {
		global $wpdb;
		$table = self::table_reservations();
		$lignes = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT DATE(cree_le) AS jour, SUM(places) AS places
				 FROM {$table} WHERE evenement = %s AND cree_le >= %s
				 GROUP BY DATE(cree_le) ORDER BY jour",
				self::evenement(),
				gmdate( 'Y-m-d', time() - $jours * DAY_IN_SECONDS )
			),
			ARRAY_A
		);

		$par_date = array();
		foreach ( $lignes as $l ) {
			$par_date[ $l['jour'] ] = (int) $l['places'];
		}

		// Les jours sans inscription comptent autant que les autres :
		// c'est le creux qui previent, pas le pic.
		$suite = array();
		for ( $i = $jours - 1; $i >= 0; $i-- ) {
			$jour = gmdate( 'Y-m-d', time() - $i * DAY_IN_SECONDS );
			$suite[] = array( 'jour' => $jour, 'places' => isset( $par_date[ $jour ] ) ? $par_date[ $jour ] : 0 );
		}
		return $suite;
	}

	/** Marque une reservation presente, ou revient en arriere. */
	public static function marquer() {
		if ( ! current_user_can( self::CAP_GERER )
			|| ! isset( $_GET['_wpnonce'] )
			|| ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['_wpnonce'] ) ), 'usn_marquer' ) ) {
			wp_die( 'Action non autorisée.' );
		}
		$id   = isset( $_GET['id'] ) ? (int) $_GET['id'] : 0;
		$etat = isset( $_GET['etat'] ) ? (int) $_GET['etat'] : self::PRESENT;
		if ( $id > 0 ) {
			global $wpdb;
			$wpdb->update( self::table_reservations(), array( 'confirme' => $etat ), array( 'id' => $id ), array( '%d' ), array( '%d' ) );
		}
		// On revient la ou l'on etait : a la porte, repartir du tableau
		// de bord a chaque personne serait intenable.
		if ( isset( $_GET['retour'] ) && 'entree' === $_GET['retour'] ) {
			wp_safe_redirect(
				add_query_arg(
					array( 'page' => 'usn-entree', 'q' => isset( $_GET['q'] ) ? sanitize_text_field( wp_unslash( $_GET['q'] ) ) : '' ),
					admin_url( 'admin.php' )
				)
			);
			exit;
		}
		wp_safe_redirect( add_query_arg( 'usn_message', 'marque', admin_url( 'admin.php?page=usn-reservations' ) ) );
		exit;
	}

	/* ================================================================== */
	/* LA RELANCE                                                         */
	/*                                                                    */
	/* Le seul levier reel sur la presence. Une place reservee trois mois */
	/* avant ne dit rien de la soiree ; une place confirmee huit jours    */
	/* avant, si.                                                         */
	/*                                                                    */
	/* Le message part par l'API Brevo, avec la piece jointe, et porte    */
	/* les deux liens : « je viens » et « je libere ma place ». Celui qui */
	/* libere rend sa place au compteur, et elle repart a quelqu'un       */
	/* d'autre.                                                           */
	/*                                                                    */
	/* L'ENVOI SE FAIT PAR PAQUETS DE VINGT-CINQ. Quatre cents messages   */
	/* en une seule requete, c'est la page d'administration qui tombe en  */
	/* panne au milieu, sans qu'on sache qui a recu quoi. Chaque paquet   */
	/* est envoye, consigne, puis la page se recharge pour le suivant.    */
	/* On voit la progression, et on peut s'arreter a tout moment.        */
	/* ================================================================== */

	const PAQUET = 25;

	public static function expediteur() {
		$nom   = trim( (string) get_option( self::OPT_EXP_NOM, '' ) );
		$email = trim( (string) get_option( self::OPT_EXP_EMAIL, '' ) );
		return array(
			'name'  => '' === $nom ? get_bloginfo( 'name' ) : $nom,
			'email' => $email,
		);
	}

	/** Le message par defaut, que l'on peut reecrire dans les reglages. */
	public static function relance_modele() {
		$texte = (string) get_option( self::OPT_RELANCE_HTML, '' );
		if ( '' !== trim( $texte ) ) {
			return $texte;
		}
		/* UN RAPPEL D'ABORD, UNE QUESTION ENSUITE.
		 *
		 * La premiere version disait « dites-nous si vous venez ». Jack
		 * a eu raison de tiquer : personne n'ouvre un courriel pour
		 * rendre service a l'organisateur. On ouvre un courriel qui
		 * apporte quelque chose.
		 *
		 * Le message donne donc d'abord ce que le lecteur veut : c'est
		 * quand, c'est ou, a quelle heure arriver. Les deux boutons
		 * viennent apres, quand il a deja la bonne raison de lire. */
		return "<p>Bonjour {NOM},</p>\n"
			. "<p><strong>C'est bient&ocirc;t.</strong> Vos <strong>{PLACES} place(s)</strong> "
			. "pour {VILLE} vous attendent.</p>\n"
			. "<p>Arrivez d&egrave;s l'ouverture des portes&nbsp;: la salle se remplit vite, "
			. "et les premiers rangs partent les premiers. Votre billet est en pi&egrave;ce "
			. "jointe, inutile de l'imprimer, votre t&eacute;l&eacute;phone suffit.</p>\n"
			. "<p><strong>Un empêchement&nbsp;?</strong> Lib&eacute;rez votre place en un clic&nbsp;: "
			. "quelqu'un d'autre pourra venir &agrave; votre place. C'est tout ce que nous "
			. "vous demandons.</p>\n"
			. "<p>{BOUTONS}</p>\n"
			. "<p>Et venez avec quelqu'un qui a besoin de rencontrer J&eacute;sus.</p>\n"
			. "<p>&Agrave; tr&egrave;s bient&ocirc;t,<br>L'&eacute;quipe d'Un Seul Nom</p>";
	}

	public static function relance_boutons( $jeton ) {
		return sprintf(
			'<a href="%s" style="display:inline-block;background:#1B2FC4;color:#fff;'
			. 'text-decoration:none;font-weight:700;padding:14px 26px;border-radius:999px;'
			. 'margin:0 8px 10px 0">Oui, je viens</a>'
			. '<a href="%s" style="display:inline-block;background:#fff;color:#0C0B0A;'
			. 'text-decoration:none;font-weight:700;padding:12px 24px;border-radius:999px;'
			. 'border:2px solid #0C0B0A;margin:0 0 10px 0">Je lib&egrave;re ma place</a>',
			esc_url( self::lien_reponse( $jeton, 'oui' ) ),
			esc_url( self::lien_reponse( $jeton, 'annule' ) )
		);
	}

	public static function relance_corps( $ligne ) {
		$remplacements = array(
			'{NOM}'      => esc_html( $ligne->nom ),
			'{PLACES}'   => (int) $ligne->places,
			'{VILLE}'    => esc_html( $ligne->evenement ),
			'{BOUTONS}'  => self::relance_boutons( $ligne->jeton ),
			'{CONFIRMER}' => esc_url( self::lien_reponse( $ligne->jeton, 'oui' ) ),
			'{ANNULER}'  => esc_url( self::lien_reponse( $ligne->jeton, 'annule' ) ),
		);
		return strtr( self::relance_modele(), $remplacements );
	}

	/** Un message a une personne. Rend vrai si Brevo l'a accepte. */
	public static function relance_envoyer_un( $ligne, $sujet, $piece ) {
		$exp = self::expediteur();
		if ( '' === $exp['email'] ) {
			return array( 'ok' => false, 'code' => 0, 'corps' => array(), 'message' => 'Aucune adresse d\'expediteur enregistree.' );
		}

		$corps = array(
			'sender'      => $exp,
			'to'          => array( array( 'email' => $ligne->email, 'name' => $ligne->nom ) ),
			'subject'     => $sujet,
			'htmlContent' => '<div style="font-family:system-ui,-apple-system,Segoe UI,Helvetica,Arial,sans-serif;'
				. 'font-size:16px;line-height:1.6;color:#0C0B0A;max-width:32em">'
				. self::relance_corps( $ligne ) . '</div>',
		);

		// La piece jointe est donnee par son adresse : Brevo va la
		// chercher lui-meme. Elle ne transite donc pas par le site a
		// chaque message.
		if ( '' !== $piece ) {
			$corps['attachment'] = array( array( 'url' => $piece ) );
		}

		return self::brevo_appel( 'POST', '/smtp/email', $corps );
	}

	/**
	 * Le rappel de l'avant-veille, envoye sans que personne y pense.
	 *
	 * On oublie toujours. A Avignon, personne n'a relance qui que ce
	 * soit — non par negligence, mais parce qu'il y a cent choses a
	 * faire la semaine d'avant.
	 */
	public static function rappel_automatique() {
		if ( ! self::brevo_actif() ) {
			return;
		}
		global $wpdb;
		$evts  = self::table_evenements();
		$table = self::table_reservations();

		/* La fenetre va de deux jours avant l'evenement jusqu'a la
		 * veille au soir. Si le site dort pendant l'avant-veille — rien
		 * ne fait tourner le planificateur de WordPress sans visite —
		 * le rappel part quand meme le lendemain. Mieux vaut un rappel
		 * en retard qu'un rappel jamais parti. */
		$ouverture = gmdate( 'Y-m-d', current_time( 'timestamp' ) + 2 * DAY_IN_SECONDS );
		$villes = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$evts}
				 WHERE date_evenement IS NOT NULL
				   AND date_evenement <= %s
				   AND date_evenement >= %s
				   AND rappel_fait = 0",
				$ouverture,
				gmdate( 'Y-m-d', current_time( 'timestamp' ) )
			)
		);

		$sujet = trim( (string) get_option( self::OPT_RELANCE_SUJET, '' ) );
		$piece = trim( (string) get_option( self::OPT_PIECE_URL, '' ) );

		foreach ( $villes as $ville ) {
			self::definir_evenement( (int) $ville->id );
			$objet = '' === $sujet ? 'C\'est bientôt - ' . $ville->nom : $sujet;

			$lignes = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT * FROM {$table}
					 WHERE evenement_id = %d AND confirme <> %d AND rappel_envoye = 0
					 ORDER BY id LIMIT 60",
					(int) $ville->id,
					self::ANNULE
				)
			);

			foreach ( $lignes as $ligne ) {
				$reponse = self::relance_envoyer_un( $ligne, $objet, $piece );
				// Marque dans tous les cas : un echec qui se rejoue
				// toutes les heures finirait par envoyer soixante fois
				// le meme message a la meme personne.
				$wpdb->update( $table, array( 'rappel_envoye' => 1 ), array( 'id' => (int) $ligne->id ), array( '%d' ), array( '%d' ) );
				if ( ! $reponse['ok'] ) {
					self::brevo_consigner( $reponse, (string) $ligne->email, (string) $ville->nom );
				}
			}

			// Plus personne en attente : la ville est faite.
			$reste = (int) $wpdb->get_var(
				$wpdb->prepare(
					"SELECT COUNT(*) FROM {$table} WHERE evenement_id = %d AND confirme <> %d AND rappel_envoye = 0",
					(int) $ville->id,
					self::ANNULE
				)
			);
			if ( 0 === $reste ) {
				$wpdb->update( $evts, array( 'rappel_fait' => 1 ), array( 'id' => (int) $ville->id ), array( '%d' ), array( '%d' ) );
			}
		}
	}

	public static function relance_etat() {
		$e = get_option( self::OPT_RELANCE_ETAT, array() );
		return is_array( $e ) ? $e : array();
	}

	/**
	 * Prepare la file : qui va recevoir la relance.
	 *
	 * Seulement ceux qui n'ont pas repondu. Relancer quelqu'un qui a
	 * deja confirme, c'est le meilleur moyen qu'il se desabonne.
	 */
	public static function relance_preparer( $test_vers = '', $qui = 'tous' ) {
		global $wpdb;
		$table = self::table_reservations();

		if ( '' !== $test_vers ) {
			return array(
				'ids'     => array(),
				'test'    => $test_vers,
				'envoyes' => 0,
				'echecs'  => 0,
				'total'   => 1,
				'debut'   => current_time( 'mysql' ),
			);
		}

		/* DEUX ENVOIS DIFFERENTS, ET IL NE FAUT PAS LES CONFONDRE.
		 *
		 * « tous » : le rappel pratique, quelques jours avant. Il part a
		 * TOUT LE MONDE, y compris a ceux qui ont deja confirme — ils
		 * ont autant besoin de l'adresse et de l'heure que les autres.
		 * Seules les places liberees sont exclues : leurs titulaires ont
		 * dit qu'ils ne venaient pas.
		 *
		 * « muets » : la relance de confirmation, pour degager des
		 * places quand la salle approche du complet. Elle ne part qu'a
		 * ceux qui n'ont pas encore confirme — redemander a quelqu'un
		 * qui a deja repondu est le meilleur moyen qu'il se desabonne. */
		if ( 'muets' === $qui ) {
			$ids = $wpdb->get_col(
				$wpdb->prepare(
					"SELECT id FROM {$table} WHERE evenement = %s AND confirme = %d ORDER BY id",
					self::evenement(),
					self::SANS_REPONSE
				)
			);
		} else {
			$ids = $wpdb->get_col(
				$wpdb->prepare(
					"SELECT id FROM {$table} WHERE evenement = %s AND confirme <> %d ORDER BY id",
					self::evenement(),
					self::ANNULE
				)
			);
		}
		$ids = array_map( 'intval', $ids );
		return array(
			'ids'     => $ids,
			'test'    => '',
			'envoyes' => 0,
			'echecs'  => 0,
			'total'   => count( $ids ),
			'debut'   => current_time( 'mysql' ),
		);
	}

	/** Envoie un paquet et rend l'etat mis a jour. */
	public static function relance_paquet() {
		if ( ! current_user_can( self::CAP_REGLER )
			|| ! isset( $_GET['_wpnonce'] )
			|| ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['_wpnonce'] ) ), 'usn_relance' ) ) {
			wp_die( 'Action non autorisée.' );
		}

		$etape = isset( $_GET['etape'] ) ? sanitize_key( wp_unslash( $_GET['etape'] ) ) : 'suite';

		if ( 'arreter' === $etape ) {
			delete_option( self::OPT_RELANCE_ETAT );
			wp_safe_redirect( add_query_arg( 'usn_message', 'relance-arretee', admin_url( 'admin.php?page=usn-reservations' ) ) );
			exit;
		}

		if ( 'demarrer' === $etape || 'test' === $etape ) {
			$vers = 'test' === $etape ? wp_get_current_user()->user_email : '';
			$qui  = isset( $_GET['qui'] ) ? sanitize_key( wp_unslash( $_GET['qui'] ) ) : 'tous';
			update_option( self::OPT_RELANCE_ETAT, self::relance_preparer( $vers, $qui ) );
		}

		$etat = self::relance_etat();
		if ( ! $etat ) {
			wp_safe_redirect( admin_url( 'admin.php?page=usn-reservations' ) );
			exit;
		}

		$sujet = trim( (string) get_option( self::OPT_RELANCE_SUJET, '' ) );
		if ( '' === $sujet ) {
			$sujet = 'Venez-vous toujours ? - ' . self::evenement();
		}
		$piece = trim( (string) get_option( self::OPT_PIECE_URL, '' ) );

		global $wpdb;
		$table = self::table_reservations();

		// L'envoi d'essai : un seul message, vers sa propre adresse.
		if ( ! empty( $etat['test'] ) ) {
			$ligne = $wpdb->get_row(
				$wpdb->prepare( "SELECT * FROM {$table} WHERE evenement = %s ORDER BY id DESC LIMIT 1", self::evenement() )
			);
			if ( ! $ligne ) {
				// Aucune reservation : on s'en invente une, le temps du test.
				$ligne = (object) array(
					'nom'       => wp_get_current_user()->display_name,
					'email'     => $etat['test'],
					'places'    => 2,
					'evenement' => self::evenement(),
					'jeton'     => 'ESSAI-SANS-EFFET',
				);
			} else {
				$ligne->email = $etat['test'];
			}
			$reponse = self::relance_envoyer_un( $ligne, '[Essai] ' . $sujet, $piece );
			self::brevo_consigner( $reponse, $etat['test'], self::evenement() );
			delete_option( self::OPT_RELANCE_ETAT );
			wp_safe_redirect(
				add_query_arg(
					'usn_message',
					$reponse['ok'] ? 'relance-essai' : 'relance-essai-rate',
					admin_url( 'admin.php?page=usn-reservations' )
				)
			);
			exit;
		}

		$lot = array_slice( $etat['ids'], 0, self::PAQUET );
		foreach ( $lot as $id ) {
			$ligne = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", (int) $id ) );
			if ( ! $ligne ) {
				continue;
			}
			$reponse = self::relance_envoyer_un( $ligne, $sujet, $piece );
			// Marque aussi pour le rappel automatique : les deux ne
			// doivent jamais envoyer deux fois a la meme personne.
			$wpdb->update( $table, array( 'rappel_envoye' => 1 ), array( 'id' => (int) $ligne->id ), array( '%d' ), array( '%d' ) );
			if ( $reponse['ok'] ) {
				$etat['envoyes']++;
			} else {
				$etat['echecs']++;
				self::brevo_consigner( $reponse, (string) $ligne->email, self::evenement() );
			}
		}
		$etat['ids'] = array_slice( $etat['ids'], count( $lot ) );

		if ( empty( $etat['ids'] ) ) {
			update_option( self::OPT_RELANCE_FIN, $etat );
			delete_option( self::OPT_RELANCE_ETAT );
			wp_safe_redirect( add_query_arg( 'usn_message', 'relance-finie', admin_url( 'admin.php?page=usn-reservations' ) ) );
			exit;
		}

		update_option( self::OPT_RELANCE_ETAT, $etat );
		wp_safe_redirect(
			add_query_arg(
				array( 'usn_message' => 'relance-suite', 'usn_reprendre' => '1' ),
				admin_url( 'admin.php?page=usn-reservations' )
			)
		);
		exit;
	}

	public static function exporter_csv() {
		if ( ! current_user_can( self::CAP_GERER ) || ! isset( $_GET['_wpnonce'] )
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
		$mots = array(
			self::SANS_REPONSE => 'Pas confirmee',
			self::CONFIRME     => 'Confirmee',
			self::ANNULE       => 'Place liberee',
			self::PRESENT      => 'Present',
		);
		fputcsv( $sortie, array( 'Nom', 'E-mail', 'Places', 'Ville', 'Reponse', 'Date' ), ';' );
		foreach ( $lignes as $l ) {
			$etat_l = isset( $l['confirme'] ) ? (int) $l['confirme'] : self::SANS_REPONSE;
			fputcsv(
				$sortie,
				array(
					$l['nom'], $l['email'], $l['places'], $l['evenement'],
					isset( $mots[ $etat_l ] ) ? $mots[ $etat_l ] : '', $l['cree_le'],
				),
				';'
			);
		}
		fclose( $sortie );
		exit;
	}
}

register_activation_hook( __FILE__, array( 'USN_Reservations', 'activer' ) );
register_deactivation_hook(
	__FILE__,
	function () {
		$suivant = wp_next_scheduled( 'usn_rappel_horaire' );
		if ( $suivant ) {
			wp_unschedule_event( $suivant, 'usn_rappel_horaire' );
		}
	}
);
add_action( 'plugins_loaded', array( 'USN_Reservations', 'init' ) );
