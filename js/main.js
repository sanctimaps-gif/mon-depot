/* =========================================================
   Le Comptoir Doré — interactions du site
   Vanilla JS, aucune dépendance.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Menu mobile ---------- */
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

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ---------- En-tête au défilement ---------- */
  var header = document.getElementById('header');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Lien de navigation actif ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ---------- Apparition progressive ---------- */
  var revealables = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var delay = Math.min(i, 4) * 80;
        setTimeout(function () { entry.target.classList.add('is-visible'); }, delay);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Onglets de la carte ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));

  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });
    if (focus) tab.focus();
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { selectTab(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  /* ---------- Horaires : ouvert / fermé ---------- */
  // Clés : 0 = dimanche … 6 = samedi. Une fermeture inférieure à l'ouverture
  // signifie que le bar ferme le lendemain matin.
  var SCHEDULE = {
    0: { open: 18 * 60, close: 24 * 60 },
    1: null,
    2: { open: 17 * 60, close: 25 * 60 },
    3: { open: 17 * 60, close: 25 * 60 },
    4: { open: 17 * 60, close: 25 * 60 },
    5: { open: 17 * 60, close: 27 * 60 },
    6: { open: 17 * 60, close: 27 * 60 }
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
      if (SCHEDULE[day]) {
        return { day: day, open: SCHEDULE[day].open, inDays: i };
      }
    }
    return null;
  }

  function updateStatus() {
    var dot = document.getElementById('statusDot');
    var text = document.getElementById('statusText');
    if (!dot || !text) return;

    var now = new Date();
    var day = now.getDay();
    var minutes = now.getHours() * 60 + now.getMinutes();

    // Le service de la veille peut déborder après minuit.
    var yesterday = (day + 6) % 7;
    var yShift = SCHEDULE[yesterday];
    if (yShift && yShift.close > 24 * 60 && minutes < yShift.close - 24 * 60) {
      dot.className = 'dot is-open';
      text.textContent = 'Ouvert en ce moment — jusqu’à ' + formatMinutes(yShift.close);
      return;
    }

    var today = SCHEDULE[day];
    if (today && minutes >= today.open && minutes < today.close) {
      dot.className = 'dot is-open';
      text.textContent = 'Ouvert en ce moment — jusqu’à ' + formatMinutes(today.close);
      return;
    }

    if (today && minutes < today.open) {
      dot.className = 'dot is-closed';
      text.textContent = 'Fermé — on ouvre aujourd’hui à ' + formatMinutes(today.open);
      return;
    }

    var next = nextOpening(day);
    dot.className = 'dot is-closed';
    text.textContent = next
      ? 'Fermé — réouverture ' + (next.inDays === 1 ? 'demain' : DAY_NAMES[next.day]) + ' à ' + formatMinutes(next.open)
      : 'Fermé pour le moment';
  }

  updateStatus();
  setInterval(updateStatus, 60 * 1000);

  // Mise en évidence du jour dans le tableau des horaires.
  var todayRow = document.querySelector('#hoursTable tr[data-day="' + new Date().getDay() + '"]');
  if (todayRow) todayRow.classList.add('is-today');

  /* ---------- Formulaire de réservation ---------- */
  var form = document.getElementById('bookingForm');

  if (form) {
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var toISO = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };

    var dateInput = form.querySelector('#date');
    var defaultDate = '';
    if (dateInput) {
      var today = new Date();
      // Le lundi est fermé : on propose d'emblée le prochain jour d'ouverture.
      var suggestion = new Date(today);
      while (!SCHEDULE[suggestion.getDay()]) {
        suggestion.setDate(suggestion.getDate() + 1);
      }
      defaultDate = toISO(suggestion);
      dateInput.min = toISO(today);
      if (!dateInput.value) dateInput.value = defaultDate;
    }

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
      var date = form.querySelector('#date').value;
      var heure = form.querySelector('#heure').value;

      ok = setError('nom', nom.length < 2 ? 'Merci d’indiquer votre nom.' : '') && ok;
      ok = setError('email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? '' : 'Adresse e-mail invalide.') && ok;

      if (!date) {
        ok = setError('date', 'Choisissez une date.') && ok;
      } else {
        var chosen = new Date(date + 'T00:00:00');
        var startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        if (chosen < startOfToday) {
          ok = setError('date', 'La date doit être aujourd’hui ou plus tard.') && ok;
        } else if (!SCHEDULE[chosen.getDay()]) {
          ok = setError('date', 'Le bar est fermé le ' + DAY_NAMES[chosen.getDay()] + '. Choisissez un autre jour.') && ok;
        } else {
          ok = setError('date', '') && ok;
        }
      }

      ok = setError('heure', heure ? '' : 'Indiquez une heure d’arrivée.') && ok;
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

      // Démo statique : aucune donnée n'est envoyée.
      // Branchez ici votre back-end ou votre service de formulaire.
      var nom = form.querySelector('#nom').value.trim();
      var personnes = form.querySelector('#personnes').value;
      var date = new Date(form.querySelector('#date').value + 'T00:00:00');
      var jolieDate = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

      status.textContent = 'Merci ' + nom + ' ! Demande enregistrée pour ' + personnes +
        ' personne' + (Number(personnes) > 1 ? 's' : '') + ' le ' + jolieDate +
        ' à ' + form.querySelector('#heure').value.replace(':', ' h ') +
        '. Nous confirmons par e-mail sous quelques heures.';
      status.className = 'form-status is-ok';
      form.reset();
      if (dateInput) dateInput.value = defaultDate;
    });

    ['nom', 'email', 'date', 'heure'].forEach(function (name) {
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

  /* ---------- Année courante ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
