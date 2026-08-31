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

Le fichier `CNAME` a été **mis de côté** sous le nom `CNAME.a-activer` (GitHub ignore
ce nom). Sa valeur est conservée telle quelle : `xn--barlepetitravis-pnb.com`,
c'est-à-dire `barlepetitravisé.com`.

Pourquoi : dès qu'un fichier `CNAME` existe, GitHub Pages **redirige**
`sanctimaps-gif.github.io/mon-depot/` vers le domaine personnalisé. Si ce domaine ne
pointe nulle part, la redirection tombe dans le vide et **plus aucune adresse ne
s'ouvre** — c'était la cause du « je n'arrive pas à ouvrir le site ». Au moment de la
vérification, ni le `.fr` ni le `.com` ne résolvaient.

Marche à suivre, dans cet ordre :

1. Chez le registrar, faire pointer `barlepetitravisé.com` vers GitHub Pages
   (enregistrements A/ALIAS documentés par GitHub).
2. Attendre que le domaine résolve (`ping xn--barlepetitravis-pnb.com` doit répondre).
3. Seulement ensuite : `git mv CNAME.a-activer CNAME`, ou renseigner le domaine dans
   *Settings → Pages → Custom domain* — GitHub recrée alors le fichier tout seul.

Si le champ « Custom domain » est déjà rempli dans les réglages, **videz-le** : sinon
GitHub recrée `CNAME` et la redirection casse à nouveau l'accès.

`.nojekyll` désactive Jekyll : les fichiers sont servis tels quels.

Les mêmes fichiers fonctionnent sur Netlify, Cloudflare Pages ou un dossier
Apache/nginx.

## À compléter

Le site ne contient **aucune information inventée**. Trois éléments restent à fournir ;
en attendant, le site reste présentable — rien n'affiche « à compléter » côté visiteur.

| À fournir | Où le saisir | Comportement actuel |
| --- | --- | --- |
| **Les prix** | Console → La carte | La carte s'affiche sans prix, avec « Tarifs affichés au comptoir » |
| **Une adresse e-mail** | Console → Réglages | Le formulaire renvoie vers le téléphone |
| **Les dates d'événements** | Console → Événements | « Aucune date annoncée pour le moment » |
| **Des photos** | `le-bar.html` (à la main) | Illustrations au trait (dessins, pas des photos du lieu) |

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
admin.html                  Console d'administration (non référencée par le site)
apercu-du-site.html         Tout le site en un fichier autonome (double-clic)
CNAME.a-activer             Domaine personnalisé, en attente du DNS
.nojekyll                   Désactive Jekyll sur GitHub Pages
css/style.css               Thème, mise en page, responsive, impression
js/donnees.js               LE CONTENU : réglages, carte, agenda (écrit par la console)
js/main.js                  Horaires, menu mobile, rendu de la carte et de l'agenda
js/admin.js                 Logique de la console d'administration
css/admin.css               Styles de la console
img/qr-carte.svg            QR code vers la carte
tools/make-qr.py            Régénère le QR code
tools/build-apercu.py       Reconstruit l'aperçu en un fichier
```

## Modifier le site sans toucher au code

Ouvrez **`admin.html`** (par exemple `barlepetitravisé.com/admin.html`) : une console
permet de modifier l'adresse e-mail, la carte et les événements, puis de publier. Les
changements sont visibles par tous les visiteurs une minute plus tard.

### Il n'y a pas de mot de passe — et c'est voulu

Le site est statique : pas de serveur, pas de base de données. Un mot de passe stocké
dans la page serait lisible par n'importe qui dans le code source, et les modifications
ne seraient enregistrées que dans votre navigateur, invisibles pour les visiteurs.

Le compte administrateur est donc **votre compte GitHub**, où le site est hébergé. Vous
collez une fois une *clé d'accès* ; la console écrit directement dans le dépôt.

### Créer la clé (une seule fois, 2 minutes)

1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained
   tokens → Generate new token**.
2. Nom : `Site du bar`. Expiration au choix.
3. **Repository access** → *Only select repositories* → `mon-depot`.
4. **Permissions → Repository permissions → Contents** → *Read and write*. Rien d'autre.
5. Générer, copier, coller dans la console. GitHub ne la réaffichera plus.

La marche à suivre est également rappelée sur la page de connexion.

### Ce qu'il faut savoir

- La clé ne quitte pas votre navigateur : elle n'est envoyée qu'à `api.github.com`.
  Elle est conservée dans le navigateur si vous cochez « rester connecté », sinon
  oubliée à la fermeture de l'onglet.
- **Sur un ordinateur partagé**, décochez « rester connecté ».
- La clé n'ouvre que ce dépôt, et seulement ses fichiers. En cas de doute, révoquez-la
  sur GitHub : elle cesse aussitôt de fonctionner.
- `admin.html` est accessible publiquement (c'est un site statique), mais sans clé
  valide la page ne peut rien faire ni rien afficher du contenu.
- Publier écrit un commit dans `js/donnees.js` : l'historique GitHub garde chaque
  version, donc rien n'est jamais perdu.

### Ce que la console modifie

| Onglet | Contenu |
| --- | --- |
| Réglages | Adresse e-mail de contact, téléphone affiché, mention en haut de la carte |
| La carte | Rubriques, intitulés, prix, descriptions — ajout, modification, suppression |
| Événements | Dates, titres, heures, tarifs. Les dates passées disparaissent du site |

Dès qu'au moins un prix est saisi, la mention « Tarifs affichés au comptoir » disparaît
toute seule. Dès que l'adresse e-mail est renseignée, le formulaire de contact s'en sert.

## Modifier le site à la main

La console couvre les cas courants. Pour le reste, tout le contenu éditable vit dans
`js/donnees.js` — un objet JavaScript que vous pouvez modifier directement (attention
aux virgules : une erreur de syntaxe et le contenu ne s'affiche plus).

### Le formulaire de contact

Il utilise `reglages.email`. Renseignée, l'adresse déclenche l'ouverture de la
messagerie du visiteur avec un message pré-rempli (objet, texte, coordonnées) — aucun
serveur ni service tiers. Vide, le formulaire renvoie vers le téléphone.

Pour un envoi qui ne passe pas par la messagerie du visiteur, remplacez l'appel
`window.location.href = 'mailto:…'` de `js/main.js` par un `fetch()` vers Formspree,
Netlify Forms ou votre back-end.

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

### Une date dans l'agenda, à la main

Dans le tableau `evenements` de `js/donnees.js` :

```js
{
  "date": "2026-09-12",
  "titre": "Retransmission — Rouen / Le Havre",
  "description": "Match diffusé sur l'écran de la salle.",
  "heure": "21 h 00",
  "prix": "Entrée libre"
}
```

Les dates passées disparaissent toutes seules. Liste vide = « Aucune date annoncée ».

### Remplacer les illustrations par des photos

Dans `le-bar.html`, chaque vignette est un `<figure class="illu">` contenant un `<svg>`.
Remplacez le bloc `<svg>…</svg>` par `<img src="img/comptoir.jpg" alt="Le comptoir">`
et déposez la photo dans `img/`. Format carré conseillé, environ 800 × 800 px.

### Le QR code

Il pointe vers `https://xn--barlepetitravis-pnb.com/carte.html` (forme punycode :
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
