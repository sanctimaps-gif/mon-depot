<?php
/**
 * Le P’tit Ravisé — fonctions communes de l'administration.
 *
 * Aucune dépendance, aucune base de données : le compte est un fichier
 * PHP contenant un mot de passe haché, le contenu du site est le fichier
 * js/donnees.js que les pages publiques lisent déjà.
 */

declare(strict_types=1);

/* ---------------------------------------------------------------
   Emplacements
   --------------------------------------------------------------- */

function chemin_donnees(): string
{
    return dirname(__DIR__) . '/js/donnees.js';
}

function dossier_photos(): string
{
    return dirname(__DIR__) . '/img/photos';
}

function chemin_compte(): string
{
    return __DIR__ . '/compte.php';
}

/**
 * Compte livré avec le site. Il sert tant que le mot de passe n'a pas été
 * changé ; à ce moment-là compte.php est écrit et prend définitivement
 * le relais.
 */
function chemin_compte_initial(): string
{
    return __DIR__ . '/compte-initial.php';
}

function chemin_tentatives(): string
{
    // Extension .php volontaire : le fichier n'est jamais servi comme
    // donnée, quel que soit le serveur web (Apache, nginx…).
    return __DIR__ . '/tentatives.php';
}

/**
 * Adresse qui reçoit les messages du formulaire de contact.
 * Elle vit ici, côté serveur, et jamais dans js/donnees.js : une adresse
 * écrite dans un fichier public est moissonnée par les robots à spam
 * en quelques jours.
 */
function chemin_destinataire(): string
{
    return __DIR__ . '/destinataire.php';
}

/** Adresse livrée avec le site, remplacée dès que la console en enregistre une. */
function chemin_destinataire_initial(): string
{
    return __DIR__ . '/destinataire-initial.php';
}

/** Journal des messages reçus : un filet si l'envoi du courriel échoue. */
function chemin_messages(): string
{
    return __DIR__ . '/messages.php';
}

/** Compteur d'envois par adresse IP, pour le formulaire de contact. */
function chemin_envois(): string
{
    return __DIR__ . '/envois.php';
}

/* ---------------------------------------------------------------
   Compte administrateur
   --------------------------------------------------------------- */

function compte_existe(): bool
{
    return is_file(chemin_compte()) || is_file(chemin_compte_initial());
}

/**
 * Le compte personnalisé prime toujours sur celui livré avec le site.
 *
 * @return array{email: string, hash: string, doitChanger?: bool}|null
 */
function lire_compte(): ?array
{
    foreach ([chemin_compte(), chemin_compte_initial()] as $fichier) {
        if (!is_file($fichier)) {
            continue;
        }
        $compte = include $fichier;
        if (is_array($compte) && isset($compte['email'], $compte['hash'])) {
            return $compte;
        }
    }
    return null;
}

/** Le mot de passe livré doit-il encore être remplacé ? */
function doit_changer_mot_de_passe(): bool
{
    $compte = lire_compte();
    return $compte !== null && !empty($compte['doitChanger']);
}

function ecrire_compte(string $email, string $motDePasse): bool
{
    $contenu = "<?php\n"
        . "// Compte administrateur — fichier généré, ne pas modifier à la main.\n"
        . "// Le mot de passe n'est pas stocké : seule son empreinte l'est.\n"
        . "return " . var_export([
            'email'       => $email,
            'hash'        => password_hash($motDePasse, PASSWORD_DEFAULT),
            'doitChanger' => false,
            'cree'        => date('c'),
        ], true) . ";\n";

    return ecrire_atomique(chemin_compte(), $contenu);
}

/**
 * Écrit un fichier sans jamais laisser de version tronquée en place :
 * on écrit à côté, puis on renomme (opération atomique).
 */
function ecrire_atomique(string $chemin, string $contenu): bool
{
    $temporaire = $chemin . '.tmp' . bin2hex(random_bytes(4));
    if (file_put_contents($temporaire, $contenu, LOCK_EX) === false) {
        return false;
    }
    if (!rename($temporaire, $chemin)) {
        @unlink($temporaire);
        return false;
    }
    @chmod($chemin, 0644);
    return true;
}

/* ---------------------------------------------------------------
   Destinataire du formulaire de contact
   --------------------------------------------------------------- */

/**
 * @return array{email: string, expediteur: string}
 */
function lire_reglages_contact(): array
{
    foreach ([chemin_destinataire(), chemin_destinataire_initial()] as $fichier) {
        if (!is_file($fichier)) {
            continue;
        }
        $lu = include $fichier;
        if (is_array($lu) && !empty($lu['email'])) {
            return [
                'email'      => (string) $lu['email'],
                'expediteur' => (string) ($lu['expediteur'] ?? ''),
            ];
        }
    }
    return ['email' => '', 'expediteur' => ''];
}

function lire_destinataire(): string
{
    return lire_reglages_contact()['email'];
}

