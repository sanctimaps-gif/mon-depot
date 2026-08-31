/* =========================================================
   Le Petit Ravisé — script commun aux six pages.
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
    6: { open: 7 * 60, close: 20 * 60 }      // samedi
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
     Les données vivent dans js/evenements.js. Les dates
     passées sont masquées automatiquement ; s'il ne reste
     rien à annoncer, un état vide s'affiche.
     ========================================================= */
  var eventsHost = document.getElementById('events');

  if (eventsHost) {
    var data = Array.isArray(window.EVENEMENTS) ? window.EVENEMENTS : [];
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
     6. Formulaire de contact
     ---------------------------------------------------------
     Renseignez l'adresse e-mail du bar ci-dessous : le
     formulaire ouvrira alors le logiciel de messagerie du
     visiteur avec un message déjà rempli (objet, coordonnées,
     texte). Aucun serveur ni service tiers n'est nécessaire.

     Tant que la constante est vide, le formulaire renvoie
     poliment vers le téléphone.
     ========================================================= */
  var EMAIL_CONTACT = '';          // ex. 'contact@barlepetitravise.fr'
  var TEL_AFFICHE = '02 35 71 66 79';

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
