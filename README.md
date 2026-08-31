# Le Petit Ravisé — site du bar-tabac

Site vitrine du **Petit Ravisé**, bar-tabac au 14 rue des Bons-Enfants, 76000 Rouen.
Six pages en HTML, CSS et JavaScript natifs : **aucune dépendance, aucune étape de
build**.

## Ouvrir le site tout de suite (sans hébergement)

Double-cliquez sur **`apercu-du-site.html`** : les six pages s'ouvrent dans le
navigateur, hors ligne, sans serveur ni mise en ligne. C'est le moyen le plus rapide
de montrer le site à quelqu'un.

Ce fichier est reconstruit à partir des vraies pages, il ne peut donc pas se décaler.
Après une modification :

```bash
pip install beautifulsoup4
python3 tools/build-apercu.py
```

## Mise en ligne (GitHub Pages)

Les fichiers du site sont **à la racine du dépôt** — c'est ce que GitHub Pages sert par
défaut. Dans *Settings → Pages* : source = cette branche, dossier = **`/ (root)`**.

> Si Pages est réglé sur `/docs`, la page publiée est le README et non le site : le
> visiteur voit alors de la documentation et des blocs de code. Le réglage doit être
> `/ (root)`, ou bien il faut déplacer les fichiers : `mkdir docs && git mv *.html css js img docs/`

### Le domaine personnalisé — à réactiver plus tard

Le fichier `CNAME` a été **retiré volontairement**. Tant qu'il est présent, GitHub
Pages redirige l'adresse `sanctimaps-gif.github.io/mon-depot/` vers
`barlepetitravisé.fr` : si ce domaine ne pointe encore nulle part, plus rien ne
s'ouvre — le navigateur affiche « site inaccessible ». C'était le cas.

Marche à suivre, dans cet ordre :

1. Chez le registrar, faire pointer `barlepetitravisé.fr` vers GitHub Pages
   (enregistrements A/ALIAS documentés par GitHub).
2. Attendre que le domaine résolve (`ping barlepetitravisé.fr` doit répondre).
3. Seulement ensuite, renseigner le domaine dans *Settings → Pages → Custom domain* :
   GitHub recrée le fichier `CNAME` tout seul.

Si le champ « Custom domain » est déjà rempli dans les réglages, videz-le : sinon
GitHub recrée le fichier et la redirection casse à nouveau l'accès.

`.nojekyll` désactive Jekyll : les fichiers sont servis tels quels.

Les mêmes fichiers fonctionnent sur Netlify, Cloudflare Pages ou un dossier
Apache/nginx.

## À compléter

Le site ne contient **aucune information inventée**. Trois éléments restent à fournir ;
en attendant, le site reste présentable — rien n'affiche « à compléter » côté visiteur.

| À fournir | Où | Comportement actuel |
| --- | --- | --- |
| **Les prix** | `carte.html` | La carte liste les boissons sans prix, avec la mention « Tarifs affichés au comptoir » |
| **Des photos** | `le-bar.html` | Illustrations au trait (dessins, pas des photos du lieu) |
| **Une adresse e-mail** | `js/main.js` | Le formulaire renvoie vers le téléphone |
| **Les dates d'événements** | `js/evenements.js` | « Aucune date annoncée pour le moment » |

Deux points à confirmer :

- **L'orthographe du nom.** Le site utilise « Le Petit Ravisé ». La page Facebook et le
  registre des entreprises écrivent « Le P'tit Ravisé ».
- **Les horaires** (lundi–samedi 7 h – 20 h, fermé le dimanche) proviennent de fiches
  publiques, pas du bar lui-même.

## Informations reprises de sources publiques

| Donnée | Valeur |
| --- | --- |
| Adresse | 14 rue des Bons-Enfants, 76000 Rouen |
| Téléphone | 02 35 71 66 79 |
| Horaires | Lundi – samedi, 7 h – 20 h · fermé le dimanche |
| Activité | Bar, tabac, Française des Jeux, terrasse |
| Facebook | [Le P'tit Ravisé](https://www.facebook.com/people/Le-Ptit-Ravis%C3%A9/100057174890968/) |
| Note Google | 4,6 / 5 — une cinquantaine d'avis (relevé en août 2026) |

## Les six pages

| Fichier | Contenu |
| --- | --- |
| `index.html` | Présentation, adresse, horaires, boutons « Voir la carte » et « Itinéraire », note Google |
| `carte.html` | Bières, cocktails & apéritifs, softs, boissons chaudes, à grignoter, QR code |
| `le-bar.html` | Ambiance, quartier, galerie |
| `evenements.html` | Agenda automatique + fil Facebook |
| `infos.html` | Plan, horaires, téléphone, transports, stationnement, avis |
| `contact.html` | Téléphone, réseaux sociaux, formulaire |

## Lancer le site en local

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

Ouvrir `index.html` directement fonctionne aussi.

## Structure

```
index.html … contact.html   Les six pages (en-tête et pied de page identiques)
apercu-du-site.html         Tout le site en un fichier autonome (double-clic)
.nojekyll                   Désactive Jekyll sur GitHub Pages
css/style.css               Thème, mise en page, responsive, impression
js/main.js                  Horaires, menu mobile, agenda, formulaire
js/evenements.js            Les dates à annoncer
img/qr-carte.svg            QR code vers la carte
tools/make-qr.py            Régénère le QR code
tools/build-apercu.py       Reconstruit l'aperçu en un fichier
```

## Modifier le site

### Ajouter les prix

Dans `carte.html`, chaque ligne ressemble à :

```html
<li><p class="menu-line"><span class="name">Express</span></p></li>
```

Ajoutez la ligne de pointillés et le prix :

```html
<li><p class="menu-line"><span class="name">Express</span><span class="dots"></span><span class="price">1,60 €</span></p></li>
```

Le style (pointillés de raccord, prix aligné à droite en vert) est déjà prêt. Pensez
alors à retirer la mention « Tarifs affichés au comptoir » en haut de la page.

### Brancher le formulaire de contact

Une seule ligne, en haut de la section 6 de `js/main.js` :

```js
var EMAIL_CONTACT = 'contact@exemple.fr';
```

Le formulaire ouvre alors le logiciel de messagerie du visiteur avec un message
pré-rempli (objet, texte, nom, e-mail, téléphone). Aucun serveur ni service tiers.
Tant que la constante est vide, le formulaire renvoie poliment vers le téléphone.

Pour un envoi sans passer par le logiciel de messagerie du visiteur, remplacez
l'appel `window.location.href = 'mailto:…'` par un `fetch()` vers Formspree, Netlify
Forms ou votre back-end.

### Les horaires — un seul endroit

L'objet `SCHEDULE` en haut de `js/main.js` (0 = dimanche … 6 = samedi, en minutes
depuis minuit, `null` = fermé) :

