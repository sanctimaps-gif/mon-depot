<?php
/**
 * Le Petit Ravisé — état de la session.
 *
 * Les pages publiques sont des fichiers statiques : elles ne savent pas si
 * une session d'administration est ouverte. Ce point d'entrée le leur dit,
 * afin de n'afficher les commandes de modification qu'aux personnes
 * connectées.
 *
 * Il ne révèle rien d'autre que l'état du cookie déjà détenu par celui qui
 * pose la question.
 */

declare(strict_types=1);

require __DIR__ . '/lib.php';

header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

reponse_json(['connecte' => est_connecte()]);
