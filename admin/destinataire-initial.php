<?php
/**
 * Destinataire du formulaire de contact, livré avec le site.
 *
 * Ce fichier est le réglage de départ. Dès qu'une adresse est enregistrée
 * depuis la console d'administration (onglet « Réglages »), le fichier
 * destinataire.php est écrit à côté et prend définitivement le relais :
 * celui-ci n'est alors plus lu.
 *
 * « expediteur » est l'adresse technique qui figure en « From ». La laisser
 * vide convient dans la plupart des cas : le site utilise alors
 * no-reply@<domaine du site>. Si l'hébergeur refuse d'expédier, y mettre
 * une adresse réellement créée chez lui (par exemple contact@votre-domaine).
 */

return [
    'email'      => 'marionbmb@icloud.com',
    'expediteur' => '',
];
