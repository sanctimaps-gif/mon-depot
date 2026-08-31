#!/usr/bin/env python3
"""Assemble un aperçu du site en UN SEUL fichier HTML autonome.

Le fichier produit (apercu-du-site.html) contient les six pages à la suite,
le CSS et le JS intégrés, et le QR code en data-URI. Il s'ouvre par un
simple double-clic, sans serveur, sans hébergement, sans connexion.

Il est reconstruit à partir des vraies pages : aucun risque de décalage
entre l'aperçu et le site. À relancer après chaque modification.

Usage :
    python3 tools/build-apercu.py

Dépendance : beautifulsoup4 (pip install beautifulsoup4)
"""

import base64
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
SORTIE = RACINE / "apercu-du-site.html"

# (identifiant d'ancre, fichier) — l'ordre est celui de la navigation.
PAGES = [
    ("accueil", "index.html"),
    ("carte", "carte.html"),
    ("le-bar", "le-bar.html"),
    ("evenements", "evenements.html"),
    ("infos", "infos.html"),
    ("contact", "contact.html"),
]

ANCRES = {fichier: "#page-" + slug for slug, fichier in PAGES}


def reecrire_liens(fragment):
    """Transforme les liens entre pages en ancres internes."""
    for lien in fragment.find_all("a", href=True):
        href = lien["href"]
        base, _, ancre_interne = href.partition("#")
        if base in ANCRES:
            # « carte.html#bieres » garde son ancre interne, qui existe
            # toujours dans le document fusionné.
            lien["href"] = "#" + ancre_interne if ancre_interne else ANCRES[base]
        # Les liens externes (http, tel:, mailto:) sont laissés intacts.


def main() -> int:
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        print("beautifulsoup4 est requis : pip install beautifulsoup4", file=sys.stderr)
        return 1

    def lire(nom):
        return BeautifulSoup((RACINE / nom).read_text(encoding="utf-8"), "html.parser")

    index = lire("index.html")

    # En-tête et pied de page : une seule fois, repris de l'accueil.
    entete = index.find("header", class_="site-header")
    pied = index.find("footer", class_="site-footer")
    reecrire_liens(entete)
    reecrire_liens(pied)
    for lien in entete.find_all(attrs={"aria-current": True}):
        del lien["aria-current"]

    corps = []
    for i, (slug, fichier) in enumerate(PAGES):
        page = lire(fichier)
        section = page.new_tag("section", id="page-" + slug)
        if i == 0:
            section["id"] = "page-accueil"

        tete = page.find("div", class_="page-head")
        principal = page.find("main")
        if principal is not None and principal.has_attr("id"):
            del principal["id"]          # « contenu » ne doit exister qu'une fois

        for bloc in (tete, principal):
            if bloc is not None:
                reecrire_liens(bloc)
                section.append(bloc.extract())
        corps.append(str(section))

    css = (RACINE / "css" / "style.css").read_text(encoding="utf-8")
    js = "\n".join(
        (RACINE / "js" / nom).read_text(encoding="utf-8")
        for nom in ("donnees.js", "main.js")
    )

    # QR code en data-URI pour que le fichier reste autonome.
    qr = (RACINE / "img" / "qr-carte.svg").read_bytes()
    qr_uri = "data:image/svg+xml;base64," + base64.b64encode(qr).decode("ascii")

    html = f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Le Petit Ravisé — aperçu du site</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>☕</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
{css}
/* Séparation visuelle entre les pages, propre à l'aperçu. */
section[id^="page-"] + section[id^="page-"] {{ border-top: 1px solid var(--line); }}
</style>
</head>
<body>
<a class="skip-link" href="#contenu">Aller au contenu principal</a>
{entete}
<main id="contenu">
{"".join(corps)}
</main>
{pied}
<script>
{js}
</script>
</body>
</html>
"""

    html = html.replace('src="img/qr-carte.svg"', f'src="{qr_uri}"')
    SORTIE.write_text(html, encoding="utf-8")
    taille = SORTIE.stat().st_size / 1024
    print(f"Aperçu écrit dans {SORTIE} ({taille:.0f} Ko, {len(PAGES)} pages)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
