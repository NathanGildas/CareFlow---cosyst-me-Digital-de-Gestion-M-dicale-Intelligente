// verify-setup.js - Script de vérification complète
// Créez ce fichier dans le dossier frontend et exécutez : node verify-setup.js

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🔍 === VÉRIFICATION CONFIGURATION CAREFLOW ===\n');

// 1. Vérifier l'existence du fichier .env
console.log('📁 Vérification du fichier .env...');
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
    console.log('❌ Fichier .env MANQUANT !');
    console.log('🔧 Création automatique du fichier .env...');

    const envContent = `VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=CareFlow Sénégal
VITE_NODE_ENV=development
VITE_ENABLE_DEBUG=true
VITE_AUTH_TOKEN_KEY=careflow_access_token
VITE_DEFAULT_COUNTRY=SN
VITE_DEFAULT_CURRENCY=XOF
VITE_DEFAULT_LANGUAGE=fr
VITE_CONTACT_EMAIL=contact@careflow.sn
`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Fichier .env créé automatiquement !');
} else {
    console.log('✅ Fichier .env trouvé');
}

// 2. Lire et analyser le contenu
console.log('\n📋 Analyse du contenu .env...');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n').filter(line =>
    line.trim() && !line.startsWith('#')
);

const envVars = {};
envLines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
    }
});

console.log(`✅ ${Object.keys(envVars).length} variables trouvées`);

// 3. Vérifier les variables essentielles
console.log('\n🔑 Vérification des variables essentielles...');
const requiredVars = {
    'VITE_API_URL': 'URL de l\'API backend',
    'VITE_NODE_ENV': 'Environnement de développement',
    'VITE_AUTH_TOKEN_KEY': 'Clé de stockage des tokens'
};

let allRequiredPresent = true;
Object.entries(requiredVars).forEach(([key, description]) => {
    if (envVars[key]) {
        console.log(`✅ ${key}: ${envVars[key]}`);
    } else {
        console.log(`❌ ${key} MANQUANT (${description})`);
        allRequiredPresent = false;
    }
});

// 4. Vérifier la connectivité backend
console.log('\n🌐 Test de connectivité backend...');
const apiUrl = envVars['VITE_API_URL'] || 'http://localhost:5000/api';
const backendUrl = apiUrl.replace('/api', '');

function testBackend(url) {
    return new Promise((resolve) => {
        const parsedUrl = new URL(url + '/api/referentials/regions');

        const req = http.get({
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname,
            timeout: 5000
        }, (res) => {
            console.log(`✅ Backend accessible (Status: ${res.statusCode})`);
            resolve(true);
        });

        req.on('error', (err) => {
            console.log(`❌ Backend inaccessible: ${err.message}`);
            resolve(false);
        });

        req.on('timeout', () => {
            console.log('❌ Backend inaccessible: Timeout');
            req.destroy();
            resolve(false);
        });
    });
}

// 5. Vérifier la structure des dossiers
console.log('\n📂 Vérification de la structure du projet...');
const requiredFiles = [
    'package.json',
    'vite.config.ts',
    'src/App.tsx',
    'src/main.tsx',
    'src/index.css'
];

requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} MANQUANT`);
    }
});

// 6. Vérifier package.json
console.log('\n📦 Vérification des dépendances...');
if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = [
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
        'tailwindcss'
    ];

    const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
    };

    requiredDeps.forEach(dep => {
        if (allDeps[dep]) {
            console.log(`✅ ${dep}: ${allDeps[dep]}`);
        } else {
            console.log(`❌ ${dep} MANQUANT`);
        }
    });
}

// Fonction principale asynchrone
async function runVerification() {
    // Test du backend
    const backendOk = await testBackend(backendUrl);

    // 7. Résumé et recommandations
    console.log('\n📊 === RÉSUMÉ ===');
    console.log(`Fichier .env: ${fs.existsSync(envPath) ? '✅' : '❌'}`);
    console.log(`Variables requises: ${allRequiredPresent ? '✅' : '❌'}`);
    console.log(`Backend accessible: ${backendOk ? '✅' : '❌'}`);

    console.log('\n🎯 === PROCHAINES ÉTAPES ===');

    if (!backendOk) {
        console.log('1. ❗ URGENT : Démarrez le backend');
        console.log('   cd backend && npm run dev');
        console.log('');
    }

    console.log('2. Redémarrez le frontend :');
    console.log('   npm run dev');
    console.log('');

    console.log('3. Testez l\'inscription sur :');
    console.log('   http://localhost:3000/register');
    console.log('');

    if (backendOk && allRequiredPresent) {
        console.log('✅ CONFIGURATION COMPLÈTE ! L\'inscription devrait fonctionner.');
    } else {
        console.log('⚠️  Configuration incomplète. Suivez les étapes ci-dessus.');
    }

    // 8. Script de test pour le navigateur
    console.log('\n🧪 Script de test pour la console du navigateur :');
    console.log(`
// Copiez ce code dans la console (F12) pour tester :
(async function testCareFlow() {
  console.clear();
  console.log('🧪 Test CareFlow Frontend');
  
  try {
    const response = await fetch('/api/referentials/regions');
    console.log('✅ API Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Régions récupérées:', data.data?.length || 0);
      console.log('🎉 API FONCTIONNELLE ! L\\'inscription devrait marcher.');
    } else {
      console.log('❌ Erreur API:', response.statusText);
    }
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
    console.log('💡 Vérifiez que le backend est démarré');
  }
})();
`);
}

// Exécution
runVerification().catch(console.error);