```js
var SCHEDULE = {
  0: null,                              // dimanche : fermé
  1: { open: 7 * 60, close: 20 * 60 }   // lundi 7 h → 20 h
};
```

Il pilote l'indicateur « ouvert / fermé » présent sur les six pages **et** le
surlignage du jour courant. Une fermeture supérieure à `24 * 60` signifie « ferme le
lendemain matin » (`26 * 60` = 2 h du matin), le cas est géré.

Mettez à jour en parallèle les tableaux d'horaires de `index.html` et `infos.html`,
ainsi que le bloc `openingHoursSpecification` (Schema.org) de `index.html`.

### Une date dans l'agenda

Une entrée dans `js/evenements.js`, rien d'autre :

```js
window.EVENEMENTS = [
  {
    date: "2026-09-12",
    titre: "Retransmission — Rouen / Le Havre",
    description: "Match diffusé sur l'écran de la salle.",
    heure: "21 h 00",
    prix: "Entrée libre"
  }
];
```

Les dates passées disparaissent toutes seules. Liste vide = « Aucune date annoncée ».

### Remplacer les illustrations par des photos

Dans `le-bar.html`, chaque vignette est un `<figure class="illu">` contenant un `<svg>`.
Remplacez le bloc `<svg>…</svg>` par `<img src="img/comptoir.jpg" alt="Le comptoir">`
et déposez la photo dans `img/`. Format carré conseillé, environ 800 × 800 px.

### Le QR code

Il pointe vers `https://xn--barlepetitravis-pnb.fr/carte.html` (forme punycode :
comprise par tous les lecteurs, là où l'Unicode peut échouer) — vérifié par décodage,
prêt à imprimer. En cas de changement de domaine :

```bash
pip install segno
python3 tools/make-qr.py https://nouveau-domaine.fr/carte.html
```

### Couleurs et typographies

Variables CSS en haut de `css/style.css` :

```css
:root {
  --green: #1f4d3d;   /* vert bouteille, couleur principale */
  --red:   #b6412f;   /* rouge « carotte » tabac, accents */
  --paper: #faf6ef;   /* fond crème */
}
```

Les polices viennent de Google Fonts ; en cas d'échec de chargement, les polices
système prennent le relais sans casser la mise en page.

## Intégrations externes

- **Plan** : iframe OpenStreetMap, sans clé d'API ni compte. La carte est cadrée sur le
  quartier plutôt que sur un point précis : les coordonnées exactes du numéro 14 n'ont
  pas pu être vérifiées, et un repère mal placé en centre-ville induit plus en erreur
  que pas de repère. Les boutons « Itinéraire » (Google Maps, Apple Plans, Waze)
  utilisent l'adresse postale complète et restent exacts.
- **Facebook** : le fil de la page est intégré sur `evenements.html`. Le plugin
  Facebook ne fonctionne qu'avec une *page* professionnelle ; si l'établissement a un
  *profil*, l'encart restera vide — un lien de repli est affiché juste en dessous.
- **Avis Google** : la note est affichée avec sa date de relevé, et un bouton renvoie
  vers la fiche. Aucun avis n'est recopié ni inventé.

## Accessibilité

- Navigation clavier complète : lien d'évitement, menu mobile retiré du parcours de
  tabulation quand il est fermé, `aria-current` sur la page active.
- `aria-live` sur les messages d'état, libellés associés à chaque champ.
- `prefers-reduced-motion` respecté.
- La hauteur des messages d'erreur est réservée en permanence, pour qu'afficher ou
  effacer une erreur ne décale jamais le bouton d'envoi sous le curseur.
- Feuille de style d'impression : la carte s'imprime sur deux colonnes.
- Données structurées Schema.org (`BarOrPub`) pour le référencement local.

## Mentions légales

Le pied de page porte les mentions obligatoires (modération, interdiction de vente aux
mineurs, avertissement sanitaire tabac). Avant publication, ajoutez les mentions
légales de l'établissement : raison sociale, SIRET, directeur de la publication,
hébergeur.
