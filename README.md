# Le Comptoir Doré — site vitrine d'un bar

Site web statique pour un bar à cocktails : présentation, carte, agenda des soirées,
formulaire de réservation et infos pratiques. HTML, CSS et JavaScript natifs,
**aucune dépendance ni étape de build** — les fichiers se déposent tels quels sur
n'importe quel hébergeur.

## Aperçu du contenu

| Section | Contenu |
| --- | --- |
| Accueil | Accroche, appels à l'action, indicateur « ouvert / fermé » calculé en direct |
| La maison | Présentation du lieu et chiffres clés |
| La carte | 5 onglets : signatures, classiques, sans alcool, bières & vins, à grignoter |
| Agenda | Concerts, ateliers et dégustations du mois |
| L'ambiance | Illustrations au trait (SVG en ligne, aucune image à charger) |
| Réservation | Formulaire validé côté client |
| Infos | Horaires (jour courant surligné), adresse, contact |

## Lancer le site en local

Ouvrir `index.html` dans un navigateur suffit. Pour un contexte plus proche de la
production :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## Structure

```
index.html      Toutes les sections + données structurées Schema.org (BarOrPub)
css/style.css   Thème, mise en page, responsive, impression
js/main.js      Menu mobile, onglets, horaires, validation du formulaire
```

## Personnalisation

**Textes, plats et tarifs** — directement dans `index.html`. Chaque entrée de la
carte est un `<li>` avec un titre, un prix et une description.

**Couleurs et typographies** — variables CSS en haut de `css/style.css` :

```css
:root {
  --bg: #12100e;
  --gold: #e0c48a;
  --font-display: "Cormorant Garamond", Georgia, serif;
}
```

Les polices viennent de Google Fonts ; si elles ne se chargent pas, les polices
système prennent le relais sans casser la mise en page.

**Horaires** — un seul endroit à modifier, l'objet `SCHEDULE` dans `js/main.js`
(0 = dimanche … 6 = samedi, en minutes depuis minuit ; `null` = fermé) :

```js
var SCHEDULE = {
  1: null,                                  // lundi : fermé
  5: { open: 17 * 60, close: 27 * 60 }      // vendredi 17 h → 3 h du matin
};
```

Une fermeture supérieure à `24 * 60` signifie que le bar ferme le lendemain matin.
Cet objet alimente l'indicateur « ouvert / fermé » **et** le refus des jours de
fermeture dans le formulaire. Pensez à mettre à jour en parallèle le tableau des
horaires dans `index.html` et le bloc `openingHoursSpecification` (Schema.org).

**Formulaire de réservation** — la validation est complète, mais l'envoi est une
démonstration : rien n'est transmis. Pour le brancher, remplacez le bloc marqué
`// Démo statique` dans `js/main.js` par un `fetch()` vers votre back-end ou un
service de formulaires.

## Accessibilité et compatibilité

- Navigation au clavier complète : lien d'évitement, onglets pilotables aux
  flèches, menu mobile retiré du parcours de tabulation quand il est fermé.
- Repères ARIA sur les onglets, `aria-live` sur les messages d'état.
- `prefers-reduced-motion` respecté : animations et défilement fluide désactivés.
- La hauteur des messages d'erreur est réservée, pour qu'afficher ou effacer une
  erreur ne décale jamais le bouton d'envoi sous le curseur.
- Feuille de style d'impression pour la carte.

## Mise en ligne

Fichiers statiques : GitHub Pages, Netlify, Cloudflare Pages ou un simple dossier
Apache/nginx. Pour GitHub Pages, activer *Settings → Pages* sur la branche voulue,
dossier racine — rien d'autre à configurer.

## Contenu de démonstration

Le bar, l'adresse, le téléphone et les événements sont **fictifs** et servent
d'exemple. À remplacer par vos informations réelles avant toute mise en ligne.
