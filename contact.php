<?php
/**
 * Le P’tit Ravisé — réception des messages du formulaire de contact.
 *
 * Le formulaire de contact.html envoie ici en POST (JSON) ; ce fichier
 * valide, filtre les robots, expédie le courriel et répond en JSON.
 *
 * Deux garanties tenues ici :
 *   - l'adresse du bar n'apparaît nulle part dans les pages publiques,
 *     elle est lue côté serveur (admin/destinataire.php) ;
 *   - un message reçu n'est jamais perdu : il est journalisé avant même
 *     la tentative d'envoi, et reste lisible depuis le serveur si
 *     l'hébergeur refuse d'expédier.
 */

declare(strict_types=1);

require __DIR__ . '/admin/lib.php';

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: same-origin');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    reponse_json(['erreur' => 'Méthode non autorisée.'], 405);
}

/* ---------------------------------------------------------------
   Lecture de la requête et langue de la réponse
   --------------------------------------------------------------- */

$corps = json_decode((string) file_get_contents('php://input'), true);
$corps = is_array($corps) ? $corps : [];

$champ = static function (string $cle) use ($corps): string {
    return is_string($corps[$cle] ?? null) ? trim($corps[$cle]) : '';
};

/*
 * Le site existe en français et en anglais : les réponses suivent la langue
 * de la page qui a envoyé le message. Toute autre valeur retombe sur le
 * français.
 */
$langue = $champ('langue') === 'en' ? 'en' : 'fr';
$TEXTES = [
    'fr' => [
        'recu'      => 'Message reçu, merci !',
        'nom'       => 'Merci d’indiquer votre nom.',
        'email'     => 'Adresse e-mail invalide.',
        'court'     => 'Votre message est un peu court.',
        'long'      => 'Message trop long : 5000 caractères au maximum.',
        'interdit'  => 'Ce champ contient un caractère interdit.',
        'trop'      => 'Vous avez déjà envoyé plusieurs messages. Merci de patienter '
            . 'une heure, ou de nous appeler directement.',
        'inactif'   => 'Le formulaire n’est pas encore configuré. '
            . 'Merci de nous joindre par téléphone.',
        'methode'   => 'Méthode non autorisée.',
        'panne'     => 'Votre message a bien été enregistré, mais notre serveur n’a pas pu '
            . 'l’expédier à l’instant. Si c’est urgent, appelez-nous.',
        'partiA'    => 'Merci ',
        'partiB'    => ' ! Votre message est parti, nous vous répondons au plus vite.',
    ],
    'en' => [
        'recu'      => 'Message received, thank you!',
        'nom'       => 'Please give your name.',
        'email'     => 'Invalid e-mail address.',
        'court'     => 'Your message is a little short.',
        'long'      => 'Message too long: 5000 characters maximum.',
        'interdit'  => 'This field contains a forbidden character.',
        'trop'      => 'You have already sent several messages. Please wait an hour, '
            . 'or call us directly.',
        'inactif'   => 'The form is not configured yet. Please reach us by phone.',
        'methode'   => 'Method not allowed.',
        'panne'     => 'Your message has been saved, but our server could not send it just '
            . 'now. If it is urgent, please call us.',
        'partiA'    => 'Thank you ',
        'partiB'    => '! Your message is on its way, we will reply as soon as we can.',
    ],
][$langue];

/* ---------------------------------------------------------------
   Limitation : cinq messages par heure et par adresse IP.
   De quoi écrire plusieurs fois dans la journée sans permettre
   à un robot de vider un carnet d'adresses dans la boîte du bar.
   --------------------------------------------------------------- */

const MAX_ENVOIS = 5;
const FENETRE_ENVOIS = 3600;

function envois_recents(): array
{
    if (!is_file(chemin_envois())) {
        return [];
    }
    $brut = include chemin_envois();
    if (!is_array($brut)) {
        return [];
    }
    $limite = time() - FENETRE_ENVOIS;
    return array_filter($brut, static fn($e) => ($e['dernier'] ?? 0) > $limite);
}

function enregistrer_envoi(): void
{
    $envois = envois_recents();
    $cle = cle_client();
    $envois[$cle] = [
        'nombre'  => ($envois[$cle]['nombre'] ?? 0) + 1,
        'dernier' => time(),
    ];
    ecrire_atomique(
        chemin_envois(),
        "<?php\n// Envois récents du formulaire — fichier technique.\nreturn "
            . var_export($envois, true) . ";\n"
    );
}

$entree = envois_recents()[cle_client()] ?? null;
if (($entree['nombre'] ?? 0) >= MAX_ENVOIS) {
    reponse_json([
        'erreur' => $TEXTES['trop'],
    ], 429);
}

/* ---------------------------------------------------------------
   Lecture et validation
   --------------------------------------------------------------- */


