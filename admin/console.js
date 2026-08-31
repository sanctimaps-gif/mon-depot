/* =========================================================
   Le P’tit Ravisé — console d'administration (côté navigateur)
   ---------------------------------------------------------
   Dialogue avec admin/api.php. Aucun service extérieur :
   le compte, la session et le contenu vivent sur le serveur
   qui héberge le site.
   ========================================================= */
(function () {
  'use strict';

  var CONFIG = window.ADMIN || {};
  var $ = function (id) { return document.getElementById(id); };

  function copie(valeur) { return JSON.parse(JSON.stringify(valeur)); }

  function afficher(cible, texte, type) {
    var el = $(cible);
    if (!el) return;
    el.textContent = texte || '';
    el.className = 'form-status' + (type ? ' is-' + type : '');
  }

  function erreurChamp(nom, message) {
    var champ = $(nom);
    var slot = document.querySelector('[data-error-for="' + nom + '"]');
    if (slot) slot.textContent = message || '';
    if (champ) {
      if (message) champ.setAttribute('aria-invalid', 'true');
      else champ.removeAttribute('aria-invalid');
    }
    return !message;
  }

  function appel(action, charge) {
    var corps = charge || {};
    corps.action = action;
    corps.csrf = CONFIG.csrf;

    return fetch('api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(corps)
    }).then(function (reponse) {
      return reponse.json().catch(function () { return {}; }).then(function (donnees) {
        if (!reponse.ok) throw new Error(donnees.erreur || 'Erreur ' + reponse.status + '.');
        return donnees;
      });
    }).catch(function (err) {
      // Une coupure réseau ne doit pas ressembler à un refus du serveur.
      if (err instanceof TypeError) throw new Error('Serveur injoignable. Vérifiez votre connexion.');
      throw err;
    });
  }

  /* =========================================================
     Installation
     ========================================================= */
  if (CONFIG.mode === 'installation') {
    $('formInstallation').addEventListener('submit', function (e) {
      e.preventDefault();
      var email = $('i-email').value.trim();
      var mdp = $('i-mdp').value;
      var mdp2 = $('i-mdp2').value;

      var ok = erreurChamp('i-email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? '' : 'Adresse e-mail invalide.');
      ok = erreurChamp('i-mdp', mdp.length < 10 ? 'Au moins 10 caractères.' : '') && ok;
      ok = erreurChamp('i-mdp2', mdp2 !== mdp ? 'Les deux mots de passe diffèrent.' : '') && ok;
      if (!ok) return;

      afficher('statutInstallation', 'Création du compte…');
      appel('installer', { email: email, motDePasse: mdp })
        .then(function () { location.reload(); })
        .catch(function (err) { afficher('statutInstallation', err.message, 'error'); });
    });
    return;
  }

  /* =========================================================
     Connexion
     ========================================================= */
  if (CONFIG.mode === 'connexion') {
    $('formConnexion').addEventListener('submit', function (e) {
      e.preventDefault();
      var email = $('c-email').value.trim();
      var mdp = $('c-mdp').value;

      var ok = erreurChamp('c-email', email ? '' : 'Indiquez votre adresse e-mail.');
      ok = erreurChamp('c-mdp', mdp ? '' : 'Indiquez votre mot de passe.') && ok;
      if (!ok) return;

      $('btnConnexion').disabled = true;
      afficher('statutConnexion', 'Vérification…');
      appel('connexion', { email: email, motDePasse: mdp })
        .then(function () { location.reload(); })
        .catch(function (err) {
          afficher('statutConnexion', err.message, 'error');
          $('btnConnexion').disabled = false;
        });
    });
    return;
  }

  /* =========================================================
     Console
     ========================================================= */
  var etat = copie(CONFIG.donnees || {});
  etat.reglages = etat.reglages || {};
  etat.carte = etat.carte || [];
  etat.evenements = etat.evenements || [];
  var reference = copie(etat);

  function aDesModifications() {
    return JSON.stringify(etat) !== JSON.stringify(reference);
  }

  function majEtatModifs() {
    var modifie = aDesModifications();
    var libelle = $('etatModifs');
    libelle.textContent = modifie ? 'Modifications non enregistrées' : 'Aucune modification';
    libelle.classList.toggle('modifie', modifie);
    $('btnPublier').disabled = !modifie;
    $('btnAnnuler').disabled = !modifie;
  }

  window.addEventListener('beforeunload', function (e) {
    if (aDesModifications()) { e.preventDefault(); e.returnValue = ''; }
  });

  /* ---- Onglets ---- */
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

  /* ---- Réglages ---- */
  function dessinerReglages() {
    $('r-email').value = etat.reglages.email || '';
    $('r-tel').value = etat.reglages.telephone || '';
    $('r-tel-lien').value = etat.reglages.telephoneLien || '';
    $('r-mention').value = etat.reglages.mentionTarifs || '';
  }

  var champsReglages = {
    'r-email': 'email',
    'r-tel': 'telephone',
    'r-tel-lien': 'telephoneLien',
    'r-mention': 'mentionTarifs'
  };
  Object.keys(champsReglages).forEach(function (id) {
    $(id).addEventListener('input', function () {
      etat.reglages[champsReglages[id]] = $(id).value.trim();
      majEtatModifs();
    });
  });
  $('r-email').addEventListener('blur', function () {
    var valeur = $('r-email').value.trim();
    erreurChamp('r-email', (!valeur || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valeur)) ? '' : 'Cette adresse ne semble pas valide.');
  });

  /* ---- Fabriques de champs ---- */
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

  function identifiant(texte) {
    return (texte || 'rubrique')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'rubrique';
  }

  /* ---- Carte ---- */
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
        if (!rubrique.id) rubrique.id = identifiant(v);
      });
      titre.setAttribute('aria-label', 'Nom de la rubrique');
      tete.appendChild(titre);

      tete.appendChild(boutonSuppression('Supprimer la rubrique', function () {
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

        var desc = champTexte(item.description, 'Précision sous l’intitulé', function (v) { item.description = v; });
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

  $('btnAjouterRubrique').addEventListener('click', function () {
    etat.carte.push({ id: '', emoji: '', titre: '', items: [{ nom: '', prix: '', description: '' }] });
    dessinerCarte();
    majEtatModifs();
  });

  /* ---- Événements ---- */
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
      champDate.addEventListener('input', function () { ev.date = champDate.value; majEtatModifs(); });
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
      titre: '', description: '', heure: '', prix: ''
    });
    dessinerAgenda();
    majEtatModifs();
  });

  /* ---- Photos ---- */
  etat.photos = etat.photos || [];

  function dessinerPhotos() {
    var hote = $('photosEditeur');
    if (!hote) return;
    hote.innerHTML = '';

    if (!etat.photos.length) {
      var vide = document.createElement('p');
      vide.className = 'vide';
      vide.textContent = 'Aucun emplacement photo.';
      hote.appendChild(vide);
      return;
    }

    var grille = document.createElement('div');
    grille.className = 'photos-grille';

    etat.photos.forEach(function (photo) {
      var bloc = document.createElement('div');
      bloc.className = 'photo-case';

      if (photo.fichier) {
        var image = document.createElement('img');
        image.src = '../img/photos/' + photo.fichier;
        image.alt = photo.legende || '';
        bloc.appendChild(image);
      } else {
        var vide2 = document.createElement('div');
        vide2.className = 'photo-vide';
        vide2.textContent = 'Emplacement libre';
        bloc.appendChild(vide2);
      }

      var titre = document.createElement('p');
      titre.className = 'photo-legende';
      titre.textContent = photo.legende || photo.id;
      bloc.appendChild(titre);

      if (photo.fichier) {
        var retirer = document.createElement('button');
        retirer.type = 'button';
        retirer.className = 'btn btn-outline btn-small';
        retirer.textContent = 'Retirer la photo';
        retirer.addEventListener('click', function () {
          if (!confirm('Retirer la photo « ' + (photo.legende || photo.id) + ' » ? ' +
                       'L’illustration reprend sa place et une nouvelle photo pourra être déposée.')) return;
          photo.fichier = '';
          dessinerPhotos();
          majEtatModifs();
        });
        bloc.appendChild(retirer);
      }

      grille.appendChild(bloc);
    });
    hote.appendChild(grille);
  }

  /* ---- Enregistrement ---- */
  function messagePublication(texte, type) {
    var el = $('messagePublication');
    el.textContent = texte || '';
    el.className = 'admin-publish-msg' + (type ? ' ' + type : '');
  }

  $('btnAnnuler').addEventListener('click', function () {
    if (!confirm('Annuler toutes les modifications non enregistrées ?')) return;
    etat = copie(reference);
    dessinerTout();
    messagePublication('Modifications annulées.', '');
  });

  $('btnPublier').addEventListener('click', function () {
    $('btnPublier').disabled = true;
    messagePublication('Enregistrement…');

    appel('enregistrer', { donnees: etat })
      .then(function (r) {
        etat = r.donnees;
        etat.reglages = etat.reglages || {};
        etat.carte = etat.carte || [];
        etat.evenements = etat.evenements || [];
        etat.photos = etat.photos || [];
        reference = copie(etat);
        dessinerTout();
        messagePublication('Enregistré. Le site est à jour — rechargez-le pour voir le résultat.', 'ok');
      })
      .catch(function (err) {
        messagePublication(err.message, 'ko');
        majEtatModifs();
      });
  });

  /* ---- Mot de passe ---- */
  $('formMotDePasse').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('m-email').value.trim();
    var actuel = $('m-actuel').value;
    var nouveau = $('m-nouveau').value;

    var ok = erreurChamp('m-email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? '' : 'Adresse e-mail invalide.');
    ok = erreurChamp('m-actuel', actuel ? '' : 'Indiquez votre mot de passe actuel.') && ok;
    ok = erreurChamp('m-nouveau', nouveau.length < 10 ? 'Au moins 10 caractères.' : '') && ok;
    if (!ok) return;

    afficher('statutMotDePasse', 'Enregistrement…');
    appel('changer-mot-de-passe', { actuel: actuel, nouveau: nouveau, email: email })
      .then(function (r) {
        $('m-actuel').value = '';
        $('m-nouveau').value = '';
        var barre = document.querySelector('.admin-user');
        if (barre && r.email) barre.textContent = r.email;
        var rappel = document.querySelector('#panel-compte .callout');
        if (rappel) rappel.remove();
        afficher('statutMotDePasse', 'Identifiants enregistrés.', 'ok');
      })
      .catch(function (err) { afficher('statutMotDePasse', err.message, 'error'); });
  });

  /* ---- Déconnexion ---- */
  $('btnDeconnexion').addEventListener('click', function () {
    if (aDesModifications() && !confirm('Des modifications ne sont pas enregistrées. Se déconnecter quand même ?')) return;
    reference = copie(etat);          // évite l'alerte du navigateur au rechargement
    appel('deconnexion').then(function () { location.reload(); })
      .catch(function () { location.reload(); });
  });

  function dessinerTout() {
    dessinerReglages();
    dessinerCarte();
    dessinerAgenda();
    dessinerPhotos();
    majEtatModifs();
  }

  dessinerTout();

  // Onglet demandé par l'adresse (?onglet=carte depuis le site).
  var ongletDemande = $('tab-' + (CONFIG.onglet || 'reglages'));
  if (ongletDemande) choisirOnglet(ongletDemande, false);
})();
