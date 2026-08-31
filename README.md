# Le P’tit Ravisé — site du bar-tabac

Site vitrine du **P’tit Ravisé**, bar-tabac au 14 rue des Bons-Enfants, 76000 Rouen.
Six pages en français, six en anglais, en HTML, CSS et JavaScript natifs : **aucune
dépendance, aucune étape de build**. Un espace d'administration en PHP, sans base de
données, permet de modifier le contenu sans toucher au code, et le formulaire de contact
envoie réellement les messages.

## Ouvrir le site tout de suite (sans hébergement)

Double-cliquez sur **`apercu-du-site.html`** : les six pages françaises s'ouvrent dans le
navigateur, hors ligne, sans serveur ni mise en ligne. C'est le moyen le plus rapide
de montrer le site à quelqu'un.

Ce fichier est reconstruit à partir des vraies pages, il ne peut donc pas se décaler.
Après une modification :

```bash
pip install beautifulsoup4
python3 tools/build-apercu.py
```

## Mise en ligne

Deux cas selon ce dont vous avez besoin :

| | Site public | Espace d'administration |
| --- | --- | --- |
| **Hébergement PHP** (3–5 €/mois) | ✅ | ✅ |
| **GitHub Pages** (gratuit) | ✅ | ❌ — PHP n'y est pas exécuté |

