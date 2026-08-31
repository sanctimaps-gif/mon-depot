<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';

demarrer_session();

$installation = !compte_existe();          // aucun compte : ni livré, ni personnalisé
$connecte = !$installation && est_connecte();
// Le mot de passe livré avec le site reste utilisable tant qu'il n'a pas été
// changé ; on se contente de le rappeler dans la console.
$motDePasseLivre = $connecte && doit_changer_mot_de_passe();

header('X-Frame-Options: DENY');
header('Referrer-Policy: same-origin');

$donnees = $connecte ? lire_donnees() : null;

// ?onglet=carte permet d'arriver directement sur la bonne section depuis
// le site ; toute valeur inconnue retombe sur les réglages.
$ongletsValides = ['reglages', 'carte', 'agenda', 'photos', 'compte'];
$onglet = in_array($_GET['onglet'] ?? '', $ongletsValides, true) ? $_GET['onglet'] : 'reglages';
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Administration — Le P’tit Ravisé</title>
  <meta name="robots" content="noindex, nofollow">
  <meta name="theme-color" content="#1f4d3d">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔑</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="../css/admin.css">
</head>
<body class="admin">

<header class="admin-bar">
  <div class="wrap admin-bar-inner">
    <div class="brand">
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 8h14v6a5 5 0 01-5 5H8a5 5 0 01-5-5z"/><path d="M17 10h2a2.5 2.5 0 010 5h-2"/><path d="M6 4.5V3M10 4.5V3M14 4.5V3"/>
        </svg>
      </span>
      <span class="brand-text">
        <span class="brand-name">Administration</span>
        <span class="brand-sub">Le P’tit Ravisé</span>
      </span>
    </div>
    <?php if ($connecte): ?>
      <div class="admin-bar-actions">
        <span class="admin-user"><?= e((string) ($_SESSION['email'] ?? '')) ?></span>
        <a class="btn btn-outline btn-small" href="../index.html" target="_blank" rel="noopener">Voir le site</a>
        <button class="btn btn-outline btn-small" type="button" id="btnDeconnexion">Se déconnecter</button>
      </div>
    <?php endif; ?>
  </div>
</header>

<main class="admin-main">

<?php if ($installation): ?>
  <!-- ================= INSTALLATION ================= -->
  <section class="wrap-narrow">
    <div class="admin-card">
      <h1>Créer le compte administrateur</h1>
      <p class="lead">Première visite : choisissez l'adresse e-mail et le mot de passe qui
        permettront de modifier le site. Ce compte n'est lié à aucun service extérieur.</p>

      <form id="formInstallation" novalidate>
        <div class="field">
          <label for="i-email">Adresse e-mail</label>
          <input type="email" id="i-email" autocomplete="username" required>
          <p class="error" data-error-for="i-email"></p>
        </div>
        <div class="field">
          <label for="i-mdp">Mot de passe</label>
          <input type="password" id="i-mdp" autocomplete="new-password" required>
          <p class="note">Au moins 10 caractères. Une phrase dont vous vous souvenez vaut mieux
            qu'un mot compliqué : <em>le café de 7 h est le meilleur</em>.</p>
          <p class="error" data-error-for="i-mdp"></p>
        </div>
        <div class="field">
          <label for="i-mdp2">Confirmer le mot de passe</label>
          <input type="password" id="i-mdp2" autocomplete="new-password" required>
          <p class="error" data-error-for="i-mdp2"></p>
        </div>
        <button class="btn btn-block" type="submit">Créer le compte</button>
        <p class="form-status" id="statutInstallation" role="status" aria-live="polite"></p>
      </form>

      <div class="callout callout-info" style="margin-top:1.6rem">
        <p><strong>Notez le mot de passe.</strong> Il n'est stocké nulle part en clair, pas même
          sur le serveur : seule son empreinte l'est. Perdu, il faudra supprimer le fichier
          <code>admin/compte.php</code> par FTP pour repartir de cet écran.</p>
      </div>
    </div>
  </section>

<?php elseif (!$connecte): ?>
  <!-- ================= CONNEXION ================= -->
  <section class="wrap-narrow">
    <div class="admin-card">
      <h1>Connexion</h1>
      <p class="lead">Espace réservé au bar.</p>

      <form id="formConnexion" novalidate>
        <div class="field">
          <label for="c-email">Adresse e-mail</label>
          <input type="email" id="c-email" autocomplete="username" required>
          <p class="error" data-error-for="c-email"></p>
        </div>
        <div class="field">
          <label for="c-mdp">Mot de passe</label>
          <input type="password" id="c-mdp" autocomplete="current-password" required>
          <p class="error" data-error-for="c-mdp"></p>
        </div>
        <button class="btn btn-block" type="submit" id="btnConnexion">Se connecter</button>
        <p class="form-status" id="statutConnexion" role="status" aria-live="polite"></p>
      </form>
    </div>
  </section>