function ecrire_destinataire(string $email, string $expediteur = ''): bool
{
    // Une adresse vide est une consigne valable : elle éteint le formulaire.
    $contenu = "<?php\n"
        . "// Destinataire du formulaire de contact — fichier généré.\n"
        . "// Il n'est jamais servi au public : le site ne publie que le fait\n"
        . "// qu'une adresse est configurée, pas l'adresse elle-même.\n"
        . "return " . var_export([
            'email'      => $email,
            'expediteur' => $expediteur,
            'modifie'    => date('c'),
        ], true) . ";\n";

    return ecrire_atomique(chemin_destinataire(), $contenu);
}

/**
 * Adresse utilisée comme expéditeur technique. Les hébergeurs refusent
 * d'expédier un courriel dont le « From » est celui du visiteur : c'est
 * ce que vérifient SPF et DMARC. Le visiteur est mis en « Reply-To ».
 */
function expediteur_technique(): string
{
    $configure = lire_reglages_contact()['expediteur'];
    if ($configure !== '' && filter_var($configure, FILTER_VALIDATE_EMAIL)) {
        return $configure;
    }
    $hote = (string) ($_SERVER['HTTP_HOST'] ?? 'localhost');
    $hote = preg_replace('/:\d+$/', '', $hote) ?? $hote;   // sans le port
    $hote = preg_replace('/^www\./', '', $hote) ?? $hote;
    return 'no-reply@' . $hote;
}

/* ---------------------------------------------------------------
   Session
   --------------------------------------------------------------- */

function demarrer_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'httponly' => true,                       // inaccessible au JavaScript
        'secure'   => connexion_chiffree(),       // cookie réservé à HTTPS
        'samesite' => 'Lax',
    ]);
    session_name('lpr_admin');
    session_start();
}

function connexion_chiffree(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
}

function est_connecte(): bool
{
    demarrer_session();
    return !empty($_SESSION['connecte']);
}

function ouvrir_session(string $email): void
{
    demarrer_session();
    session_regenerate_id(true);        // empêche la fixation de session
    $_SESSION['connecte'] = true;
    $_SESSION['email'] = $email;
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
}

