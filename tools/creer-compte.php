#!/usr/bin/env php
<?php
/**
 * Crée le compte administrateur avec un mot de passe provisoire choisi.
 *
 * Plus sûr que le mot de passe livré dans admin/compte-initial.php, qui est
 * public : ici, chaque installation reçoit le sien. Le changement reste imposé
 * à la première connexion.
 *
 * Usage :
 *     php tools/creer-compte.php client@exemple.fr "mot de passe provisoire"
 */

declare(strict_types=1);

require dirname(__DIR__) . '/admin/lib.php';

$email = $argv[1] ?? '';
$motDePasse = $argv[2] ?? '';

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($motDePasse) < 10) {
    fwrite(STDERR, "Usage : php tools/creer-compte.php <email valide> <mot de passe de 10 caractères minimum>\n");
    exit(1);
}

$contenu = "<?php\n"
    . "// Compte administrateur — fichier généré, propre à cette installation.\n"
    . "// Le changement de mot de passe est imposé à la première connexion.\n"
    . "return " . var_export([
        'email'       => $email,
        'hash'        => password_hash($motDePasse, PASSWORD_DEFAULT),
        'doitChanger' => true,
        'cree'        => date('c'),
    ], true) . ";\n";

if (!ecrire_atomique(chemin_compte(), $contenu)) {
    fwrite(STDERR, "Écriture impossible dans admin/compte.php\n");
    exit(1);
}

echo "Compte créé pour {$email}.\n";
echo "Mot de passe provisoire : {$motDePasse}\n";
echo "Il devra être changé à la première connexion.\n";
