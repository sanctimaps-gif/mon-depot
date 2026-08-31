/* =========================================================
   Le Petit Ravisé — contenu modifiable du site
   ---------------------------------------------------------
   CE FICHIER EST LA SOURCE UNIQUE du contenu : réglages,
   carte et agenda. Les pages du site le lisent, la console
   d'administration (admin.html) l'écrit.

   Vous pouvez le modifier à la main, mais la console est plus
   sûre : elle valide les champs et écrit un fichier toujours
   correct. Si vous éditez à la main, respectez la structure —
   une virgule oubliée et le contenu ne s'affiche plus.

   Format : un objet JavaScript, pas du JSON. Ce choix permet
   d'ouvrir le site en double-cliquant sur un fichier, sans
   serveur (fetch() est interdit sur file://).
   ========================================================= */

window.DONNEES = {

  /* ---- Réglages généraux ---- */
  "reglages": {
    "email": "",
    "telephone": "02 35 71 66 79",
    "telephoneLien": "+33235716679",
    "mentionTarifs": "Tarifs affichés au comptoir et en terrasse."
  },

  /* ---- La carte ----
     Chaque rubrique : id (ancre), emoji, titre, items.
     Chaque item : nom, prix (vide = non affiché), description. */
  "carte": [
    {
      "id": "bieres",
      "emoji": "🍺",
      "titre": "Bières",
      "items": [
        { "nom": "Pression — 25 cl", "prix": "", "description": "" },
        { "nom": "Pression — 50 cl", "prix": "", "description": "" },
        { "nom": "Blonde en bouteille", "prix": "", "description": "" },
        { "nom": "Blanche", "prix": "", "description": "" },
        { "nom": "Ambrée", "prix": "", "description": "" },
        { "nom": "Bière sans alcool", "prix": "", "description": "" },
        { "nom": "Panaché", "prix": "", "description": "" },
        { "nom": "Monaco", "prix": "", "description": "Bière, limonade et grenadine." }
      ]
    },
    {
      "id": "cocktails",
      "emoji": "🍹",
      "titre": "Cocktails & apéritifs",
      "items": [
        { "nom": "Kir", "prix": "", "description": "Cassis, mûre ou pêche." },
        { "nom": "Kir royal", "prix": "", "description": "" },
        { "nom": "Spritz", "prix": "", "description": "" },
        { "nom": "Mojito", "prix": "", "description": "" },
        { "nom": "Anisé", "prix": "", "description": "Servi avec sa carafe d'eau fraîche." },
        { "nom": "Punch maison", "prix": "", "description": "" },
        { "nom": "Cocktail sans alcool", "prix": "", "description": "" },
        { "nom": "Vin au verre — rouge, blanc, rosé", "prix": "", "description": "" }
      ]
    },
    {
      "id": "softs",
      "emoji": "🥤",
      "titre": "Softs",
      "items": [
        { "nom": "Sodas — 33 cl", "prix": "", "description": "" },
        { "nom": "Jus de fruits", "prix": "", "description": "" },
        { "nom": "Eau plate — 50 cl", "prix": "", "description": "" },
        { "nom": "Eau pétillante — 50 cl", "prix": "", "description": "" },
        { "nom": "Limonade", "prix": "", "description": "" },
        { "nom": "Sirop à l'eau", "prix": "", "description": "" },
        { "nom": "Diabolo", "prix": "", "description": "" },
        { "nom": "Perrier", "prix": "", "description": "" }
      ]
    },
    {
      "id": "chaudes",
      "emoji": "☕",
      "titre": "Boissons chaudes",
      "items": [
        { "nom": "Express", "prix": "", "description": "" },
        { "nom": "Café allongé", "prix": "", "description": "" },
        { "nom": "Double express", "prix": "", "description": "" },
        { "nom": "Noisette", "prix": "", "description": "" },
        { "nom": "Café crème", "prix": "", "description": "" },
        { "nom": "Cappuccino", "prix": "", "description": "" },
        { "nom": "Chocolat chaud", "prix": "", "description": "" },
        { "nom": "Thé & infusions", "prix": "", "description": "" }
      ]
    },
    {
      "id": "manger",
      "emoji": "🥖",
      "titre": "À grignoter",
      "items": [
        { "nom": "Croissant, pain au chocolat", "prix": "", "description": "Le matin, avec le café." },
        { "nom": "Sandwich jambon-beurre", "prix": "", "description": "" },
        { "nom": "Sandwich poulet crudités", "prix": "", "description": "" },
        { "nom": "Croque-monsieur", "prix": "", "description": "" },
        { "nom": "Planche de charcuterie", "prix": "", "description": "" },
        { "nom": "Planche mixte charcuterie & fromage", "prix": "", "description": "" },
        { "nom": "Chips, cacahuètes, olives", "prix": "", "description": "" }
      ]
    }
  ],

  /* ---- Agenda ----
     date : AAAA-MM-JJ. Les dates passées disparaissent seules. */
  "evenements": []
};