function fermer_session(): void
{
    demarrer_session();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

function jeton_csrf(): string
{
    demarrer_session();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function csrf_valide(?string $jeton): bool
{
    demarrer_session();
    return is_string($jeton)
        && !empty($_SESSION['csrf'])
        && hash_equals($_SESSION['csrf'], $jeton);
}

/* ---------------------------------------------------------------
   Limitation des tentatives de connexion
   Cinq échecs par quart d'heure et par adresse : de quoi rendre une
   attaque par force brute inopérante sans gêner un oubli de frappe.
   --------------------------------------------------------------- */

const MAX_TENTATIVES = 5;
const FENETRE_TENTATIVES = 900;   // 15 minutes

function cle_client(): string
{
    return hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'inconnu');
}

function lire_tentatives(): array
{
    if (!is_file(chemin_tentatives())) {
        return [];
    }
    $brut = include chemin_tentatives();
    if (!is_array($brut)) {
        return [];
    }
    // On profite de chaque lecture pour oublier les entrées expirées.
    $limite = time() - FENETRE_TENTATIVES;
    return array_filter($brut, static fn($e) => ($e['dernier'] ?? 0) > $limite);
}

function secondes_avant_reessai(): int
{
    $tentatives = lire_tentatives();
    $entree = $tentatives[cle_client()] ?? null;
    if (!$entree || ($entree['nombre'] ?? 0) < MAX_TENTATIVES) {
        return 0;
    }
    $reste = ($entree['dernier'] + FENETRE_TENTATIVES) - time();
    return max(0, $reste);
}

function enregistrer_echec(): void
{
    $tentatives = lire_tentatives();
    $cle = cle_client();
    $tentatives[$cle] = [
        'nombre'  => ($tentatives[$cle]['nombre'] ?? 0) + 1,
        'dernier' => time(),
    ];
    ecrire_tentatives($tentatives);
}

function oublier_echecs(): void
{
    $tentatives = lire_tentatives();
    unset($tentatives[cle_client()]);
    ecrire_tentatives($tentatives);
}

function ecrire_tentatives(array $tentatives): void
{
    ecrire_atomique(
        chemin_tentatives(),
        "<?php\n// Tentatives de connexion échouées — fichier technique.\nreturn "
            . var_export($tentatives, true) . ";\n"
    );
}

/* ---------------------------------------------------------------
   Contenu du site (js/donnees.js)
   --------------------------------------------------------------- */

const ENTETE_DONNEES = <<<'TXT'
/* =========================================================
   Le P’tit Ravisé — contenu modifiable du site
   ---------------------------------------------------------
   CE FICHIER EST LA SOURCE UNIQUE du contenu : réglages,
   carte et agenda. Les pages du site le lisent, la console
   d'administration (admin/) l'écrit.

   Écrit automatiquement — évitez de le modifier à la main
   pendant qu'une session d'administration est ouverte.
   ========================================================= */

window.DONNEES = 
TXT;

function donnees_par_defaut(): array
{
    return ['reglages' => new stdClass(), 'carte' => [], 'evenements' => [], 'photos' => []];
}

function lire_donnees(): array
{
    $chemin = chemin_donnees();
    if (!is_file($chemin)) {
        return donnees_par_defaut();
    }
    $contenu = (string) file_get_contents($chemin);

    // Le fichier est du JavaScript : on isole l'objet littéral, qui est
    // écrit en JSON strict par cette console.
    if (!preg_match('/window\.DONNEES\s*=\s*(\{.*\})\s*;\s*$/s', $contenu, $m)) {
        return donnees_par_defaut();
    }
    $donnees = json_decode($m[1], true);
    return is_array($donnees) ? $donnees : donnees_par_defaut();
}

function ecrire_donnees(array $donnees): bool
{
    $json = json_encode(
        $donnees,
        JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    if ($json === false) {
        return false;
    }
    return ecrire_atomique(chemin_donnees(), ENTETE_DONNEES . $json . ";\n");
}

/**
 * Retire ce qui ne doit pas être publié : lignes sans intitulé,
 * événements sans titre ou sans date, champs inconnus.
 */
function nettoyer_donnees(array $brut): array
{
    $texte = static fn($v) => is_string($v) ? trim($v) : '';

    $reglages = $brut['reglages'] ?? [];
    $propre = [
        'reglages' => [
            // L'adresse de contact n'est volontairement PAS publiée : le site
            // n'annonce que l'existence du formulaire (voir contact.php).
            'formulaire'    => lire_destinataire() !== '',
            'telephone'     => $texte($reglages['telephone'] ?? ''),
            'telephoneLien' => $texte($reglages['telephoneLien'] ?? ''),
            'mentionTarifs' => $texte($reglages['mentionTarifs'] ?? ''),
        ],
        'carte' => [],
        'evenements' => [],
        'photos' => [],
    ];

    foreach (($brut['carte'] ?? []) as $rubrique) {
        if (!is_array($rubrique)) {
            continue;
        }
        $items = [];
        foreach (($rubrique['items'] ?? []) as $item) {
            if (!is_array($item) || $texte($item['nom'] ?? '') === '') {
                continue;
            }
            $items[] = [
                'nom'         => $texte($item['nom']),
                'prix'        => $texte($item['prix'] ?? ''),
                'description' => $texte($item['description'] ?? ''),
            ];
        }
        $titre = $texte($rubrique['titre'] ?? '');
        $propre['carte'][] = [
            'id'    => $texte($rubrique['id'] ?? '') ?: identifiant($titre),
            'emoji' => $texte($rubrique['emoji'] ?? ''),
            'titre' => $titre,
            'items' => $items,
        ];
    }

    foreach (($brut['evenements'] ?? []) as $ev) {
        if (!is_array($ev)) {
            continue;
        }
        $date = $texte($ev['date'] ?? '');
        $titre = $texte($ev['titre'] ?? '');
        if ($titre === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            continue;
        }
        $propre['evenements'][] = [
            'date'        => $date,
            'titre'       => $titre,
            'description' => $texte($ev['description'] ?? ''),
            'heure'       => $texte($ev['heure'] ?? ''),
            'prix'        => $texte($ev['prix'] ?? ''),
        ];
    }

    foreach (($brut['photos'] ?? []) as $photo) {
        if (!is_array($photo)) {
            continue;
        }
        $id = $texte($photo['id'] ?? '');
        if ($id === '' || !preg_match('/^[a-z0-9-]{1,40}$/', $id)) {
            continue;
        }
        // Le nom de fichier ne vient jamais du client : on ne garde que ce qui
        // ressemble à un fichier déposé par photo.php et qui existe encore.
        $fichier = $texte($photo['fichier'] ?? '');
        if (!preg_match('/^[a-z0-9_-]+\.(jpg|webp)$/', $fichier)
            || !is_file(dossier_photos() . '/' . $fichier)) {
            $fichier = '';
        }
        $propre['photos'][] = [
            'id'      => $id,
            'legende' => $texte($photo['legende'] ?? ''),
            'fichier' => $fichier,
        ];
    }

    return $propre;
}

function identifiant(string $texte): string
{
    $sansAccent = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $texte);
    $slug = strtolower((string) $sansAccent);
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug) ?? '';
    $slug = trim($slug, '-');
    return $slug !== '' ? $slug : 'rubrique';
}

/* ---------------------------------------------------------------
   Réponses
   --------------------------------------------------------------- */

function reponse_json(array $donnees, int $code = 200): never
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($donnees, JSON_UNESCAPED_UNICODE);
    exit;
}

function e(string $texte): string
{
    return htmlspecialchars($texte, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
