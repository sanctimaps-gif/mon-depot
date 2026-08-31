/* =========================================================
   Le P’tit Ravisé — script commun aux six pages.
   Vanilla JS, aucune dépendance.
   ========================================================= */
(function () {
  'use strict';

  /* =========================================================
     0. LANGUE
     ---------------------------------------------------------
     Le même script sert les pages françaises (racine) et les
     pages anglaises (/en/). Deux choses en dépendent :

       - les textes produits par le script (statut d'ouverture,
         agenda, boutons, messages du formulaire) ;
       - les chemins vers les ressources communes, puisque les
         pages anglaises sont un dossier plus bas.

     Les deux se lisent sur la balise <html> : `lang` et
     `data-racine`. Une page qui n'annonce rien reste française
     et à la racine.
     ========================================================= */
  var LANGUE = (document.documentElement.lang || 'fr').slice(0, 2).toLowerCase();
  var RACINE = document.documentElement.getAttribute('data-racine') || '';

  var TEXTES = {
    fr: {
      jours: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
      mois: ['janv.', 'févr.', 'mars', 'avril', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
      minuit: 'minuit',
      ouvertJusqu: 'Ouvert — jusqu’à ',
      ouvreAujourdhui: 'Fermé — ouvre aujourd’hui à ',
      reouverture: 'Fermé — réouverture ',
      demain: 'demain',
      a: ' à ',
      ferme: 'Fermé',
      ouvrirMenu: 'Ouvrir le menu',
      fermerMenu: 'Fermer le menu',
      agendaVideTitre: 'Aucune date annoncée pour le moment',
      agendaVideTexte: 'Les prochaines soirées et retransmissions seront publiées ici. ' +
        'En attendant, la page Facebook du bar reste la source la plus à jour.',
      evenement: 'Événement',
      ajouterPhoto: 'Ajouter une photo',
      illustration: 'Illustration — ',
      altPhoto: ' — Le P’tit Ravisé, bar-tabac au 14 rue des Bons-Enfants à Rouen',
      altPhotoSeule: 'Le P’tit Ravisé, bar-tabac au 14 rue des Bons-Enfants à Rouen',
      depotEmplacement: 'Emplacement : ',
      depotReserve: 'Réservé au bar : le mot de passe de l’administration est demandé.',
      motDePasse: 'Mot de passe',
      photo: 'Photo',
      depotFormats: 'JPEG, PNG ou WebP, 8 Mo maximum. La photo est recadrée en carré.',
      annuler: 'Annuler',
      envoyer: 'Envoyer',
      indiquezMdp: 'Indiquez le mot de passe.',
      choisissezPhoto: 'Choisissez une photo.',
      envoiEnCours: 'Envoi en cours…',
      photoEnregistree: 'Photo enregistrée.',
      sansPhp: 'Envoi impossible : cette page doit être servie par un hébergement PHP.',
      erreur: 'Erreur ',
      formErreurs: 'Le formulaire contient des erreurs. Merci de les corriger.',
      formNom: 'Merci d’indiquer votre nom.',
      formEmail: 'Adresse e-mail invalide.',
      formMessage: 'Votre message est un peu court.',
      formEnvoye: 'Message envoyé, merci !',
      formEchec: 'L’envoi a échoué. Merci de nous appeler au ',
      formTelephone: function (nom, tel) {
        return 'Merci ' + nom + ' ! Le plus rapide pour nous joindre reste le téléphone : ' +
          tel + ', du lundi au samedi aux heures d’ouverture.';
      },
      formMailto: function (nom) {
        return 'Merci ' + nom + ' ! Votre logiciel de messagerie s’ouvre avec le message ' +
          'pré-rempli — il ne reste qu’à l’envoyer.';
      },
      sujetMail: '[Site] '
    },
    en: {
      jours: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      mois: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      minuit: 'midnight',
      ouvertJusqu: 'Open — until ',
      ouvreAujourdhui: 'Closed — opens today at ',
      reouverture: 'Closed — reopens ',
      demain: 'tomorrow',
      a: ' at ',
      ferme: 'Closed',
      ouvrirMenu: 'Open menu',
      fermerMenu: 'Close menu',
      agendaVideTitre: 'No dates announced yet',
      agendaVideTexte: 'Upcoming nights and screenings will be posted here. ' +
        'In the meantime, the bar’s Facebook page is the most up-to-date source.',
      evenement: 'Event',
      ajouterPhoto: 'Add a photo',
      illustration: 'Illustration — ',
      altPhoto: ' — Le P’tit Ravisé, bar and tobacconist at 14 rue des Bons-Enfants, Rouen',
      altPhotoSeule: 'Le P’tit Ravisé, bar and tobacconist at 14 rue des Bons-Enfants, Rouen',
      depotEmplacement: 'Slot: ',
      depotReserve: 'Staff only: the administration password is required.',
      motDePasse: 'Password',
      photo: 'Photo',
      depotFormats: 'JPEG, PNG or WebP, 8 MB maximum. The photo is cropped to a square.',
      annuler: 'Cancel',
      envoyer: 'Send',
      indiquezMdp: 'Please enter the password.',
      choisissezPhoto: 'Please choose a photo.',
      envoiEnCours: 'Sending…',
      photoEnregistree: 'Photo saved.',
      sansPhp: 'Upload failed: this page must be served by PHP hosting.',
      erreur: 'Error ',
      formErreurs: 'The form contains errors. Please correct them.',
      formNom: 'Please give your name.',
      formEmail: 'Invalid e-mail address.',
      formMessage: 'Your message is a little short.',
      formEnvoye: 'Message sent, thank you!',
      formEchec: 'Sending failed. Please call us on ',
      formTelephone: function (nom, tel) {
        return 'Thank you ' + nom + '! The quickest way to reach us is the phone: ' +
          tel + ', Monday to Saturday during opening hours.';
      },
      formMailto: function (nom) {
        return 'Thank you ' + nom + '! Your e-mail app is opening with the message ' +
          'ready — all that is left is to send it.';
      },
      sujetMail: '[Website] '
    }
  };

  var T = TEXTES[LANGUE] || TEXTES.fr;

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


  function formatMinutes(total) {
    var m = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
    var h = Math.floor(m / 60);
    var mins = m % 60;
    if (h === 0 && mins === 0) return T.minuit;
    if (LANGUE === 'en') {
      // Format anglais : 7 am, 8:30 am, 8 pm.
      var suffixe = h < 12 ? ' am' : ' pm';
      var h12 = h % 12 === 0 ? 12 : h % 12;
      return (mins === 0 ? String(h12) : h12 + ':' + String(mins).padStart(2, '0')) + suffixe;
    }
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
      return { open: true, message: T.ouvertJusqu + formatMinutes(yShift.close) };
    }

    var today = SCHEDULE[day];
    if (today && minutes >= today.open && minutes < today.close) {
      return { open: true, message: T.ouvertJusqu + formatMinutes(today.close) };
    }
    if (today && minutes < today.open) {
      return { open: false, message: T.ouvreAujourdhui + formatMinutes(today.open) };
    }

    var next = nextOpening(day);
    return {
      open: false,
      message: next
        ? T.reouverture + (next.inDays === 1 ? T.demain : T.jours[next.day]) +
          T.a + formatMinutes(next.open)
        : T.ferme
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
    navToggle.setAttribute('aria-label', T.ouvrirMenu);
  }

  if (nav && navToggle) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? T.fermerMenu : T.ouvrirMenu);
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
        '<h3></h3><p></p>' +
        '</div>';
      eventsHost.querySelector('h3').textContent = T.agendaVideTitre;
      eventsHost.querySelector('p').textContent = T.agendaVideTexte;
    } else {
      var list = document.createElement('ul');
      list.className = 'events';

      upcoming.forEach(function (ev) {
        var d = new Date(ev.date + 'T00:00:00');
        var item = document.createElement('li');
        item.className = 'event';

        var meta = [T.jours[d.getDay()]];
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
        month.textContent = T.mois[d.getMonth()];
        dateBox.appendChild(day);
        dateBox.appendChild(month);

        var body = document.createElement('div');
        body.className = 'event-body';
        var title = document.createElement('h3');
        title.textContent = ev.titre || T.evenement;
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
      image.src = RACINE + 'img/photos/' + photo.fichier;
      // L'alternative textuelle nomme l'établissement et la ville : elle sert
      // aux lecteurs d'écran comme à la recherche d'images locale.
      image.alt = photo.legende ? photo.legende + T.altPhoto : T.altPhotoSeule;
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
      figure.setAttribute('aria-label', T.illustration + (photo.legende || ''));
    }

    var bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'btn-photo';
    bouton.textContent = T.ajouterPhoto;
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
        '<h2 id="depot-titre" class="depot-titre"></h2>' +
        '<p class="note"><span class="depot-intro"></span><strong class="depot-emplacement"></strong>. ' +
          '<span class="depot-reserve"></span></p>' +
        '<form>' +
          '<div class="field">' +
            '<label for="depot-mdp" class="depot-l-mdp"></label>' +
            '<input type="password" id="depot-mdp" autocomplete="current-password">' +
          '</div>' +
          '<div class="field">' +
            '<label for="depot-fichier" class="depot-l-photo"></label>' +
            '<input type="file" id="depot-fichier" accept="image/jpeg,image/png,image/webp">' +
            '<p class="note depot-formats"></p>' +
          '</div>' +
          '<div class="depot-actions">' +
            '<button type="button" class="btn btn-outline depot-annuler"></button>' +
            '<button type="submit" class="btn depot-envoyer"></button>' +
          '</div>' +
          '<p class="form-status depot-statut" role="status" aria-live="polite"></p>' +
        '</form>' +
      '</div>';

    var libelles = {
      '.depot-titre': T.ajouterPhoto,
      '.depot-intro': T.depotEmplacement,
      '.depot-reserve': T.depotReserve,
      '.depot-l-mdp': T.motDePasse,
      '.depot-l-photo': T.photo,
      '.depot-formats': T.depotFormats,
      '.depot-annuler': T.annuler,
      '.depot-envoyer': T.envoyer
    };
    Object.keys(libelles).forEach(function (sel) {
      fond.querySelector(sel).textContent = libelles[sel];
    });
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
      if (!champMdp.value) { statut.textContent = T.indiquezMdp; statut.className = 'form-status depot-statut is-error'; return; }
      if (!champFichier.files.length) { statut.textContent = T.choisissezPhoto; statut.className = 'form-status depot-statut is-error'; return; }

      var donnees = new FormData();
      donnees.append('emplacement', photo.id);
      donnees.append('motDePasse', champMdp.value);
      donnees.append('photo', champFichier.files[0]);

      statut.textContent = T.envoiEnCours;
      statut.className = 'form-status depot-statut';

      fetch(RACINE + 'admin/photo.php', { method: 'POST', body: donnees, credentials: 'same-origin' })
        .then(function (reponse) {
          return reponse.json().catch(function () { return {}; }).then(function (r) {
            if (!reponse.ok) throw new Error(r.erreur || T.erreur + reponse.status + '.');
            return r;
          });
        })
        .then(function () {
          statut.textContent = T.photoEnregistree;
          statut.className = 'form-status depot-statut is-ok';
          setTimeout(function () { location.reload(); }, 700);
        })
        .catch(function (err) {
          // Sans PHP (ouverture locale, GitHub Pages), la requête n'aboutit pas.
          var message = err instanceof TypeError
            ? T.sansPhp
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
    fetch(RACINE + 'admin/session.php', { credentials: 'same-origin' })
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

      statut.textContent = T.envoiEnCours;
      statut.className = 'form-status depot-statut';

      fetch('admin/motdepasse.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ actuel: actuel.value, nouveau: nouveau.value })
      })
        .then(function (reponse) {
          return reponse.json().catch(function () { return {}; }).then(function (r) {
            if (!reponse.ok) throw new Error(r.erreur || T.erreur + reponse.status + '.');
            return r;
          });
        })
        .then(function () {
          statut.textContent = LANGUE === 'en' ? 'Password changed.' : 'Mot de passe modifié.';
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
     Sur un hébergement PHP, le message part vraiment : il est
     envoyé à contact.php, qui l'expédie au bar. L'adresse du
     bar n'apparaît jamais dans ces pages — elle est lue côté
     serveur, hors de portée des robots à spam.

     Si le site est servi en statique (pas de PHP), contact.php
     n'existe pas : on retombe alors sur le logiciel de
     messagerie du visiteur, puis sur le téléphone.
     ========================================================= */
  var REGLAGES = DONNEES.reglages || {};
  var FORMULAIRE_ACTIF = REGLAGES.formulaire !== false;
  var EMAIL_CONTACT = REGLAGES.email || '';   // hébergements statiques uniquement
  var TEL_AFFICHE = REGLAGES.telephone || '02 35 71 66 79';

  var form = document.getElementById('contactForm');

  if (form) {
    // Temps passé sur le formulaire : un envoi expédié en moins de trois
    // secondes vient d'un automate, pas d'une personne qui écrit. On mesure
    // une durée, non une heure : une horloge de téléphone mal réglée ne doit
    // pas faire passer un visiteur pour un robot.
    var ouvertureFormulaire = Date.now();

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

      ok = setError('nom', nom.length < 2 ? T.formNom : '') && ok;
      ok = setError('email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? '' : T.formEmail) && ok;
      ok = setError('message', message.length < 10 ? T.formMessage : '') && ok;
      return ok;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('formStatus');

      if (!validate()) {
        status.textContent = T.formErreurs;
        status.className = 'form-status is-error';
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var champ = function (id) {
        var el = form.querySelector('#' + id);
        return el ? el.value.trim() : '';
      };
      var nom = champ('nom');
      var bouton = form.querySelector('button[type="submit"]');

      // Repli sans serveur : le logiciel de messagerie du visiteur, ou le
      // téléphone si aucune adresse n'est disponible côté client.
      var repli = function (raison) {
        if (!EMAIL_CONTACT) {
          status.textContent = raison || T.formTelephone(nom, TEL_AFFICHE);
          status.className = 'form-status is-ok';
          return;
        }
        var corps = [champ('message'), '', '— ' + nom, champ('email'), champ('telephone')]
          .filter(Boolean).join('\n');
        window.location.href = 'mailto:' + EMAIL_CONTACT +
          '?subject=' + encodeURIComponent(T.sujetMail + champ('sujet')) +
          '&body=' + encodeURIComponent(corps);
        status.textContent = T.formMailto(nom);
        status.className = 'form-status is-ok';
        form.reset();
      };

      if (!FORMULAIRE_ACTIF) { repli(); return; }

      status.textContent = 'Envoi en cours…';
      status.className = 'form-status';
      if (bouton) bouton.disabled = true;

      fetch(RACINE + 'contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: nom,
          email: champ('email'),
          telephone: champ('telephone'),
          sujet: champ('sujet'),
          message: champ('message'),
          societe: champ('societe'),     // piège à robots, toujours vide
          duree: Date.now() - ouvertureFormulaire,
          langue: LANGUE                 // pour que la réponse soit dans la bonne langue
        })
      })
        .then(function (r) {
          // Une page 404 renvoie du HTML : c'est le signe qu'il n'y a pas de PHP.
          return r.text().then(function (t) {
            var data;
            try { data = JSON.parse(t); } catch (e) { throw new Error('sans-php'); }
            return { code: r.status, data: data };
          });
        })
        .then(function (r) {
          if (bouton) bouton.disabled = false;

          if (r.data.erreurs) {
            Object.keys(r.data.erreurs).forEach(function (k) { setError(k, r.data.erreurs[k]); });
            status.textContent = T.formErreurs;
            status.className = 'form-status is-error';
            return;
          }
          if (!r.data.ok) {
            status.textContent = r.data.erreur || (T.formEchec + TEL_AFFICHE + '.');
            status.className = 'form-status is-error';
            return;
          }

          status.textContent = r.data.message || T.formEnvoye;
          status.className = 'form-status is-ok';
          form.reset();
          ouvertureFormulaire = Date.now();
        })
        .catch(function () {
          if (bouton) bouton.disabled = false;
          repli();
        });
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
