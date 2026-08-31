<?php
/**
 * Le Petit Ravisé — points d'entrée de l'administration.
 *
 * Toutes les actions passent en POST et renvoient du JSON.
 * Chaque action qui modifie quelque chose exige une session ouverte
 * et un jeton anti-CSRF valide.
 */

declare(strict_types=1);

require __DIR__ . '/lib.php';

header('X-Frame-Options: DENY');
header('Referrer-Policy: same-origin');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    reponse_json(['erreur' => 'Méthode non autorisée.'], 405);
}

$corps = json_decode((string) file_get_contents('php://input'), true);
$corps = is_array($corps) ? $corps : [];
$action = is_string($corps['action'] ?? null) ? $corps['action'] : '';

/* =========================================================
   Installation : création du premier compte
   ========================================================= */
if ($action === 'installer') {
    if (compte_existe()) {
        reponse_json(['erreur' => 'Un compte administrateur existe déjà.'], 409);
    }

    $email = trim((string) ($corps['email'] ?? ''));
    $mdp = (string) ($corps['motDePasse'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        reponse_json(['erreur' => 'Adresse e-mail invalide.'], 422);
    }
    if (mb_strlen($mdp) < 10) {
        reponse_json(['erreur' => 'Le mot de passe doit faire au moins 10 caractères.'], 422);
    }
    if (!ecrire_compte($email, $mdp)) {
        reponse_json(['erreur' => 'Impossible d’écrire le fichier du compte. Vérifiez les droits d’écriture sur le dossier admin/.'], 500);
    }

    ouvrir_session($email);
    reponse_json(['ok' => true]);
}

/* =========================================================
   Connexion
   ========================================================= */
if ($action === 'connexion') {
    $attente = secondes_avant_reessai();
    if ($attente > 0) {
        reponse_json([
            'erreur' => 'Trop de tentatives. Réessayez dans ' . ceil($attente / 60) . ' minute(s).',
        ], 429);
    }

    $compte = lire_compte();
    $email = trim((string) ($corps['email'] ?? ''));
    $mdp = (string) ($corps['motDePasse'] ?? '');

    // Message volontairement identique dans les deux cas : il ne faut pas
    // révéler si c'est l'adresse ou le mot de passe qui est faux.
    $valide = $compte !== null
        && hash_equals(mb_strtolower($compte['email']), mb_strtolower($email))
        && password_verify($mdp, $compte['hash']);

    if (!$valide) {
        enregistrer_echec();
        reponse_json(['erreur' => 'Adresse e-mail ou mot de passe incorrect.'], 401);
    }

    oublier_echecs();
    ouvrir_session($compte['email']);
    reponse_json(['ok' => true]);
}

/* =========================================================
   Actions nécessitant une session ouverte
   ========================================================= */
if (!est_connecte()) {
    reponse_json(['erreur' => 'Session expirée. Reconnectez-vous.'], 401);
}
if (!csrf_valide($corps['csrf'] ?? null)) {
    reponse_json(['erreur' => 'Jeton de sécurité invalide. Rechargez la page.'], 403);
}

// Tant que le mot de passe livré avec le site n'a pas été remplacé, la
// console ne laisse rien faire d'autre. Le contrôle est ici, côté serveur :
// masquer les onglets dans la page ne protégerait rien.
if (doit_changer_mot_de_passe() && !in_array($action, ['changer-mot-de-passe', 'deconnexion'], true)) {
    reponse_json(['erreur' => 'Changez d’abord le mot de passe livré avec le site.'], 403);
}

if ($action === 'deconnexion') {
    fermer_session();
    reponse_json(['ok' => true]);
}

if ($action === 'enregistrer') {
    $donnees = $corps['donnees'] ?? null;
    if (!is_array($donnees)) {
        reponse_json(['erreur' => 'Contenu illisible.'], 422);
    }

    $propre = nettoyer_donnees($donnees);
    if (!ecrire_donnees($propre)) {
        reponse_json(['erreur' => 'Écriture impossible. Vérifiez les droits sur js/donnees.js.'], 500);
    }
    reponse_json(['ok' => true, 'donnees' => $propre]);
}

if ($action === 'changer-mot-de-passe') {
    $compte = lire_compte();
    $actuel = (string) ($corps['actuel'] ?? '');
    $nouveau = (string) ($corps['nouveau'] ?? '');
    $premiereFois = doit_changer_mot_de_passe();

    // Au premier changement, l'utilisateur vient de saisir le mot de passe
    // livré pour ouvrir sa session : le redemander n'ajouterait rien.
    if (!$premiereFois && ($compte === null || !password_verify($actuel, $compte['hash']))) {
        reponse_json(['erreur' => 'Mot de passe actuel incorrect.'], 401);
    }
    if ($compte === null) {
        reponse_json(['erreur' => 'Compte introuvable.'], 500);
    }
    if (password_verify($nouveau, $compte['hash'])) {
        reponse_json(['erreur' => 'Choisissez un mot de passe différent de l’actuel.'], 422);
    }
    if (mb_strlen($nouveau) < 10) {
        reponse_json(['erreur' => 'Le nouveau mot de passe doit faire au moins 10 caractères.'], 422);
    }
    $email = $compte['email'];
    if ($premiereFois) {
        $souhaite = trim((string) ($corps['email'] ?? ''));
        if ($souhaite !== '') {
            if (!filter_var($souhaite, FILTER_VALIDATE_EMAIL)) {
                reponse_json(['erreur' => 'Adresse e-mail invalide.'], 422);
            }
            $email = $souhaite;
        }
    }

    if (!ecrire_compte($email, $nouveau)) {
        reponse_json(['erreur' => 'Enregistrement impossible. Vérifiez les droits d’écriture sur le dossier admin/.'], 500);
    }
    demarrer_session();
    $_SESSION['email'] = $email;
    reponse_json(['ok' => true, 'premiereFois' => $premiereFois]);
}

reponse_json(['erreur' => 'Action inconnue.'], 400);
