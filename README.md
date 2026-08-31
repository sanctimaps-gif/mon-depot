# Le Petit Ravisé — site du bar-tabac

Site vitrine du **Petit Ravisé**, bar-tabac au 14 rue des Bons-Enfants, 76000 Rouen.
Six pages en HTML, CSS et JavaScript natifs : **aucune dépendance, aucune étape de
build**. Les fichiers se déposent tels quels sur n'importe quel hébergeur.

---

## ⚠️ À compléter avant la mise en ligne

Le site ne contient **aucune information inventée**. Ce qui n'a pas pu être vérifié a
été laissé vide et signalé sur la page elle-même. Quatre choses manquent :

| À fournir | Où cela atterrit | État |
| --- | --- | --- |
| **Les prix de la carte** | `carte.html` | Tous les tarifs affichent `—` |
| **Des photos du bar** | `le-bar.html` | Illustrations au trait en attendant |
| **Les vraies dates d'événements** | `js/evenements.js` | Liste vide → « Aucune date annoncée » |
| **Une adresse e-mail** | `contact.html` | Formulaire non branché |

Deux points à confirmer également :

- **L'orthographe du nom.** Le site utilise « Le Petit Ravisé ». La page Facebook et le
  registre des entreprises écrivent « Le P'tit Ravisé ». Un chercher-remplacer suffit.
- **Les horaires.** Ceux affichés (lundi–samedi 7 h – 20 h, fermé le dimanche)
  proviennent de fiches publiques, pas du bar lui-même.

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
| `le-bar.html` | Ambiance, quartier, galerie, histoire du lieu |
| `evenements.html` | Calendrier automatique + fil Facebook intégré |
| `infos.html` | Plan, horaires, téléphone, transports, stationnement, avis |
| `contact.html` | Téléphone, réseaux sociaux, formulaire de contact |

## Lancer le site en local

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

Ouvrir `index.html` directement fonctionne aussi.

## Structure

```
*.html            Les six pages (en-tête et pied de page identiques)
css/style.css     Thème, mise en page, responsive, impression
js/main.js        Horaires, menu mobile, calendrier, formulaire
js/evenements.js  Les dates à annoncer — le seul fichier à modifier pour l'agenda
img/qr-carte.svg  QR code vers la carte
tools/make-qr.py  Régénère le QR code
```

## Modifier le site

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

Pensez à mettre à jour en parallèle les tableaux d'horaires dans `index.html` et
`infos.html`, ainsi que le bloc `openingHoursSpecification` (Schema.org) de
`index.html`.

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

Les dates passées disparaissent toutes seules. Liste vide = message « Aucune date
annoncée ».

### Les prix

Dans `carte.html`, remplacer chaque `<span class="price todo">—</span>` par
`<span class="price">2,20 €</span>` (retirer la classe `todo` grise le prix en vert).

### Le QR code

```bash
pip install segno
python3 tools/make-qr.py https://votre-domaine.fr/carte.html
```

Le fichier `img/qr-carte.svg` est réécrit ; les pages qui l'affichent se mettent à
jour automatiquement. **Le QR livré pointe vers une adresse d'exemple** — à régénérer
avant impression.

### Le formulaire de contact

La validation est complète, l'envoi ne l'est pas : remplacer le bloc commenté
`// --- Démo statique` dans `js/main.js` par un `fetch()` vers un back-end ou un
service de formulaires (Formspree, Netlify Forms…).

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
  pas pu être vérifiées, et un repère mal placé en centre-ville est pire que pas de
  repère. Les boutons « Itinéraire » (Google Maps, Apple Plans, Waze) utilisent
  l'adresse postale complète et restent exacts.
- **Facebook** : le fil de la page est intégré sur `evenements.html`. Le plugin
  Facebook ne fonctionne qu'avec une *page* professionnelle ; si l'établissement a un
  *profil*, l'encart restera vide — un lien de repli est affiché juste en dessous.
- **Avis Google** : la note est affichée en clair avec sa date de relevé, et un bouton
  renvoie vers la fiche. Aucun avis n'est recopié ni inventé.

## Accessibilité et compatibilité

- Navigation clavier complète : lien d'évitement, menu mobile retiré du parcours de
  tabulation quand il est fermé, `aria-current` sur la page active.
- `aria-live` sur les messages d'état, libellés associés à chaque champ.
- `prefers-reduced-motion` respecté (animations et défilement fluide désactivés).
- La hauteur des messages d'erreur est réservée en permanence, pour qu'afficher ou
  effacer une erreur ne décale jamais le bouton d'envoi sous le curseur.
- Feuille de style d'impression : la carte s'imprime proprement sur deux colonnes.
- Données structurées Schema.org (`BarOrPub`) pour le référencement local.

## Mise en ligne

Fichiers statiques : GitHub Pages, Netlify, Cloudflare Pages ou un dossier
Apache/nginx. Pour GitHub Pages : *Settings → Pages*, branche voulue, dossier racine.

Après la mise en ligne, régénérer le QR code avec l'adresse réelle.

## Mentions légales

Le pied de page porte les mentions obligatoires (modération, interdiction de vente aux
mineurs, avertissement sanitaire tabac). Avant publication, ajoutez les mentions
légales de l'établissement : raison sociale, SIRET, directeur de la publication et
hébergeur.