Le site public fonctionne partout. L'administration exige PHP : voir
*[L'espace d'administration](#lespace-dadministration)*.

### GitHub Pages (site public uniquement)

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
| **Les prix** | `/admin/` → La carte | La carte s'affiche sans prix, avec « Tarifs affichés au comptoir » |
| **Les dates d'événements** | `/admin/` → Événements | « Aucune date annoncée pour le moment » |
| **Des photos** | Page « Le bar » → *Ajouter une photo* | Illustrations au trait (dessins, pas des photos du lieu) |

Deux points à confirmer :

- **L'orthographe du nom.** Le site utilise « Le P’tit Ravisé ». La page Facebook et le
  registre des entreprises écrivent « Le P'tit Ravisé ».
- **Les horaires** (lundi–samedi 7 h – 20 h, fermé le dimanche) proviennent de fiches
  publiques, pas du bar lui-même.

## Informations reprises de sources publiques

| Donnée | Valeur |
| --- | --- |
| Adresse | 14 rue des Bons-Enfants, 76000 Rouen |
| Téléphone | 02 35 71 66 79 |
| Horaires | Lundi – vendredi 7 h – 20 h · samedi 8 h 30 – 20 h · fermé le dimanche |
| Activité | Bar, tabac, Française des Jeux, terrasse |
| Facebook | [Le P'tit Ravisé](https://www.facebook.com/people/Le-Ptit-Ravis%C3%A9/100057174890968/) |
| Note Google | 4,6 / 5 — une cinquantaine d'avis (relevé en août 2026) |

## Les pages

Le site existe en **français** (à la racine) et en **anglais** (dans `en/`).

| Fichier | Équivalent anglais | Contenu |
| --- | --- | --- |
| `index.html` | `en/index.html` | Présentation, adresse, horaires, boutons « Voir la carte » et « Itinéraire », note Google |
| `carte.html` | `en/menu.html` | Bières, cocktails & apéritifs, softs, boissons chaudes, à grignoter, QR code |
| `le-bar.html` | `en/the-bar.html` | Ambiance, quartier, galerie |
| `evenements.html` | `en/events.html` | Agenda automatique + fil Facebook |
| `infos.html` | `en/visit.html` | Plan, horaires, téléphone, transports, stationnement, avis |
| `contact.html` | `en/contact.html` | Téléphone, réseaux sociaux, formulaire |

## Les deux langues

Le français est la version de référence ; l'anglais vit dans `en/` avec ses propres
adresses (`menu.html`, `the-bar.html`, `visit.html`…), meilleures pour le référencement
anglophone que des noms français.

**Ce qui relie les deux :** chaque page déclare ses balises `hreflang` (`fr`, `en` et
`x-default` sur le français), le `sitemap.xml` les déclare deux fois avec leurs
`xhtml:link`, et une bascule **English / Français** figure dans le menu de chaque page.
Google comprend ainsi qu'il s'agit de deux versions d'une même page, et non de deux
contenus qui se font concurrence.

**Ce qui n'est pas traduit, et pourquoi.** La carte et l'agenda sont saisis par le bar
dans la console ; ils s'affichent tels qu'ils ont été écrits, dans les deux langues. Les
noms des consommations (*Kir*, *Monaco*, *Croque-monsieur*) n'auraient d'ailleurs pas
grand sens traduits. En revanche tout ce que produit le site — statut d'ouverture, jours,
mois, boutons, messages du formulaire — suit la langue de la page.

**Comment le script sait dans quelle langue il travaille :** les pages anglaises portent
`<html lang="en" data-racine="../">`. `lang` choisit le dictionnaire en tête de
`js/main.js`, `data-racine` indique où trouver `css/`, `js/`, `img/` et `admin/` depuis
un dossier plus bas. Une page qui ne déclare rien reste française et à la racine.

**Ajouter une page anglaise :** copiez la page française correspondante, remplacez la
balise `<html>`, le `<head>` (titre, description, `canonical`, `hreflang`) et les textes,
puis ajoutez-la au `sitemap.xml` et aux deux menus.

## Lancer le site en local

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

Ouvrir `index.html` directement fonctionne aussi.

## Structure

```
index.html … contact.html   Les six pages françaises (en-tête et pied de page identiques)
en/                         Les mêmes pages en anglais
  index.html menu.html the-bar.html events.html visit.html contact.html
contact.php                 Reçoit et expédie les messages du formulaire
admin/                      Espace d'administration (PHP) — voir plus bas
  index.php                 Connexion et console
  photo.php                 Réception des photos déposées depuis le site
  motdepasse.php            Changement de mot de passe depuis l'entrée « Compte »
  compte-initial.php        Compte livré avec le site
  destinataire-initial.php  Adresse qui reçoit les messages du formulaire
  api.php                   Actions : connexion, enregistrement, mot de passe
  lib.php                   Compte, session, écriture du contenu
  console.js                Interface de la console
  .htaccess                 Protection des fichiers sensibles
apercu-du-site.html         Tout le site en un fichier autonome (double-clic)
CNAME.a-activer             Domaine personnalisé, en attente du DNS
.nojekyll                   Désactive Jekyll sur GitHub Pages
css/style.css               Thème, mise en page, responsive, impression
js/donnees.js               LE CONTENU : réglages, carte, agenda, photos
js/main.js                  Horaires, menu mobile, rendu de la carte et de l'agenda
css/admin.css               Styles de la console
img/qr-carte.svg            QR code vers la carte
img/partage.jpg             Image de partage (réseaux sociaux)
robots.txt                  Indexation : /admin/ exclu
sitemap.xml                 Plan du site pour les moteurs
img/photos/                 Photos déposées depuis le site
tools/make-qr.py            Régénère le QR code
tools/build-apercu.py       Reconstruit l'aperçu en un fichier
tools/creer-compte.php      Crée un compte avec un mot de passe unique
```

## L'espace d'administration

**Comment y accéder :** l'entrée **Compte** du menu (visible aussi dans le menu
dépliant sur téléphone) ouvre directement le changement de mot de passe. Pour la
console complète : le lien *Administration du site* en bas de chaque page, ou
l'adresse **`/admin/`** (par exemple `votre-domaine.fr/admin/`).

> ⚠️ **Cette page ne fonctionne que sur un hébergement PHP.** Sur GitHub Pages, PHP
> n'est pas exécuté : `/admin/` n'ouvrira rien d'utile. C'est la raison la plus
> fréquente de « je ne vois pas comment me connecter ».

Le site se modifie depuis **`/admin/`** :
adresse e-mail de contact, carte, prix, événements, mot de passe. Aucun compte
extérieur — ni GitHub, ni service tiers.

### Première connexion : le compte est déjà créé

Le site est livré avec un compte administrateur :

| | |
| --- | --- |
| Adresse | `admin@leptitravise.fr` |
| Mot de passe | `PetitRavise-2026` |

Ce mot de passe reste valable tant qu'il n'a pas été changé. Le changement se fait
quand on veut, depuis l'onglet **Mon compte**, en indiquant le mot de passe actuel —
c'est lui qui prouve que la personne devant l'écran détient bien le compte. L'adresse
de connexion se modifie au même endroit. Tant que le mot de passe livré est en place,
un rappel s'affiche dans cet onglet ; il disparaît dès qu'il est remplacé.

Le nouveau compte est alors écrit dans `admin/compte.php`, qui prend définitivement le
relais de `admin/compte-initial.php`.

> ⚠️ **Ce mot de passe est le même pour toutes les copies du site et figure dans le
> dépôt : il est donc public.** Tant qu'il n'est pas changé, n'importe qui peut se
> connecter à l'administration d'un site fraîchement mis en ligne. **Changez-le dès la
> première connexion**, avant de communiquer l'adresse au client — ou donnez à chaque
> client un mot de passe unique (voir ci-dessous).

Le mot de passe n'est jamais stocké en clair, pas même sur le serveur : seule son
empreinte l'est (`password_hash`, bcrypt). Oublié, il suffit de supprimer
`admin/compte.php` par FTP pour revenir au mot de passe provisoire.

### Changer le mot de passe depuis le site

L'entrée **Compte** du menu ouvre une fenêtre demandant l'ancien mot de passe puis le
nouveau. C'est la connaissance de l'ancien qui autorise le changement : aucune session
n'est nécessaire, et la limite de cinq tentatives par quart d'heure s'applique aussi.

Le même réglage existe dans l'onglet *Mon compte* de la console, où l'adresse de
connexion se modifie également.

### Donner un mot de passe unique à chaque client

Plus sûr que le mot de passe livré, si vous avez accès à PHP en ligne de commande :

```bash
php tools/creer-compte.php client@exemple.fr "un mot de passe provisoire"
```

Le fichier `admin/compte.php` est créé avec ce mot de passe, qui remplace celui livré.
Rien n'est alors public.

### Ce que la console permet

| Onglet | Contenu |
| --- | --- |
| Réglages | Adresse e-mail de contact, téléphone, mention en haut de la carte |
| La carte | Rubriques, intitulés, prix, descriptions — ajout, modification, suppression |
| Événements | Dates, titres, heures, tarifs. Les dates passées disparaissent du site |
| Photos | Retirer une photo de la galerie pour libérer son emplacement |
| | *La carte se modifie aussi depuis un bandeau sur la page « La carte », visible uniquement quand vous êtes connecté.* |
| Mon compte | Adresse de connexion et mot de passe |

Enregistrer réécrit `js/donnees.js`, que les pages publiques lisent. Dès qu'un prix est
saisi, la mention « Tarifs affichés au comptoir » disparaît d'elle-même ; dès que
l'adresse e-mail est renseignée, le formulaire de contact s'en sert.

**Les prix sont facultatifs, ligne par ligne** : une boisson sans prix s'affiche seule,
une autre avec son prix aligné à droite. Rien n'oblige à tout remplir.

Quand une session est ouverte, la page « La carte » affiche en haut un bandeau
*Vous êtes connecté — Modifier la carte* qui mène directement au bon onglet. Un
visiteur ordinaire ne le voit pas : la page interroge `admin/session.php` et ne
dévoile ce bandeau qu'en cas de session valide.

### Ce qu'il faut pour que ça marche : un hébergement PHP

C'est la seule contrainte, et elle est inévitable : **un compte avec mot de passe exige
un serveur**. GitHub Pages n'en a pas — il ne sert que des fichiers.

- Le **site public** reste 100 % statique : il fonctionne partout, y compris sur
  GitHub Pages, et même en double-cliquant sur un fichier.
- Seul le dossier **`admin/`** a besoin de PHP 8.0 ou plus récent.

N'importe quel hébergement mutualisé convient (OVH, Ionos, o2switch, Hostinger…),
autour de 3 à 5 € par mois. Aucune base de données, aucune extension particulière :
`session`, `json` et `mbstring`, présentes partout par défaut.

### Mise en ligne sur un hébergement PHP

1. Envoyer tout le dossier par FTP à la racine du site (`www/` ou `public_html/`).
2. Vérifier que le serveur peut écrire dans `admin/` et dans `js/` — c'est là que le
   compte et le contenu sont enregistrés. Droits `755` sur les dossiers suffisent
   généralement ; sinon `775`.
3. Ouvrir `votre-domaine.fr/admin/` et créer le compte.
4. **Activer HTTPS** (Let's Encrypt, inclus chez tous les hébergeurs) : sans lui, le
   mot de passe circule en clair sur le réseau.

### Sécurité — ce qui est en place

- Mot de passe haché avec `password_hash()` (bcrypt), jamais stocké en clair.
- Le changement de mot de passe exige toujours le mot de passe actuel, et le nouveau
  doit différer de l'ancien.
- Session par cookie `HttpOnly`, `SameSite=Lax`, `Secure` dès que le site est en HTTPS ;
  identifiant de session régénéré à la connexion (anti-fixation).
- Jeton anti-CSRF exigé sur toute action qui modifie quelque chose.
- Cinq tentatives de connexion échouées par quart d'heure et par adresse IP.
- Message d'erreur identique pour un e-mail inconnu et un mot de passe faux : rien ne
  permet de deviner quelles adresses existent.
- `admin/compte.php` et `admin/tentatives.php` sont des fichiers PHP : demandés par un
  navigateur, ils ne renvoient rien, sur Apache comme sur nginx. Un `.htaccess` en
  interdit l'accès en plus.
- Le contenu saisi est réaffiché avec `textContent` : du HTML tapé dans la console
  s'affiche comme du texte et ne peut pas exécuter de code sur le site.
- Écritures atomiques (fichier temporaire puis renommage) : jamais de fichier tronqué,
  même si le serveur coupe au mauvais moment.
- Photos systématiquement ré-encodées côté serveur, nom de fichier engendré, exécution
  de code interdite dans `img/photos/`, et dépôt refusé sur un emplacement déjà occupé.

### Revendre le site

Le site est autonome et transférable : un dossier de fichiers, aucun abonnement,
aucune clé d'API, aucun compte de développeur.

1. Copier le dossier **sans** `admin/compte.php` ni `admin/tentatives.php` (ils sont
   exclus par `.gitignore`, et propres à chaque installation). `admin/compte-initial.php`
   fait partie de la livraison : c'est lui qui porte le compte de départ.
2. L'acheteur envoie le dossier sur son hébergement et ouvre `/admin/`.
3. Il se connecte avec les identifiants livrés, puis change mot de passe et adresse
   depuis l'onglet **Mon compte**.
4. Il est ensuite seul détenteur de ses accès. Vous n'avez rien à conserver.

Le pied de page du site porte votre adresse de contact
(`sanctimaps@gmail.com`) : elle se modifie dans les six fichiers `.html`,
paragraphe `footer-createur`.

Pensez à adapter le contenu (`js/donnees.js`), les mentions légales et le fichier
`CNAME.a-activer` s'il change de domaine.

## Modifier le site à la main

La console couvre les cas courants. Pour le reste, tout le contenu éditable vit dans
`js/donnees.js` — un objet JavaScript que vous pouvez modifier directement (attention
aux virgules : une erreur de syntaxe et le contenu ne s'affiche plus).

### Le formulaire de contact

Le message part vraiment : le formulaire envoie en POST à `contact.php`, qui expédie
le courriel au bar. Aucun service tiers, aucun compte à créer.

**L'adresse du bar n'apparaît nulle part dans les pages publiques.** Une adresse écrite
dans un fichier servi au public est moissonnée par les robots à spam en quelques jours ;
celle-ci vit dans `admin/destinataire.php`, lu côté serveur uniquement. Les pages ne
publient que le fait qu'un formulaire est configuré (`reglages.formulaire`). On la
change depuis `/admin/` → Réglages, comme n'importe quel autre réglage.

Protections en place :

| Contre | Comment |
| --- | --- |
| Robots à spam | Champ-piège masqué, hors du parcours clavier — et refus de tout envoi arrivé en moins de trois secondes. Dans les deux cas la réponse reste positive, pour ne pas renseigner l'automate |
| Injection d'en-tête | Les retours à la ligne sont refusés dans le nom, le sujet, l'e-mail et le téléphone : c'est ainsi qu'on ajoute des destinataires cachés |
| Envois en rafale | Cinq messages par heure et par adresse IP |
| Données falsifiées | Toute la validation est refaite côté serveur, jamais seulement dans le navigateur |
| Rejet par le destinataire | `From` sur le domaine du site et `Reply-To` sur le visiteur : un `From` au nom du visiteur est rejeté par SPF et DMARC |

**Rien ne se perd.** Chaque message est écrit dans `admin/messages.php` *avant* la
tentative d'envoi. Si l'hébergeur refuse d'expédier, le visiteur en est informé (au lieu
d'être invité à recommencer dans le vide) et le message reste lisible sur le serveur.

Si l'hébergeur refuse les envois, créez chez lui une vraie adresse (`contact@votre-domaine`)
et inscrivez-la dans le champ `expediteur` de `admin/destinataire.php`.

Sans PHP (hébergement statique, GitHub Pages), `contact.php` n'est pas exécuté : le
formulaire retombe alors sur le téléphone plutôt que de faire semblant d'envoyer.

### Les horaires — un seul endroit

L'objet `SCHEDULE` en haut de `js/main.js` (0 = dimanche … 6 = samedi, en minutes
depuis minuit, `null` = fermé) :

```js
var SCHEDULE = {
  0: null,                                  // dimanche : fermé
  1: { open: 7 * 60, close: 20 * 60 },      // lundi 7 h → 20 h
  6: { open: 8 * 60 + 30, close: 20 * 60 }  // samedi 8 h 30 → 20 h
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

### Les photos

**Six emplacements**, partout où le site affiche une illustration au trait :

| Emplacement | Où |
| --- | --- |
| La devanture | Accueil, grande image |
| Le café du matin | Page « Le bar », section *L'esprit de la maison* |
| Le comptoir · La terrasse · Tabac & FDJ · Le demi | Page « Le bar », galerie |

Tant qu'un emplacement est vide, le dessin reste affiché avec un bouton
**Ajouter une photo**.

Le dépôt se fait depuis le site lui-même, sans passer par la console : le bouton
demande le mot de passe de l'administration, puis ouvre la photothèque de l'appareil
(téléphone ou ordinateur). Une fois la photo en place, le bouton disparaît — cet
emplacement est occupé et le serveur refuse de l'écraser.

Une photo de devanture ou d'ambiance est recadrée en carré comme les autres : cadrez
large, le centre est conservé.

Pour changer une photo : onglet **Photos** de la console → *Retirer la photo*.
L'emplacement redevient libre et le bouton réapparaît sur le site.

Ce que le serveur fait de la photo reçue : il la décode, la recadre en carré, la
redimensionne à 1200 px maximum et la **ré-encode en JPEG**. Un fichier qui n'est pas
une vraie image échoue au décodage ; le ré-encodage supprime au passage tout ce qui
pourrait être dissimulé dans les métadonnées. Le nom du fichier est engendré par le
serveur, jamais repris de l'envoi. Formats acceptés : JPEG, PNG, WebP, 8 Mo maximum.

Les photos atterrissent dans `img/photos/`, dossier où un `.htaccess` interdit
l'exécution de code.

> **Droits d'usage :** n'y déposez que des photos dont vous détenez les droits — les
> vôtres, ou celles fournies par le bar. Les images des fiches Google Maps ou des pages
> Facebook appartiennent à ceux qui les ont prises et ne peuvent pas être reprises.

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

## Référencement

### Ce qui est en place dans le site

- **Titres et descriptions** propres à chaque page, construits autour des recherches
  visées : *bar à Rouen*, *bar centre-ville Rouen*, *bar avec terrasse Rouen*,
  *bar convivial Rouen*. Tous sous les limites d'affichage de Google (65 et 160
  caractères).
- **Données structurées** `BarOrPub` sur l'accueil : adresse, téléphone, horaires
  (samedi séparé), zone desservie, lien vers la carte, équipements (terrasse, tabac,
  Française des Jeux), profil Facebook. `BreadcrumbList` sur les cinq autres pages.
- **`sitemap.xml`** et **`robots.txt`** (qui exclut `/admin/` de l'indexation).
- **URL canoniques** sur chaque page, **Open Graph** et **Twitter Card** complets avec
  une image de partage (`img/partage.jpg`) : un lien collé sur Facebook ou WhatsApp
  affiche une vignette propre plutôt qu'un carré vide.
- **Contenu local** : quartier Vieux-Marché – Cathédrale, rue Jeanne d'Arc,
  Gros-Horloge, métro Palais de Justice et Théâtre des Arts, parkings — écrits dans des
  phrases normales, pas en liste de mots-clés.
- **Titres `<h1>` porteurs d'intention** sur les pages secondaires (« Un bar avec
  terrasse au centre-ville de Rouen », « Horaires et accès — 14 rue des Bons-Enfants,
  Rouen ») plutôt que des étiquettes de menu.
- **Maillage interne** : chaque page renvoie en toutes lettres vers les deux ou trois
  autres qui l'intéressent (carte ↔ terrasse ↔ horaires ↔ contact), en plus du menu et
  du pied de page.
- **Alternatives textuelles** des photos déposées : la légende est complétée
  automatiquement par « Le P'tit Ravisé, bar-tabac au 14 rue des Bons-Enfants à Rouen »
  (voir `remplirEmplacement()` dans `js/main.js`).
- **Version anglaise** dans `en/`, reliée au français par des balises `hreflang`
  réciproques et déclarée dans le `sitemap.xml` : utile pour les touristes qui cherchent
  *bar in Rouen* ou *pub Rouen city centre*, sans créer de contenu dupliqué.
- Site rapide, responsive, sans dépendance : trois critères que Google mesure vraiment.

### Performance mesurée

Mesures faites dans Chromium, en émulation téléphone (390 × 844, processeur
quatre fois plus lent), sur les six pages :

| Mesure | Valeur |
| --- | --- |
| Premier affichage (FCP) | 128 – 172 ms |
| Plus grand élément (LCP) | 152 – 780 ms |
| Décalage visuel cumulé (CLS) | **0,000** sur les six pages |
| Poids transféré | 8 – 53 Ko |
| Requêtes | 4 à 6 |

Un point corrigé au passage : la feuille de styles Google Fonts était **bloquante**.
Tant qu'elle n'était pas reçue, la page restait blanche — dans un test où le domaine
`fonts.googleapis.com` était injoignable, le premier affichage tombait à **12,7 s**.
Elle est désormais chargée en `media="print"` puis basculée en `all` au chargement
(avec repli `<noscript>`) : le même test donne **152 ms**. Les polices de repli
(Georgia, system-ui) sont déclarées dans `css/style.css`, l'affichage reste correct
si Google Fonts ne répond jamais.

### Ce qui ne se joue pas ici : le pack local et Google Maps

**Apparaître dans les trois résultats avec la carte, quand quelqu'un cherche « bar à
Rouen », ne dépend quasiment pas du site.** Cela dépend de la **fiche d'établissement
Google** (Google Business Profile). Le site n'y contribue qu'indirectement, en
confirmant les informations de la fiche.

La fiche existe déjà — 4,6/5, une cinquantaine d'avis. Par ordre d'impact :

1. **Revendiquer la fiche** si ce n'est pas fait (« Vous êtes propriétaire ? »), avec
   vérification par courrier ou téléphone.
2. **Catégorie principale : « Bar »**. C'est le levier le plus fort pour « bar à
   Rouen ». Si la catégorie principale est « Bureau de tabac », la fiche ne sortira
   pratiquement jamais sur cette recherche. Mettre *Bar-tabac*, *Bureau de tabac* et
   *Café* en catégories secondaires.
3. **Nom, adresse, téléphone strictement identiques** partout : fiche Google, site,
   Facebook, annuaires. L'orthographe retenue est **« Le P'tit Ravisé »**, celle de la
   fiche Google et de Facebook ; le site l'applique désormais partout, et les données
   structurées déclarent « Le Petit Ravisé » en `alternateName` pour que Google
   rapproche les deux graphies. Reste à corriger les annuaires qui écrivent encore la
   forme longue (PagesJaunes, Petit Futé, bureau-de-tabac.fr…) : chaque variante
   affaiblit le signal.
4. **Horaires complets** sur la fiche, samedi 8 h 30 inclus, plus les horaires
   exceptionnels (jours fériés) — Google valorise les fiches tenues à jour.
5. **Attributs** : terrasse, accessibilité, moyens de paiement, Wi-Fi le cas échéant.
   L'attribut *terrasse* aide directement sur « bar avec terrasse Rouen ».
6. **Photos régulières** : la fiche progresse avec des photos récentes. Les mêmes
   peuvent être déposées sur le site depuis les boutons de la page « Le bar ».
7. **Avis** : en demander aux habitués, et **répondre à tous**, y compris aux négatifs.
   Le taux de réponse est un signal mesuré.
8. **Lien du site sur la fiche**, pointant vers l'accueil.
9. **Publications Google** (Google Posts) pour les événements : gratuit, visible dans
   la fiche.

### Après la mise en ligne

1. Déclarer le site dans **Google Search Console**, y soumettre `sitemap.xml`.
2. Faire de même dans **Bing Webmaster Tools** (Bing alimente aussi certains
   assistants).
3. Vérifier les annuaires existants : PagesJaunes, Petit Futé, TripAdvisor, acceslibre,
   et y harmoniser l'orthographe du nom.
4. **Le site `le-ptit-ravise.eatbu.com`** porte le même nom et la même adresse. Quel que
   soit son auteur, deux sites pour un même établissement se concurrencent sur les mêmes
   recherches et divisent les signaux. Pour que celui-ci prenne la place, il faut que
   **la fiche Google pointe vers lui** (champ « Site Web ») ; sans cela l'autre restera
   devant, indépendamment de sa qualité. Idéalement, l'ancien est fermé ou redirigé.
5. Contrôler le rendu des données structurées avec le *Test des résultats enrichis* de
   Google.

### Ce qu'il ne faut pas faire

Répéter « bar Rouen » dans le texte n'améliore rien et peut nuire. Les recherches
« bar près de moi » se gagnent par la proximité et la fiche Google, jamais par une
phrase sur la page.

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
