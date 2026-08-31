/* =========================================================
   Le Petit Ravisé — console d'administration
   ---------------------------------------------------------
   Le site est statique : il n'a ni serveur ni base de données.
   L'authentification est donc déléguée à GitHub, où le site
   est hébergé. Concrètement :

     · vous collez une clé d'accès créée sur votre compte ;
     · la console lit et écrit js/donnees.js via l'API GitHub ;
     · publier = enregistrer un commit ; le site se met à jour.

   La clé reste dans votre navigateur (localStorage si vous
   cochez « rester connecté », sinon sessionStorage) et n'est
   transmise qu'à api.github.com.
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     Dépôt cible. À modifier si le site déménage.
     --------------------------------------------------------- */
  var DEPOT = {
    proprietaire: 'sanctimaps-gif',
    nom: 'mon-depot',
    branche: 'claude/bar-website-bhb7oq',
    fichier: 'js/donnees.js'
  };

  var API = 'https://api.github.com';
  var CLE_STOCKAGE = 'lpr-admin-token';

  var etat = null;        // données en cours d'édition
  var reference = null;   // copie de départ, pour détecter les modifications
  var shaFichier = null;  // version du fichier côté GitHub
  var jeton = null;

  /* =========================================================
     Utilitaires
     ========================================================= */
  var $ = function (id) { return document.getElementById(id); };

  function copie(valeur) { return JSON.parse(JSON.stringify(valeur)); }

  function encoderBase64(texte) {
    // btoa ne gère que le binaire : on encode d'abord en UTF-8,
    // sinon les accents et les emoji cassent le fichier publié.
    var octets = new TextEncoder().encode(texte);
    var binaire = '';
    octets.forEach(function (octet) { binaire += String.fromCharCode(octet); });
    return btoa(binaire);
  }

  function lireJeton() {
    try {
      return localStorage.getItem(CLE_STOCKAGE) || sessionStorage.getItem(CLE_STOCKAGE) || null;
    } catch (e) {
      return null;   // navigation privée, cookies bloqués…
    }
  }

  function ecrireJeton(valeur, persistant) {
    try {
      (persistant ? localStorage : sessionStorage).setItem(CLE_STOCKAGE, valeur);
    } catch (e) { /* la session fonctionne quand même, sans mémorisation */ }
  }

  function effacerJeton() {
    try {
      localStorage.removeItem(CLE_STOCKAGE);
      sessionStorage.removeItem(CLE_STOCKAGE);
    } catch (e) { /* rien à faire */ }
  }

  function appelGitHub(chemin, options) {
    options = options || {};
    return fetch(API + chemin, {
      method: options.method || 'GET',
      headers: {
        'Authorization': 'Bearer ' + jeton,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    }).then(function (reponse) {
      return reponse.json().catch(function () { return {}; }).then(function (donnees) {
        return { ok: reponse.ok, statut: reponse.status, donnees: donnees };
      });
    });
  }

  /* =========================================================
     Connexion
     ========================================================= */
  function messageConnexion(texte, type) {
    var el = $('statutConnexion');
    el.textContent = texte || '';
    el.className = 'form-status' + (type ? ' is-' + type : '');
  }

  function connecter(valeurJeton, persistant) {
    jeton = valeurJeton;
    messageConnexion('Vérification de la clé…');

    return appelGitHub('/user').then(function (r) {
      if (!r.ok) {
        jeton = null;
        if (r.statut === 401) throw new Error('Clé refusée par GitHub. Vérifiez qu’elle est complète et non expirée.');
        throw new Error('GitHub a répondu ' + r.statut + '. Réessayez dans un instant.');
      }
      var utilisateur = r.donnees.login;

      return chargerFichier().then(function () {
        if (persistant !== null) ecrireJeton(jeton, persistant);
        $('adminUser').textContent = 'Connecté : ' + utilisateur;
        $('barActions').hidden = false;
        $('ecranConnexion').hidden = true;
        $('ecranConsole').hidden = false;
        $('barrePublication').hidden = false;
        messageConnexion('');
        dessinerTout();
      });
    });
  }

  function chargerFichier() {
    var chemin = '/repos/' + DEPOT.proprietaire + '/' + DEPOT.nom + '/contents/' +
                 DEPOT.fichier + '?ref=' + encodeURIComponent(DEPOT.branche);

    return appelGitHub(chemin).then(function (r) {
      if (!r.ok) {
        jeton = null;
        if (r.statut === 404) {
          throw new Error('Dépôt ou fichier introuvable. La clé donne-t-elle bien accès à ' +
                          DEPOT.proprietaire + '/' + DEPOT.nom + ' ?');
        }
        if (r.statut === 403) {
          throw new Error('Accès refusé : la clé n’a pas la permission « Contents : Read and write ».');
        }
        throw new Error('Lecture impossible (erreur ' + r.statut + ').');
      }
      shaFichier = r.donnees.sha;

      // Les données affichées sont celles chargées avec la page (js/donnees.js).
      // Le fichier distant ne sert ici qu'à récupérer son sha, indispensable
      // pour écrire sans écraser une modification faite ailleurs.
      etat = copie(window.DONNEES || { reglages: {}, carte: [], evenements: [] });
      etat.reglages = etat.reglages || {};
      etat.carte = etat.carte || [];
      etat.evenements = etat.evenements || [];
      reference = copie(etat);
    });
  }

  $('formConnexion').addEventListener('submit', function (e) {
    e.preventDefault();
    var champ = $('token');
    var valeur = champ.value.trim();
    var erreur = document.querySelector('[data-error-for="token"]');

    if (!valeur) {
      erreur.textContent = 'Collez votre clé d’accès GitHub.';
      champ.setAttribute('aria-invalid', 'true');
      champ.focus();
      return;
    }
    erreur.textContent = '';
    champ.removeAttribute('aria-invalid');
    $('btnConnexion').disabled = true;

    connecter(valeur, $('memoriser').checked)
      .catch(function (err) {
        messageConnexion(err.message, 'error');
      })
      .then(function () { $('btnConnexion').disabled = false; });
  });

  $('btnDeconnexion').addEventListener('click', function () {
    if (aDesModifications() && !confirm('Des modifications ne sont pas publiées. Se déconnecter quand même ?')) return;
    effacerJeton();
    location.reload();
  });

  /* =========================================================
     Suivi des modifications
     ========================================================= */
  function aDesModifications() {
    return etat && reference && JSON.stringify(etat) !== JSON.stringify(reference);
  }

  function majEtatModifs() {
    var modifie = aDesModifications();
    var libelle = $('etatModifs');
    libelle.textContent = modifie ? 'Modifications non publiées' : 'Aucune modification';
    libelle.classList.toggle('modifie', modifie);
    $('btnPublier').disabled = !modifie;
    $('btnAnnuler').disabled = !modifie;
  }

  window.addEventListener('beforeunload', function (e) {
    if (aDesModifications()) { e.preventDefault(); e.returnValue = ''; }
  });

  /* =========================================================
     Onglets
     ========================================================= */
  var onglets = Array.prototype.slice.call(document.querySelectorAll('.admin-tab'));

  function choisirOnglet(onglet, donnerFocus) {
    onglets.forEach(function (o) {
      var actif = o === onglet;
      o.setAttribute('aria-selected', String(actif));
      o.tabIndex = actif ? 0 : -1;
      var panneau = $(o.getAttribute('aria-controls'));
      if (panneau) panneau.hidden = !actif;
    });
    if (donnerFocus) onglet.focus();
  }

  onglets.forEach(function (onglet, index) {
    onglet.addEventListener('click', function () { choisirOnglet(onglet, false); });
    onglet.addEventListener('keydown', function (e) {
      var suivant = null;
      if (e.key === 'ArrowRight') suivant = onglets[(index + 1) % onglets.length];
      else if (e.key === 'ArrowLeft') suivant = onglets[(index - 1 + onglets.length) % onglets.length];
      if (suivant) { e.preventDefault(); choisirOnglet(suivant, true); }
    });
  });

  /* =========================================================
     Réglages
     ========================================================= */
  function dessinerReglages() {
    $('r-email').value = etat.reglages.email || '';
    $('r-tel').value = etat.reglages.telephone || '';
    $('r-tel-lien').value = etat.reglages.telephoneLien || '';
    $('r-mention').value = etat.reglages.mentionTarifs || '';
  }

  function brancherReglages() {
    var champs = {
      'r-email': 'email',
      'r-tel': 'telephone',
      'r-tel-lien': 'telephoneLien',
      'r-mention': 'mentionTarifs'
    };
    Object.keys(champs).forEach(function (id) {
      $(id).addEventListener('input', function () {
        etat.reglages[champs[id]] = $(id).value.trim();
        majEtatModifs();
      });
    });

    $('r-email').addEventListener('blur', function () {
      var valeur = $('r-email').value.trim();
      var erreur = document.querySelector('[data-error-for="r-email"]');
      var valide = !valeur || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valeur);
      erreur.textContent = valide ? '' : 'Cette adresse ne semble pas valide.';
      $('r-email').setAttribute('aria-invalid', valide ? 'false' : 'true');
    });
  }

  /* =========================================================
     Carte
     ========================================================= */
  function champTexte(valeur, placeholder, surSaisie) {
    var input = document.createElement('input');
    input.type = 'text';
    input.value = valeur || '';
    input.placeholder = placeholder;
    input.addEventListener('input', function () { surSaisie(input.value); majEtatModifs(); });
    return input;
  }

  function boutonSuppression(titre, action) {
    var bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'btn-suppr';
    bouton.textContent = '×';
    bouton.title = titre;
    bouton.setAttribute('aria-label', titre);
    bouton.addEventListener('click', action);
    return bouton;
  }

  function dessinerCarte() {
    var hote = $('carteEditeur');
    hote.innerHTML = '';

    if (!etat.carte.length) {
      var vide = document.createElement('p');
      vide.className = 'vide';
      vide.textContent = 'Aucune rubrique. Ajoutez-en une pour commencer.';
      hote.appendChild(vide);
      return;
    }

    etat.carte.forEach(function (rubrique, iRubrique) {
      var bloc = document.createElement('div');
      bloc.className = 'rubrique';

      var tete = document.createElement('div');
      tete.className = 'rubrique-tete';

      var emoji = champTexte(rubrique.emoji, '🍺', function (v) { rubrique.emoji = v; });
      emoji.className = 'champ-emoji';
      emoji.setAttribute('aria-label', 'Emoji de la rubrique');
      tete.appendChild(emoji);

      var titre = champTexte(rubrique.titre, 'Nom de la rubrique', function (v) {
        rubrique.titre = v;
        // L'identifiant sert d'ancre dans la page ; on le déduit du titre
        // quand il n'a pas encore été fixé.
        if (!rubrique.id) rubrique.id = slug(v);
      });
      titre.setAttribute('aria-label', 'Nom de la rubrique');
      tete.appendChild(titre);

      tete.appendChild(boutonSuppression('Supprimer la rubrique « ' + (rubrique.titre || '') + ' »', function () {
        if (!confirm('Supprimer la rubrique « ' + (rubrique.titre || '') + ' » et toutes ses lignes ?')) return;
        etat.carte.splice(iRubrique, 1);
        dessinerCarte();
        majEtatModifs();
      }));

      bloc.appendChild(tete);

      var corps = document.createElement('div');
      corps.className = 'rubrique-corps';

      var entete = document.createElement('div');
      entete.className = 'entete-colonnes';
      ['Intitulé', 'Prix', 'Description (facultatif)', ''].forEach(function (texte) {
        var span = document.createElement('span');
        span.textContent = texte;
        entete.appendChild(span);
      });
      corps.appendChild(entete);

      rubrique.items = rubrique.items || [];
      rubrique.items.forEach(function (item, iItem) {
        var ligne = document.createElement('div');
        ligne.className = 'ligne-item';

        var nom = champTexte(item.nom, 'Express', function (v) { item.nom = v; });
        nom.setAttribute('aria-label', 'Intitulé');
        ligne.appendChild(nom);

        var prix = champTexte(item.prix, '1,60 €', function (v) { item.prix = v; });
        prix.setAttribute('aria-label', 'Prix');
        ligne.appendChild(prix);

        var desc = champTexte(item.description, 'Précision servie sous l’intitulé', function (v) { item.description = v; });
        desc.setAttribute('aria-label', 'Description');
        ligne.appendChild(desc);

        ligne.appendChild(boutonSuppression('Supprimer la ligne', function () {
          rubrique.items.splice(iItem, 1);
          dessinerCarte();
          majEtatModifs();
        }));

        corps.appendChild(ligne);
      });

      var ajouter = document.createElement('button');
      ajouter.type = 'button';
      ajouter.className = 'btn btn-outline btn-small';
      ajouter.textContent = '+ Ajouter une ligne';
      ajouter.addEventListener('click', function () {
        rubrique.items.push({ nom: '', prix: '', description: '' });
        dessinerCarte();
        majEtatModifs();
        // Le rendu vient d'être reconstruit : on retrouve la rubrique par son
        // index pour placer le curseur dans la ligne qui vient d'apparaître.
        var rubriqueDom = $('carteEditeur').querySelectorAll('.rubrique')[iRubrique];
        var lignes = rubriqueDom ? rubriqueDom.querySelectorAll('.ligne-item') : [];
        if (lignes.length) lignes[lignes.length - 1].querySelector('input').focus();
      });
      corps.appendChild(ajouter);

      bloc.appendChild(corps);
      hote.appendChild(bloc);
    });
  }

  function slug(texte) {
    return (texte || 'rubrique')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'rubrique';
  }

  $('btnAjouterRubrique').addEventListener('click', function () {
    etat.carte.push({ id: 'rubrique-' + (etat.carte.length + 1), emoji: '', titre: '', items: [{ nom: '', prix: '', description: '' }] });
    dessinerCarte();
    majEtatModifs();
  });

  /* =========================================================
     Événements
     ========================================================= */
  function dessinerAgenda() {
    var hote = $('agendaEditeur');
    hote.innerHTML = '';

    if (!etat.evenements.length) {
      var vide = document.createElement('p');
      vide.className = 'vide';
      vide.textContent = 'Aucun événement. Le site affiche « Aucune date annoncée pour le moment ».';
      hote.appendChild(vide);
      return;
    }

    var aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);

    etat.evenements.forEach(function (ev, index) {
      var bloc = document.createElement('div');
      bloc.className = 'evenement';

      var date = new Date((ev.date || '') + 'T00:00:00');
      var passe = !isNaN(date) && date < aujourdhui;
      if (passe) bloc.classList.add('evenement-passe');

      var grille = document.createElement('div');
      grille.className = 'evenement-grille';

      var champDate = document.createElement('input');
      champDate.type = 'date';
      champDate.value = ev.date || '';
      champDate.setAttribute('aria-label', 'Date');
      champDate.addEventListener('input', function () {
        ev.date = champDate.value;
        majEtatModifs();
      });
      champDate.addEventListener('change', function () { dessinerAgenda(); });
      grille.appendChild(champDate);

      var heure = champTexte(ev.heure, '21 h 00', function (v) { ev.heure = v; });
      heure.setAttribute('aria-label', 'Heure');
      grille.appendChild(heure);

      var titre = champTexte(ev.titre, 'Titre de l’événement', function (v) { ev.titre = v; });
      titre.setAttribute('aria-label', 'Titre');
      grille.appendChild(titre);

      grille.appendChild(boutonSuppression('Supprimer cet événement', function () {
        if (!confirm('Supprimer « ' + (ev.titre || 'cet événement') + ' » ?')) return;
        etat.evenements.splice(index, 1);
        dessinerAgenda();
        majEtatModifs();
      }));

      bloc.appendChild(grille);

      var description = champTexte(ev.description, 'Description (facultatif)', function (v) { ev.description = v; });
      description.setAttribute('aria-label', 'Description');
      description.style.marginBottom = '0.6rem';
      bloc.appendChild(description);

      var prix = champTexte(ev.prix, 'Entrée libre', function (v) { ev.prix = v; });
      prix.setAttribute('aria-label', 'Tarif');
      bloc.appendChild(prix);

      if (passe) {
        var badge = document.createElement('span');
        badge.className = 'badge-passe';
        badge.textContent = 'Date passée — masquée sur le site';
        bloc.appendChild(badge);
      }

      hote.appendChild(bloc);
    });
  }

  $('btnAjouterEvenement').addEventListener('click', function () {
    var demain = new Date();
    demain.setDate(demain.getDate() + 1);
    var pad = function (n) { return String(n).padStart(2, '0'); };
    etat.evenements.push({
      date: demain.getFullYear() + '-' + pad(demain.getMonth() + 1) + '-' + pad(demain.getDate()),
      titre: '',
      description: '',
      heure: '',
      prix: ''
    });
    dessinerAgenda();
    majEtatModifs();
  });

  /* =========================================================
     Publication
     ========================================================= */
  var EN_TETE = [
    '/* =========================================================',
    '   Le Petit Ravisé — contenu modifiable du site',
    '   ---------------------------------------------------------',
    '   CE FICHIER EST LA SOURCE UNIQUE du contenu : réglages,',
    '   carte et agenda. Les pages du site le lisent, la console',
    '   d\'administration (admin.html) l\'écrit.',
    '',
    '   Écrit automatiquement — évitez de le modifier à la main',
    '   pendant qu\'une session d\'administration est ouverte.',
    '   ========================================================= */',
    '',
    'window.DONNEES = '
  ].join('\n');

  function nettoyer(donnees) {
    var propre = copie(donnees);
    // Les lignes sans intitulé ne servent à rien : on les retire avant publication.
    propre.carte = (propre.carte || []).map(function (rubrique) {
      rubrique.id = rubrique.id || slug(rubrique.titre);
      rubrique.items = (rubrique.items || []).filter(function (i) { return (i.nom || '').trim(); });
      return rubrique;
    });
    propre.evenements = (propre.evenements || []).filter(function (ev) {
      return (ev.titre || '').trim() && (ev.date || '').trim();
    });
    return propre;
  }

  function messagePublication(texte, type) {
    var el = $('messagePublication');
    el.textContent = texte || '';
    el.className = 'admin-publish-msg' + (type ? ' ' + type : '');
  }

  $('btnAnnuler').addEventListener('click', function () {
    if (!confirm('Annuler toutes les modifications non publiées ?')) return;
    etat = copie(reference);
    dessinerTout();
    majEtatModifs();
    messagePublication('Modifications annulées.', '');
  });

  $('btnPublier').addEventListener('click', function () {
    var propre = nettoyer(etat);
    var contenu = EN_TETE + JSON.stringify(propre, null, 2) + ';\n';

    $('btnPublier').disabled = true;
    messagePublication('Publication en cours…', '');

    var chemin = '/repos/' + DEPOT.proprietaire + '/' + DEPOT.nom + '/contents/' + DEPOT.fichier;

    appelGitHub(chemin, {
      method: 'PUT',
      body: {
        message: 'Mise à jour du contenu du site depuis la console d\'administration',
        content: encoderBase64(contenu),
        sha: shaFichier,
        branch: DEPOT.branche
      }
    }).then(function (r) {
      if (!r.ok) {
        if (r.statut === 409 || r.statut === 422) {
          throw new Error('Le fichier a été modifié ailleurs entre-temps. Rechargez la page ' +
                          '(vos modifications seront perdues) puis recommencez.');
        }
        if (r.statut === 403) {
          throw new Error('Écriture refusée : la clé n’a pas la permission « Contents : Read and write ».');
        }
        throw new Error('Publication impossible (erreur ' + r.statut + ').' +
                        (r.donnees && r.donnees.message ? ' ' + r.donnees.message : ''));
      }
      shaFichier = r.donnees.content && r.donnees.content.sha;
      etat = propre;
      reference = copie(propre);
      dessinerTout();
      majEtatModifs();
      messagePublication('Publié. Le site se met à jour dans une minute environ — pensez à ' +
                         'rafraîchir la page en forçant le rechargement (Ctrl+F5).', 'ok');
    }).catch(function (err) {
      messagePublication(err.message, 'ko');
      $('btnPublier').disabled = false;
    });
  });

  /* =========================================================
     Rendu global
     ========================================================= */
  function dessinerTout() {
    dessinerReglages();
    dessinerCarte();
    dessinerAgenda();
    majEtatModifs();
  }

  brancherReglages();

  // Reconnexion automatique si une clé a été mémorisée.
  var memorise = lireJeton();
  if (memorise) {
    connecter(memorise, null).catch(function (err) {
      effacerJeton();
      messageConnexion(err.message + ' Reconnectez-vous.', 'error');
    });
  }
})();
