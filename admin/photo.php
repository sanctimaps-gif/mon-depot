<?php
/**
 * Le Petit Ravisé — dépôt d'une photo depuis la page publique.
 *
 * Une photo manquante affiche un bouton sur le site ; ce bouton demande le
 * mot de passe de l'administration puis envoie le fichier ici.
 *
 * Le fichier reçu n'est jamais conservé tel quel : il est décodé puis
 * ré-encodé en JPEG par GD. Ce qui n'est pas une vraie image échoue au
 * décodage, et le ré-encodage supprime tout ce qui pourrait être caché
 * dans les métadonnées.
 */

declare(strict_types=1);

require __DIR__ . '/lib.php';

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    reponse_json(['erreur' => 'Méthode non autorisée.'], 405);
}

const TAILLE_MAX = 8 * 1024 * 1024;    // 8 Mo avant traitement
const COTE_MAX = 1200;                 // côté maximal après redimensionnement
const QUALITE = 82;

/* ---------------------------------------------------------------
   Authentification : le mot de passe de l'administration, ou une
   session déjà ouverte.
   --------------------------------------------------------------- */
$emplacement = trim((string) ($_POST['emplacement'] ?? ''));
$motDePasse = (string) ($_POST['motDePasse'] ?? '');

if (!est_connecte()) {
    $attente = secondes_avant_reessai();
    if ($attente > 0) {
        reponse_json([
            'erreur' => 'Trop de tentatives. Réessayez dans ' . ceil($attente / 60) . ' minute(s).',
        ], 429);
    }

    $compte = lire_compte();
    if ($compte === null || !password_verify($motDePasse, $compte['hash'])) {
        enregistrer_echec();
        reponse_json(['erreur' => 'Mot de passe incorrect.'], 401);
    }
    oublier_echecs();
}

/* ---------------------------------------------------------------
   L'emplacement doit exister et être encore libre.
   --------------------------------------------------------------- */
$donnees = lire_donnees();
$index = null;
foreach (($donnees['photos'] ?? []) as $i => $photo) {
    if (($photo['id'] ?? '') === $emplacement) {
        $index = $i;
        break;
    }
}
if ($index === null) {
    reponse_json(['erreur' => 'Emplacement inconnu.'], 404);
}
if (($donnees['photos'][$index]['fichier'] ?? '') !== '') {
    reponse_json(['erreur' => 'Cet emplacement contient déjà une photo.'], 409);
}

/* ---------------------------------------------------------------
   Le fichier
   --------------------------------------------------------------- */
$envoi = $_FILES['photo'] ?? null;
if (!is_array($envoi) || ($envoi['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    $message = match ($envoi['error'] ?? UPLOAD_ERR_NO_FILE) {
        UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'Photo trop lourde pour le serveur.',
        UPLOAD_ERR_NO_FILE => 'Aucune photo reçue.',
        default => 'L’envoi a échoué. Réessayez.',
    };
    reponse_json(['erreur' => $message], 422);
}
if (!is_uploaded_file($envoi['tmp_name'])) {
    reponse_json(['erreur' => 'Envoi invalide.'], 400);
}
if (($envoi['size'] ?? 0) > TAILLE_MAX) {
    reponse_json(['erreur' => 'Photo trop lourde : 8 Mo maximum.'], 422);
}

$infos = @getimagesize($envoi['tmp_name']);
$typesAcceptes = [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP];
if ($infos === false || !in_array($infos[2], $typesAcceptes, true)) {
    reponse_json(['erreur' => 'Format non reconnu. Envoyez une photo JPEG, PNG ou WebP.'], 422);
}

$source = match ($infos[2]) {
    IMAGETYPE_JPEG => @imagecreatefromjpeg($envoi['tmp_name']),
    IMAGETYPE_PNG  => @imagecreatefrompng($envoi['tmp_name']),
    IMAGETYPE_WEBP => @imagecreatefromwebp($envoi['tmp_name']),
};
if (!$source) {
    reponse_json(['erreur' => 'Photo illisible. Réessayez avec un autre fichier.'], 422);
}

/* ---------------------------------------------------------------
   Recadrage carré et redimensionnement : la galerie est en carrés,
   autant livrer directement la bonne forme.
   --------------------------------------------------------------- */
$largeur = imagesx($source);
$hauteur = imagesy($source);
$cote = min($largeur, $hauteur);
$decalageX = intdiv($largeur - $cote, 2);
$decalageY = intdiv($hauteur - $cote, 2);
$taille = min($cote, COTE_MAX);

$destination = imagecreatetruecolor($taille, $taille);
imagefill($destination, 0, 0, imagecolorallocate($destination, 255, 255, 255));
imagecopyresampled($destination, $source, 0, 0, $decalageX, $decalageY, $taille, $taille, $cote, $cote);
imagedestroy($source);

$nom = $emplacement . '-' . bin2hex(random_bytes(4)) . '.jpg';
$chemin = dossier_photos() . '/' . $nom;

if (!is_dir(dossier_photos()) && !@mkdir(dossier_photos(), 0755, true)) {
    imagedestroy($destination);
    reponse_json(['erreur' => 'Le dossier img/photos est introuvable et n’a pas pu être créé.'], 500);
}
if (!imagejpeg($destination, $chemin, QUALITE)) {
    imagedestroy($destination);
    reponse_json(['erreur' => 'Écriture impossible. Vérifiez les droits sur img/photos.'], 500);
}
imagedestroy($destination);
@chmod($chemin, 0644);

/* ---------------------------------------------------------------
   Enregistrement dans le contenu du site
   --------------------------------------------------------------- */
$donnees['photos'][$index]['fichier'] = $nom;
if (!ecrire_donnees(nettoyer_donnees($donnees))) {
    @unlink($chemin);
    reponse_json(['erreur' => 'Photo reçue mais non enregistrée. Vérifiez les droits sur js/donnees.js.'], 500);
}

reponse_json(['ok' => true, 'fichier' => $nom]);
