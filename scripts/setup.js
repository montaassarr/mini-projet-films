// Installation et lancement du projet : npm run setup
// 1. Demande les clés (Firebase + TMDB) et génère src/environments/environment*.ts
// 2. Installe les dépendances (npm install) si besoin
// 3. Lance l'application dans le navigateur
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ENV_DIR = path.join(ROOT, 'src', 'environments');
const ENV_FILE = path.join(ENV_DIR, 'environment.ts');
const noStart = process.argv.includes('--no-start');

// Valeurs déjà configurées (pour pouvoir garder une clé en appuyant sur Entrée)
function lireConfigActuelle() {
  if (!fs.existsSync(ENV_FILE)) return {};
  const txt = fs.readFileSync(ENV_FILE, 'utf8');
  const val = (cle) => (txt.match(new RegExp(`${cle}:\\s*'([^']*)'`)) || [])[1];
  const config = {
    apiKey: val('apiKey'),
    databaseURL: val('databaseURL'),
    tmdbApiKey: val('tmdbApiKey'),
  };
  for (const cle in config) {
    if (!config[cle] || config[cle].startsWith('VOTRE') || config[cle].includes('VOTRE-PROJET')) delete config[cle];
  }
  return config;
}

function masquer(valeur) {
  return valeur.length > 8 ? valeur.slice(0, 4) + '…' + valeur.slice(-4) : '****';
}

function genererEnvironment(config, production) {
  return `export const environment = {
  production: ${production},
  // Fichier généré par "npm run setup" (non versionné : il contient les clés)
  firebase: {
    apiKey: '${config.apiKey}',
    databaseURL: '${config.databaseURL}',
  },
  tmdbApiKey: '${config.tmdbApiKey}',
};
`;
}

async function main() {
  // "npm start" vérifie d'abord que les clés sont configurées
  if (process.argv.includes('--check')) {
    if (!fs.existsSync(ENV_FILE)) {
      console.error('\n✘ Clés non configurées. Lancez d\'abord : npm run setup\n');
      process.exit(1);
    }
    return;
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const lignes = rl[Symbol.asyncIterator]();
  const demander = async (question) => {
    process.stdout.write(question);
    const { value } = await lignes.next();
    return (value ?? '').trim();
  };

  console.log('\n=== Mini-projet Films : configuration ===\n');
  const actuelle = lireConfigActuelle();

  const champs = [
    ['apiKey', 'Firebase apiKey (commence par AIza)'],
    ['databaseURL', 'Firebase Realtime Database URL (https://...)'],
    ['tmdbApiKey', 'Clé API TMDB (v3)'],
  ];
  const config = {};
  for (const [cle, libelle] of champs) {
    const defaut = actuelle[cle];
    const suffixe = defaut ? ` [Entrée = garder ${cle === 'databaseURL' ? defaut : masquer(defaut)}]` : '';
    let valeur = '';
    while (!valeur) {
      valeur = (await demander(`${libelle}${suffixe} : `)) || defaut || '';
      if (cle === 'databaseURL' && valeur && !valeur.startsWith('https://')) {
        console.log("  L'URL doit commencer par https://");
        valeur = '';
        continue;
      }
      if (!valeur) console.log('  Valeur obligatoire.');
    }
    config[cle] = valeur.replace(/\/+$/, '').replace(/'/g, '');
  }
  rl.close();

  fs.writeFileSync(ENV_FILE, genererEnvironment(config, false));
  fs.writeFileSync(path.join(ENV_DIR, 'environment.prod.ts'), genererEnvironment(config, true));
  console.log('\n✔ Clés enregistrées dans src/environments/\n');

  const npm = (args) => spawnSync('npm', args, { cwd: ROOT, stdio: 'inherit', shell: true });

  if (!fs.existsSync(path.join(ROOT, 'node_modules'))) {
    console.log('Installation des dépendances (npm install)...\n');
    if (npm(['install']).status !== 0) {
      console.error('\n✘ npm install a échoué.');
      process.exit(1);
    }
  }

  if (noStart) {
    console.log('Configuration terminée. Lancez : npm start');
    return;
  }
  console.log("Lancement de l'application sur http://localhost:4200 ...\n");
  npm(['start']);
}

main();
