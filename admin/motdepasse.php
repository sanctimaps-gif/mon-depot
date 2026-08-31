<?php
/**
 * Le P’tit Ravisé — changement de mot de passe depuis le site public.
 *
 * L'entrée « Compte » du menu ouvre une fenêtre qui envoie ici l'ancien
 * et le nouveau mot de passe. C'est la connaissance de l'ancien qui fait
 * office d'autorisation : aucune session n'est nécessaire.
 *
 * La console d'administration dispose du même réglage dans son onglet
 * « Mon compte » ; les deux écrivent le même fichier.
 */

declare(strict_types=1);

require __DIR__ . '/lib.php';

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    reponse_json(['erreur' => 'Méthode non autorisée.'], 405);
}

$corps = json_decode((string) file_get_contents('php://input'), true);
$corps = is_array($corps) ? $corps : [];

$actuel = (string) ($corps['actuel'] ?? '');
$nouveau = (string) ($corps['nouveau'] ?? '');

$attente = secondes_avant_reessai();
if ($attente > 0) {
    reponse_json([
        'erreur' => 'Trop de tentatives. Réessayez dans ' . ceil($attente / 60) . ' minute(s).',
    ], 429);
}

$compte = lire_compte();
if ($compte === null) {
    reponse_json(['erreur' => 'Aucun compte configuré.'], 500);
}
if (!password_verify($actuel, $compte['hash'])) {
    enregistrer_echec();
    reponse_json(['erreur' => 'Mot de passe actuel incorrect.'], 401);
}
oublier_echecs();

if (password_verify($nouveau, $compte['hash'])) {
    reponse_json(['erreur' => 'Choisissez un mot de passe différent de l’actuel.'], 422);
}
if (mb_strlen($nouveau) < 10) {
    reponse_json(['erreur' => 'Le nouveau mot de passe doit faire au moins 10 caractères.'], 422);
}

if (!ecrire_compte($compte['email'], $nouveau)) {
    reponse_json(['erreur' => 'Enregistrement impossible. Vérifiez les droits d’écriture sur le dossier admin/.'], 500);
}

reponse_json(['ok' => true]);
