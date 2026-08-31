#!/usr/bin/env php
<?php
/**
 * Crée le compte administrateur avec un mot de passe choisi.
 *
 * Plus sûr que le mot de passe livré dans admin/compte-initial.php, qui est
 * public : ici, chaque installation reçoit le sien.
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
    . "// Modifiable ensuite depuis l'onglet « Mon compte » de la console.\n"
    . "return " . var_export([
        'email'       => $email,
        'hash'        => password_hash($motDePasse, PASSWORD_DEFAULT),
        'doitChanger' => false,
        'cree'        => date('c'),
    ], true) . ";\n";

if (!ecrire_atomique(chemin_compte(), $contenu)) {
    fwrite(STDERR, "Écriture impossible dans admin/compte.php\n");
    exit(1);
}

echo "Compte créé pour {$email}.\n";
echo "Mot de passe : {$motDePasse}\n";
echo "Modifiable depuis l'onglet « Mon compte » de la console.\n";