<?php else: ?>
  <!-- ================= CONSOLE ================= -->
  <section>
    <div class="wrap">
      <div class="admin-tabs" role="tablist" aria-label="Sections à modifier">
        <button role="tab" id="tab-reglages" aria-controls="panel-reglages" aria-selected="true" class="admin-tab">Réglages</button>
        <button role="tab" id="tab-carte" aria-controls="panel-carte" aria-selected="false" class="admin-tab" tabindex="-1">La carte</button>
        <button role="tab" id="tab-agenda" aria-controls="panel-agenda" aria-selected="false" class="admin-tab" tabindex="-1">Événements</button>
        <button role="tab" id="tab-photos" aria-controls="panel-photos" aria-selected="false" class="admin-tab" tabindex="-1">Photos</button>
        <button role="tab" id="tab-compte" aria-controls="panel-compte" aria-selected="false" class="admin-tab" tabindex="-1">Mon compte</button>
      </div>

      <div role="tabpanel" id="panel-reglages" aria-labelledby="tab-reglages" class="admin-panel" tabindex="0">
        <div class="admin-card">
          <h2>Réglages</h2>
          <div class="field">
            <label for="r-email">Adresse e-mail de contact</label>
            <input type="email" id="r-email" placeholder="contact@exemple.fr">
            <p class="note">Dès qu'elle est renseignée, le formulaire du site l'utilise : le
              visiteur envoie son message depuis sa messagerie. Laissée vide, le formulaire
              renvoie vers le téléphone.</p>
            <p class="error" data-error-for="r-email"></p>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="r-tel">Téléphone affiché</label>
              <input type="text" id="r-tel" placeholder="02 35 71 66 79">
            </div>
            <div class="field">
              <label for="r-tel-lien">Téléphone, format international</label>
              <input type="text" id="r-tel-lien" placeholder="+33235716679">
              <p class="note">Utilisé par le bouton « Appeler ».</p>
            </div>
          </div>
          <div class="field">
            <label for="r-mention">Mention affichée en haut de la carte</label>
            <input type="text" id="r-mention" placeholder="Tarifs affichés au comptoir et en terrasse.">
            <p class="note">Elle disparaît d'elle-même dès qu'au moins un prix est renseigné.</p>
          </div>
        </div>
      </div>

      <div role="tabpanel" id="panel-carte" aria-labelledby="tab-carte" class="admin-panel" tabindex="0" hidden>
        <div class="admin-card">
          <h2>La carte</h2>
          <p class="note">Laissez un prix vide pour ne pas l'afficher. Une ligne sans intitulé est
            ignorée. L'ordre à l'écran est celui du site.</p>
          <div id="carteEditeur"></div>
          <button class="btn btn-outline" type="button" id="btnAjouterRubrique">+ Ajouter une rubrique</button>
        </div>
      </div>

      <div role="tabpanel" id="panel-agenda" aria-labelledby="tab-agenda" class="admin-panel" tabindex="0" hidden>
        <div class="admin-card">
          <h2>Événements</h2>
          <p class="note">Les dates passées disparaissent automatiquement du site.</p>
          <div id="agendaEditeur"></div>
          <button class="btn btn-outline" type="button" id="btnAjouterEvenement">+ Ajouter un événement</button>
        </div>
      </div>

      <div role="tabpanel" id="panel-photos" aria-labelledby="tab-photos" class="admin-panel" tabindex="0" hidden>
        <div class="admin-card">
          <h2>Photos de la galerie</h2>
          <p class="note">Une photo se dépose directement depuis la page « Le bar » du site :
            le bouton <em>Ajouter une photo</em> apparaît sur les emplacements vides. Pour en
            remplacer une, retirez-la ici — l'emplacement redevient libre et le bouton réapparaît.</p>
          <div id="photosEditeur"></div>
        </div>
      </div>

      <div role="tabpanel" id="panel-compte" aria-labelledby="tab-compte" class="admin-panel" tabindex="0" hidden>
        <div class="admin-card">
          <h2>Mon compte</h2>
          <?php if ($motDePasseLivre): ?>
            <div class="callout">
              <span class="ico" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/></svg>
              </span>
              <p><strong>Vous utilisez encore le mot de passe livré avec le site.</strong>
                Il est identique sur toutes les copies : choisissez-en un autre ci-dessous.</p>
            </div>
          <?php endif; ?>
          <form id="formMotDePasse" novalidate>
            <div class="field">
              <label for="m-email">Adresse de connexion</label>
              <input type="email" id="m-email" autocomplete="username"
                     value="<?= e((string) ($_SESSION['email'] ?? '')) ?>">
              <p class="note">Laissez telle quelle pour ne pas la modifier.</p>
              <p class="error" data-error-for="m-email"></p>
            </div>
            <div class="field">
              <label for="m-actuel">Mot de passe actuel</label>
              <input type="password" id="m-actuel" autocomplete="current-password">
              <p class="error" data-error-for="m-actuel"></p>
            </div>
            <div class="field">
              <label for="m-nouveau">Nouveau mot de passe</label>
              <input type="password" id="m-nouveau" autocomplete="new-password">
              <p class="note">Au moins 10 caractères.</p>
              <p class="error" data-error-for="m-nouveau"></p>
            </div>
            <button class="btn" type="submit">Enregistrer mes identifiants</button>
            <p class="form-status" id="statutMotDePasse" role="status" aria-live="polite"></p>
          </form>
        </div>
      </div>
    </div>
  </section>
<?php endif; ?>

</main>

<?php if ($connecte): ?>
  <div class="admin-publish" id="barrePublication">
    <div class="wrap admin-publish-inner">
      <p class="admin-publish-state" id="etatModifs">Aucune modification</p>
      <div class="admin-publish-actions">
        <button class="btn btn-outline" type="button" id="btnAnnuler" disabled>Tout annuler</button>
        <button class="btn" type="button" id="btnPublier" disabled>Enregistrer et publier</button>
      </div>
    </div>
    <p class="admin-publish-msg" id="messagePublication" role="status" aria-live="polite"></p>
  </div>
<?php endif; ?>

<script>
  window.ADMIN = {
    mode: <?= json_encode($installation ? 'installation' : ($connecte ? 'console' : 'connexion')) ?>,
    csrf: <?= json_encode($connecte ? jeton_csrf() : '') ?>,
    onglet: <?= json_encode($onglet) ?>,
    donnees: <?= json_encode($donnees ?? new stdClass(), JSON_UNESCAPED_UNICODE) ?>
  };
</script>
<script src="console.js"></script>
</body>
</html>
