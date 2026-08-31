#!/usr/bin/env python3
"""Génère le QR code de la carte (img/qr-carte.svg).

Usage :
    python3 tools/make-qr.py https://votre-domaine.fr/carte.html

Sans argument, l'URL d'exemple ci-dessous est utilisée — pensez à relancer
la commande avec l'adresse réelle une fois le site en ligne.

Dépendance : segno (pip install segno)
"""

import sys
from pathlib import Path

# Domaine du site (forme punycode : elle est comprise par tous les lecteurs
# de QR codes, là où « barlepetitravisé.com » en Unicode peut échouer).
URL_PAR_DEFAUT = "https://xn--barlepetitravis-pnb.com/carte.html"
SORTIE = Path(__file__).resolve().parent.parent / "img" / "qr-carte.svg"

# Vert de la charte, pour rester cohérent avec le reste du site.
COULEUR = "#1f4d3d"


def main() -> int:
    try:
        import segno
    except ImportError:
        print("segno est requis : pip install segno", file=sys.stderr)
        return 1

    url = sys.argv[1] if len(sys.argv) > 1 else URL_PAR_DEFAUT

    SORTIE.parent.mkdir(parents=True, exist_ok=True)
    # error="m" : le code reste lisible même un peu abîmé ou sali sur une table.
    segno.make(url, error="m").save(
        str(SORTIE), kind="svg", scale=8, border=2, dark=COULEUR, light="#ffffff"
    )
    print(f"QR code écrit dans {SORTIE} pour : {url}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
