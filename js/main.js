/* =========================================================
   Le P’tit Ravisé — script commun aux six pages.
   Vanilla JS, aucune dépendance.
   ========================================================= */
(function () {
  'use strict';

  /* =========================================================
     1. HORAIRES — source unique de vérité
     ---------------------------------------------------------
     Clés : 0 = dimanche, 1 = lundi … 6 = samedi.
     Valeurs en minutes depuis minuit ; `null` = fermé.
     Une fermeture supérieure à 24*60 signifie « ferme le
     lendemain matin » (ex. 26*60 = 2 h du matin).

     Cet objet pilote l'indicateur « ouvert / fermé » affiché
     sur toutes les pages ET le surlignage du jour courant
     dans le tableau des horaires. Pensez à mettre à jour en
     parallèle le tableau HTML de infos.html et le bloc
     Schema.org `openingHoursSpecification`.
     ========================================================= */
  var SCHEDULE = {
    0: null,                                 // dimanche : fermé
    1: { open: 7 * 60, close: 20 * 60 },     // lundi
    2: { open: 7 * 60, close: 20 * 60 },     // mardi
    3: { open: 7 * 60, close: 20 * 60 },     // mercredi
    4: { open: 7 * 60, close: 20 * 60 },     // jeudi
    5: { open: 7 * 60, close: 20 * 60 },     // vendredi
    6: { open: 8 * 60 + 30, close: 20 * 60 } // samedi : ouverture plus tardive
  };

  var DAY_NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  function formatMinutes(total) {
    var m = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
    var h = Math.floor(m / 60);
    var mins = m % 60;
    if (h === 0 && mins === 0) return 'minuit';
    return mins === 0 ? h + ' h' : h + ' h ' + String(mins).padStart(2, '0');
  }

  function nextOpening(fromDay) {
    for (var i = 1; i <= 7; i++) {
      var day = (fromDay + i) % 7;
      if (SCHEDULE[day]) return { day: day, open: SCHEDULE[day].open, inDays: i };
    }
    return null;
  }

  // Renvoie { open: bool, message: string } pour l'instant présent.
  function currentStatus(now) {
    var day = now.getDay();
    var minutes = now.getHours() * 60 + now.getMinutes();

    // Le service de la veille peut déborder après minuit.
    var yesterday = (day + 6) % 7;
    var yShift = SCHEDULE[yesterday];
    if (yShift && yShift.close > 24 * 60 && minutes < yShift.close - 24 * 60) {
      return { open: true, message: 'Ouvert — jusqu’à ' + formatMinutes(yShift.close) };
    }

    var today = SCHEDULE[day];
    if (today && minutes >= today.open && minutes < today.close) {
      return { open: true, message: 'Ouvert — jusqu’à ' + formatMinutes(today.close) };
    }
    if (today && minutes < today.open) {
      return { open: false, message: 'Fermé — ouvre aujourd’hui à ' + formatMinutes(today.open) };
    }

    var next = nextOpening(day);
    return {
      open: false,
      message: next
        ? 'Fermé — réouverture ' + (next.inDays === 1 ? 'demain' : DAY_NAMES[next.day]) +
          ' à ' + formatMinutes(next.open)
        : 'Fermé'
    };
  }

  function updateStatusWidgets() {
    var widgets = document.querySelectorAll('[data-status]');
    if (!widgets.length) return;
    var state = currentStatus(new Date());
    Array.prototype.forEach.call(widgets, function (widget) {
      var dot = widget.querySelector('.dot');
      var text = widget.querySelector('.status-text');
      if (dot) dot.className = 'dot ' + (state.open ? 'is-open' : 'is-closed');
      if (text) text.textContent = state.message;
    });
  }

  updateStatusWidgets();
  setInterval(updateStatusWidgets, 60 * 1000);

  // Surlignage du jour courant dans le tableau des horaires.
  var todayRow = document.querySelector('.hours tr[data-day="' + new Date().getDay() + '"]');
  if (todayRow) todayRow.classList.add('is-today');

  /* =========================================================
     2. Menu mobile
     ========================================================= */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Ouvrir le menu');
  }

  if (nav && navToggle) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeNav(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
  }

  /* =========================================================
     3. Ombre de l'en-tête au défilement
     ========================================================= */
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 12); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* =========================================================
     4. Apparition progressive
     ========================================================= */
  var revealables = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        setTimeout(function () { entry.target.classList.add('is-visible'); }, Math.min(i, 4) * 70);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    revealables.forEach(function (el) { observer.observe(el); });
  }

  /* =========================================================
     5. Calendrier des événements
     ---------------------------------------------------------
     Les données vivent dans js/donnees.js. Les dates passées
     sont masquées automatiquement ; s'il ne reste rien à
     annoncer, un état vide s'affiche.
     ========================================================= */
  var DONNEES = window.DONNEES || {};
  var eventsHost = document.getElementById('events');

  if (eventsHost) {
    var data = Array.isArray(DONNEES.evenements) ? DONNEES.evenements : [];
    var startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    var upcoming = data
      .filter(function (ev) {
        var d = new Date(ev.date + 'T00:00:00');
        return !isNaN(d) && d >= startOfToday;
      })
      .sort(function (a, b) { return a.date < b.date ? -1 : 1; });

    if (!upcoming.length) {
      eventsHost.innerHTML =
        '<div class="empty-state">' +
        '<svg class="ico" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/></svg>' +
        '<h3>Aucune date annoncée pour le moment</h3>' +
        '<p>Les prochaines soirées et retransmissions seront publiées ici. ' +
        'En attendant, la page Facebook du bar reste la source la plus à jour.</p>' +
        '</div>';
    } else {
      var MOIS = ['janv.', 'févr.', 'mars', 'avril', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
      var list = document.createElement('ul');
      list.className = 'events';

      upcoming.forEach(function (ev) {
        var d = new Date(ev.date + 'T00:00:00');
        var item = document.createElement('li');
        item.className = 'event';

        var meta = [DAY_NAMES[d.getDay()]];
        if (ev.heure) meta.push(ev.heure);
        if (ev.prix) meta.push(ev.prix);

        // textContent partout : aucune donnée n'est injectée en HTML.
        var dateBox = document.createElement('div');
        dateBox.className = 'event-date';
        var day = document.createElement('span');
        day.className = 'day';
        day.textContent = String(d.getDate()).padStart(2, '0');
        var month = document.createElement('span');
        month.className = 'month';
        month.textContent = MOIS[d.getMonth()];
        dateBox.appendChild(day);
        dateBox.appendChild(month);

        var body = document.createElement('div');
        body.className = 'event-body';
        var title = document.createElement('h3');
        title.textContent = ev.titre || 'Événement';
        body.appendChild(title);
        if (ev.description) {
          var desc = document.createElement('p');
          desc.textContent = ev.description;
          body.appendChild(desc);
        }
        var metaLine = document.createElement('p');
        metaLine.className = 'event-meta';
        metaLine.textContent = meta.join(' · ');
        body.appendChild(metaLine);

        item.appendChild(dateBox);
        item.appendChild(body);
        list.appendChild(item);
      });

      eventsHost.innerHTML = '';
      eventsHost.appendChild(list);
    }
  }

  /* =========================================================
     5 bis. La carte
     ---------------------------------------------------------
     Rendue à partir de js/donnees.js : rubriques, intitulés,
     prix et descriptions. Le prix est omis quand il est vide,
     ce qui évite une colonne de tirets.
     ========================================================= */
  var carteHost = document.getElementById('carte');

  if (carteHost && Array.isArray(DONNEES.carte)) {
    var navCarte = document.getElementById('carte-nav');
    if (navCarte) navCarte.innerHTML = '';

    DONNEES.carte.forEach(function (rubrique) {
      if (!rubrique.items || !rubrique.items.length) return;

      if (navCarte) {
        var lien = document.createElement('a');
        lien.href = '#' + rubrique.id;
        lien.textContent = (rubrique.emoji ? rubrique.emoji + ' ' : '') + rubrique.titre;
        navCarte.appendChild(lien);
      }

      var bloc = document.createElement('section');
      bloc.className = 'menu-block';
      bloc.id = rubrique.id;

      var titre = document.createElement('h2');
      if (rubrique.emoji) {
        var emoji = document.createElement('span');
        emoji.className = 'emoji';
        emoji.setAttribute('aria-hidden', 'true');
        emoji.textContent = rubrique.emoji;
        titre.appendChild(emoji);
        titre.appendChild(document.createTextNode(' '));
      }
      titre.appendChild(document.createTextNode(rubrique.titre));
      bloc.appendChild(titre);

      var liste = document.createElement('ul');
      liste.className = 'menu';

      rubrique.items.forEach(function (item) {
        if (!item.nom) return;
        var li = document.createElement('li');

        var ligne = document.createElement('p');
        ligne.className = 'menu-line';
        var nom = document.createElement('span');
        nom.className = 'name';
        nom.textContent = item.nom;                 // textContent : jamais d'HTML injecté
        ligne.appendChild(nom);

        if (item.prix) {
          var points = document.createElement('span');
          points.className = 'dots';
          var prix = document.createElement('span');
          prix.className = 'price';
          prix.textContent = item.prix;
          ligne.appendChild(points);
          ligne.appendChild(prix);
        }
        li.appendChild(ligne);

        if (item.description) {
          var desc = document.createElement('p');
          desc.textContent = item.description;
          li.appendChild(desc);
        }
        liste.appendChild(li);
      });

      bloc.appendChild(liste);
      carteHost.appendChild(bloc);
    });

    // La mention « tarifs au comptoir » n'a de sens que si aucun prix n'est saisi.
    var mention = document.getElementById('carte-mention');
    if (mention) {
      var auMoinsUnPrix = DONNEES.carte.some(function (r) {
        return (r.items || []).some(function (i) { return i.prix; });
      });
      if (auMoinsUnPrix) mention.remove();
      else mention.textContent = (DONNEES.reglages && DONNEES.reglages.mentionTarifs) || '';
    }
  }

  /* =========================================================
     5 ter. Emplacements photo
     ---------------------------------------------------------
     Deux formes : la galerie de la page « Le bar », et les
     illustrations isolées marquées data-emplacement. Dans les
     deux cas, un emplacement vide montre son dessin au trait
     et un bouton de dépôt ; le bouton disparaît dès qu'une
     photo est en place.
     ========================================================= */
  var PHOTOS = Array.isArray(DONNEES.photos) ? DONNEES.photos : [];

  function photoParId(id) {
    for (var i = 0; i < PHOTOS.length; i++) {
      if (PHOTOS[i].id === id) return PHOTOS[i];
    }
    return null;
  }

  // Remplit une vignette : la photo si elle existe, sinon l'illustration
  // et son bouton. Le <template> reste en place pour un éventuel retrait.
  function remplirEmplacement(figure, photo) {
    Array.prototype.slice.call(figure.children).forEach(function (enfant) {
      if (enfant.tagName !== 'TEMPLATE') enfant.remove();
    });

    if (photo.fichier) {
      var image = document.createElement('img');
      image.src = 'img/photos/' + photo.fichier;
      image.alt = photo.legende || 'Photo du bar';
      image.loading = 'lazy';
      figure.appendChild(image);
      figure.classList.add('illu-photo');
      figure.removeAttribute('role');
      figure.removeAttribute('aria-label');
      return;
    }

    figure.classList.remove('illu-photo');
    var modele = figure.querySelector('template[data-illustration]')
      || document.querySelector('template[data-illustration="' + photo.id + '"]');
    if (modele) figure.appendChild(modele.content.cloneNode(true));
    figure.setAttribute('role', 'img');
    if (!figure.getAttribute('aria-label')) {
      figure.setAttribute('aria-label', 'Illustration — ' + (photo.legende || ''));
    }

    var bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'btn-photo';
    bouton.textContent = 'Ajouter une photo';
    bouton.addEventListener('click', function () { ouvrirDepot(photo); });
    figure.appendChild(bouton);
  }

  // Illustrations isolées (accueil, page « Le bar »).
  var dejaPlaces = {};
  Array.prototype.forEach.call(document.querySelectorAll('[data-emplacement]'), function (figure) {
    var id = figure.getAttribute('data-emplacement');
    var photo = photoParId(id);
    if (!photo) return;
    dejaPlaces[id] = true;
    remplirEmplacement(figure, photo);
  });

  // Galerie : les vignettes sont créées à partir des données.
  var galerie = document.getElementById('galerie');

  if (galerie) {
    PHOTOS.forEach(function (photo) {
      // La galerie n'accueille que les emplacements qui ont un dessin à ce
      // niveau : ni ceux déjà rendus ailleurs dans la page, ni ceux dont le
      // dessin n'existe que sur une autre page.
      if (dejaPlaces[photo.id]) return;
      var modeleGalerie = galerie.parentNode.querySelector(
        ':scope > template[data-illustration="' + photo.id + '"]');
      if (!modeleGalerie) return;

      var figure = document.createElement('figure');
      figure.className = 'illu';
      remplirEmplacement(figure, photo);

      var legende = document.createElement('figcaption');
      legende.textContent = photo.legende || '';
      figure.appendChild(legende);

      galerie.appendChild(figure);
    });
  }

  // Fenêtre de dépôt : mot de passe de l'administration puis fichier.
  function ouvrirDepot(photo) {
    var fond = document.createElement('div');
    fond.className = 'depot-fond';
    fond.innerHTML =
      '<div class="depot" role="dialog" aria-modal="true" aria-labelledby="depot-titre">' +
        '<h2 id="depot-titre">Ajouter une photo</h2>' +
        '<p class="note">Emplacement : <strong class="depot-emplacement"></strong>. ' +
          'Réservé au bar : le mot de passe de l’administration est demandé.</p>' +
        '<form>' +
          '<div class="field">' +
            '<label for="depot-mdp">Mot de passe</label>' +
            '<input type="password" id="depot-mdp" autocomplete="current-password">' +
          '</div>' +
          '<div class="field">' +
            '<label for="depot-fichier">Photo</label>' +
            '<input type="file" id="depot-fichier" accept="image/jpeg,image/png,image/webp">' +
            '<p class="note">JPEG, PNG ou WebP, 8 Mo maximum. La photo est recadrée en carré.</p>' +
          '</div>' +
          '<div class="depot-actions">' +
            '<button type="button" class="btn btn-outline depot-annuler">Annuler</button>' +
            '<button type="submit" class="btn">Envoyer</button>' +
          '</div>' +
          '<p class="form-status depot-statut" role="status" aria-live="polite"></p>' +
        '</form>' +
      '</div>';

    fond.querySelector('.depot-emplacement').textContent = photo.legende || photo.id;
    document.body.appendChild(fond);

    var statut = fond.querySelector('.depot-statut');
    var champMdp = fond.querySelector('#depot-mdp');
    var champFichier = fond.querySelector('#depot-fichier');
    champMdp.focus();

    function fermer() { fond.remove(); document.removeEventListener('keydown', surEchap); }
    function surEchap(e) { if (e.key === 'Escape') fermer(); }
    document.addEventListener('keydown', surEchap);
    fond.querySelector('.depot-annuler').addEventListener('click', fermer);
    fond.addEventListener('click', function (e) { if (e.target === fond) fermer(); });

    fond.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (!champMdp.value) { statut.textContent = 'Indiquez le mot de passe.'; statut.className = 'form-status depot-statut is-error'; return; }
      if (!champFichier.files.length) { statut.textContent = 'Choisissez une photo.'; statut.className = 'form-status depot-statut is-error'; return; }

      var donnees = new FormData();
      donnees.append('emplacement', photo.id);
      donnees.append('motDePasse', champMdp.value);
      donnees.append('photo', champFichier.files[0]);

      statut.textContent = 'Envoi en cours…';
      statut.className = 'form-status depot-statut';

      fetch('admin/photo.php', { method: 'POST', body: donnees, credentials: 'same-origin' })
        .then(function (reponse) {
          return reponse.json().catch(function () { return {}; }).then(function (r) {
            if (!reponse.ok) throw new Error(r.erreur || 'Erreur ' + reponse.status + '.');
            return r;
          });
        })
        .then(function () {
          statut.textContent = 'Photo enregistrée.';
          statut.className = 'form-status depot-statut is-ok';
          setTimeout(function () { location.reload(); }, 700);
        })
        .catch(function (err) {
          // Sans PHP (ouverture locale, GitHub Pages), la requête n'aboutit pas.
          var message = err instanceof TypeError
            ? 'Envoi impossible : cette page doit être servie par un hébergement PHP.'
            : err.message;
          statut.textContent = message;
          statut.className = 'form-status depot-statut is-error';
        });
    });
  }

  /* =========================================================
     5 bis bis. Commandes réservées à l'administrateur
     ---------------------------------------------------------
     Les pages publiques étant statiques, elles demandent au
     serveur si une session est ouverte, et ne dévoilent les
     éléments marqués data-si-connecte que dans ce cas. Sans
     PHP, ou hors session, ils restent masqués.
     ========================================================= */
  var reserves = document.querySelectorAll('[data-si-connecte]');

  if (reserves.length) {
    fetch('admin/session.php', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (etat) {
        if (!etat || !etat.connecte) return;
        Array.prototype.forEach.call(reserves, function (el) { el.hidden = false; });
      })
      .catch(function () { /* pas de PHP : rien à dévoiler */ });
  }

  /* =========================================================
     5 quater. Entrée « Compte » du menu
     ---------------------------------------------------------
     Ouvre une fenêtre de changement de mot de passe. Le lien
     pointe vers /admin/ : sans JavaScript, ou si le clic est
     fait avec Ctrl, on atterrit sur la console, ce qui reste
     une réponse utile.
     ========================================================= */
  var lienCompte = document.getElementById('lienCompte');

  if (lienCompte) {
    lienCompte.addEventListener('click', function (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      closeNav();
      ouvrirCompte();
    });
  }

  function ouvrirCompte() {
    var fond = document.createElement('div');
    fond.className = 'depot-fond';
    fond.innerHTML =
      '<div class="depot" role="dialog" aria-modal="true" aria-labelledby="compte-titre">' +
        '<h2 id="compte-titre">Changer le mot de passe</h2>' +
        '<p class="note">Réservé au bar. Le mot de passe actuel est demandé ; ' +
          'c’est lui qui autorise le changement.</p>' +
        '<form>' +
          '<div class="field">' +
            '<label for="compte-actuel">Mot de passe actuel</label>' +
            '<input type="password" id="compte-actuel" autocomplete="current-password">' +
          '</div>' +
          '<div class="field">' +
            '<label for="compte-nouveau">Nouveau mot de passe</label>' +
            '<input type="password" id="compte-nouveau" autocomplete="new-password">' +
            '<p class="note">Au moins 10 caractères.</p>' +
          '</div>' +
          '<div class="field">' +
            '<label for="compte-nouveau2">Confirmer le nouveau mot de passe</label>' +
            '<input type="password" id="compte-nouveau2" autocomplete="new-password">' +
          '</div>' +
          '<div class="depot-actions">' +
            '<button type="button" class="btn btn-outline depot-annuler">Annuler</button>' +
            '<button type="submit" class="btn">Enregistrer</button>' +
          '</div>' +
          '<p class="form-status depot-statut" role="status" aria-live="polite"></p>' +
          '<p class="note" style="margin:1rem 0 0">Pour modifier la carte, les événements ' +
            'ou les réglages : <a href="admin/">console d’administration</a>.</p>' +
        '</form>' +
      '</div>';

    document.body.appendChild(fond);

    var statut = fond.querySelector('.depot-statut');
    var actuel = fond.querySelector('#compte-actuel');
    var nouveau = fond.querySelector('#compte-nouveau');
    var nouveau2 = fond.querySelector('#compte-nouveau2');
    actuel.focus();

    function fermer() { fond.remove(); document.removeEventListener('keydown', surEchap); }
    function surEchap(ev) { if (ev.key === 'Escape') fermer(); }
    document.addEventListener('keydown', surEchap);
    fond.querySelector('.depot-annuler').addEventListener('click', fermer);
    fond.addEventListener('click', function (ev) { if (ev.target === fond) fermer(); });

    function erreur(message) {
      statut.textContent = message;
      statut.className = 'form-status depot-statut is-error';
    }

    fond.querySelector('form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!actuel.value) return erreur('Indiquez le mot de passe actuel.');
      if (nouveau.value.length < 10) return erreur('Le nouveau mot de passe doit faire au moins 10 caractères.');
      if (nouveau.value !== nouveau2.value) return erreur('Les deux nouveaux mots de passe diffèrent.');

      statut.textContent = 'Enregistrement…';
      statut.className = 'form-status depot-statut';

      fetch('admin/motdepasse.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ actuel: actuel.value, nouveau: nouveau.value })
      })
        .then(function (reponse) {
          return reponse.json().catch(function () { return {}; }).then(function (r) {
            if (!reponse.ok) throw new Error(r.erreur || 'Erreur ' + reponse.status + '.');
            return r;
          });
        })
        .then(function () {
          statut.textContent = 'Mot de passe modifié.';
          statut.className = 'form-status depot-statut is-ok';
          actuel.value = nouveau.value = nouveau2.value = '';
        })
        .catch(function (err) {
          erreur(err instanceof TypeError
            ? 'Impossible : cette page doit être servie par un hébergement PHP.'
            : err.message);
        });
    });
  }

  /* =========================================================
     6. Formulaire de contact
     ---------------------------------------------------------
     L'adresse e-mail se renseigne dans js/donnees.js (ou via
     la console d'administration). Dès qu'elle existe, le
     formulaire ouvre le logiciel de messagerie du visiteur
     avec un message déjà rempli. Sinon, il renvoie poliment
     vers le téléphone.
     ========================================================= */
  var REGLAGES = DONNEES.reglages || {};
  var EMAIL_CONTACT = REGLAGES.email || '';
  var TEL_AFFICHE = REGLAGES.telephone || '02 35 71 66 79';

  var form = document.getElementById('contactForm');

  if (form) {
    var setError = function (name, message) {
      var field = form.querySelector('#' + name);
      var slot = form.querySelector('[data-error-for="' + name + '"]');
      if (slot) slot.textContent = message || '';
      if (field) {
        if (message) field.setAttribute('aria-invalid', 'true');
        else field.removeAttribute('aria-invalid');
      }
      return !message;
    };

    var validate = function () {
      var ok = true;
      var nom = form.querySelector('#nom').value.trim();
      var email = form.querySelector('#email').value.trim();
      var message = form.querySelector('#message').value.trim();

      ok = setError('nom', nom.length < 2 ? 'Merci d’indiquer votre nom.' : '') && ok;
      ok = setError('email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? '' : 'Adresse e-mail invalide.') && ok;
      ok = setError('message', message.length < 10 ? 'Votre message est un peu court.' : '') && ok;
      return ok;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('formStatus');

      if (!validate()) {
        status.textContent = 'Le formulaire contient des erreurs. Merci de les corriger.';
        status.className = 'form-status is-error';
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var nom = form.querySelector('#nom').value.trim();

      if (!EMAIL_CONTACT) {
        status.textContent = 'Merci ' + nom + ' ! Le plus rapide pour nous joindre reste le ' +
          'téléphone : ' + TEL_AFFICHE + ', du lundi au samedi aux heures d’ouverture.';
        status.className = 'form-status is-ok';
        return;
      }

      // Ouvre le logiciel de messagerie avec un message pré-rempli.
      var champ = function (id) {
        var el = form.querySelector('#' + id);
        return el ? el.value.trim() : '';
      };
      var corps = [
        champ('message'),
        '',
        '— ' + nom,
        champ('email'),
        champ('telephone')
      ].filter(Boolean).join('\n');

      window.location.href = 'mailto:' + EMAIL_CONTACT +
        '?subject=' + encodeURIComponent('[Site] ' + champ('sujet')) +
        '&body=' + encodeURIComponent(corps);

      status.textContent = 'Merci ' + nom + ' ! Votre logiciel de messagerie s’ouvre avec le ' +
        'message pré-rempli — il ne reste qu’à l’envoyer.';
      status.className = 'form-status is-ok';
      form.reset();
    });

    ['nom', 'email', 'message'].forEach(function (name) {
      var field = form.querySelector('#' + name);
      if (!field) return;
      field.addEventListener('blur', function () {
        if (field.getAttribute('aria-invalid') || field.value) validate();
      });
      // Une fois un champ signalé, on efface le message dès qu'il est corrigé.
      field.addEventListener('input', function () {
        if (field.getAttribute('aria-invalid')) validate();
      });
    });
  }

  /* =========================================================
     7. Année courante dans le pied de page
     ========================================================= */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