/*
 * Deux pièges à robots, invisibles pour un visiteur :
 *   - « societe » est un champ masqué que seul un automate remplit ;
 *   - « duree » est le temps passé sur le formulaire, mesuré par la page
 *     elle-même. Un humain met plus de trois secondes à écrire un message,
 *     un script en met zéro.
 *
 * On demande une DURÉE et non l'heure d'affichage : une durée est la
 * différence entre deux lectures de la même horloge, donc insensible à un
 * téléphone mal réglé. Un horodatage absolu, lui, ferait passer pour un
 * robot tout visiteur dont l'horloge avance de quelques secondes.
 *
 * On répond « ok » dans les deux cas : un robot informé de son échec
 * réessaie, un robot qui croit avoir réussi passe à autre chose.
 */
$duree = (int) ($corps['duree'] ?? 0) / 1000;
if ($champ('societe') !== '' || $duree < 3 || $duree > 43200) {
    reponse_json(['ok' => true, 'message' => $TEXTES['recu']]);
}

$nom = $champ('nom');
$email = $champ('email');
$telephone = $champ('telephone');
$sujet = $champ('sujet');
$message = $champ('message');

$erreurs = [];
if (mb_strlen($nom) < 2) {
    $erreurs['nom'] = $TEXTES['nom'];
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $erreurs['email'] = $TEXTES['email'];
}
if (mb_strlen($message) < 10) {
    $erreurs['message'] = $TEXTES['court'];
}
if (mb_strlen($nom) > 120 || mb_strlen($message) > 5000) {
    $erreurs['message'] = $TEXTES['long'];
}
// Un en-tête de courriel se termine par un retour à la ligne : en glisser un
// dans le nom ou le sujet permettrait d'ajouter des destinataires cachés.
foreach (['nom' => $nom, 'email' => $email, 'sujet' => $sujet, 'telephone' => $telephone] as $cle => $valeur) {
    if (preg_match('/[\r\n]/', $valeur)) {
        $erreurs[$cle] = $TEXTES['interdit'];
    }
}

if ($erreurs) {
    reponse_json(['erreurs' => $erreurs], 422);
}

$destinataire = lire_destinataire();
if ($destinataire === '' || !filter_var($destinataire, FILTER_VALIDATE_EMAIL)) {
    reponse_json([
        'erreur' => $TEXTES['inactif'],
    ], 503);
}

/* ---------------------------------------------------------------
   Journal : écrit avant l'envoi, pour ne rien perdre
   --------------------------------------------------------------- */

$recu = [
    'date'      => date('c'),
    'nom'       => $nom,
    'email'     => $email,
    'telephone' => $telephone,
    'sujet'     => $sujet,
    'message'   => $message,
];

$journal = [];
if (is_file(chemin_messages())) {
    $lu = include chemin_messages();
    if (is_array($lu)) {
        $journal = $lu;
    }
}
$journal[] = $recu;
$journal = array_slice($journal, -200);   // on garde les 200 derniers
ecrire_atomique(
    chemin_messages(),
    "<?php\n// Messages reçus par le formulaire — journal de secours.\nreturn "
        . var_export($journal, true) . ";\n"
);

enregistrer_envoi();

/* ---------------------------------------------------------------
   Envoi
   --------------------------------------------------------------- */

$sujetCourriel = '[Site] ' . ($sujet !== '' ? $sujet : 'Message du formulaire');

$signature = array_filter([
    'Envoyé depuis le formulaire du site.',
    'Nom : ' . $nom,
    'E-mail : ' . $email,
    $telephone !== '' ? 'Téléphone : ' . $telephone : '',
    $sujet !== '' ? 'Sujet : ' . $sujet : '',
    'Reçu le ' . date('d/m/Y à H\hi'),
], static fn($l) => $l !== '');

$corpsCourriel = $message . "\n\n--\n" . implode("\n", $signature);

$expediteur = expediteur_technique();
$entetes = [
    'From: =?UTF-8?B?' . base64_encode('Site Le P’tit Ravisé') . '?= <' . $expediteur . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: leptitravise-contact',
];

$envoye = @mail(
    $destinataire,
    '=?UTF-8?B?' . base64_encode($sujetCourriel) . '?=',
    $corpsCourriel,
    implode("\r\n", $entetes),
    '-f' . $expediteur
);

if (!$envoye) {
    // Le message est déjà dans le journal : on ne demande pas au visiteur
    // de recommencer, on lui donne simplement l'autre voie.
    reponse_json([
        'ok'      => true,
        'envoye'  => false,
        'message' => $TEXTES['panne'],
    ]);
}

reponse_json([
    'ok'      => true,
    'envoye'  => true,
    'message' => $TEXTES['partiA'] . $nom . $TEXTES['partiB'],
]);
