/* =========================================================
   Le Petit Ravisé — agenda du bar
   ---------------------------------------------------------
   Un seul endroit à modifier pour publier une date. Les
   événements passés disparaissent tout seuls ; quand la liste
   est vide, la page affiche « Aucune date annoncée ».

   Format d'une entrée :
     {
       date: "2026-09-12",     // AAAA-MM-JJ (obligatoire)
       titre: "…",             // (obligatoire)
       description: "…",       // facultatif
       heure: "20 h 00",       // facultatif
       prix: "Entrée libre"    // facultatif
     }

   Exemple à copier-coller, puis à décommenter :

     {
       date: "2026-09-12",
       titre: "Retransmission — Rouen / Le Havre",
       description: "Match diffusé sur l'écran de la salle.",
       heure: "21 h 00",
       prix: "Entrée libre"
     }

   NOTE : cette liste est volontairement vide. Aucune date n'a
   été inventée — remplissez-la avec les vraies soirées du bar.
   ========================================================= */

window.EVENEMENTS = [];
