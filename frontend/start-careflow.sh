#!/bin/bash

# ======================================================
# Script de démarrage CareFlow Sénégal
# ======================================================

echo "🏥 Démarrage de CareFlow Sénégal..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis le dossier frontend/"
    exit 1
fi

# Vérifier les variables d'environnement
echo "🔧 Vérification de la configuration..."

if [ ! -f ".env" ]; then
    echo "❌ Fichier .env manquant!"
    echo "💡 Créez le fichier .env avec:"
    echo "VITE_API_URL=http://localhost:5000/api"
    exit 1
fi

# Lire les variables d'environnement
source .env

echo "✅ Configuration trouvée:"
echo "   API URL: $VITE_API_URL"
echo "   Environment: $VITE_NODE_ENV"

# Vérifier si le backend est accessible
echo "🌐 Test de connectivité backend..."

BACKEND_URL=$(echo $VITE_API_URL | sed 's|/api||')
echo "   Backend URL: $BACKEND_URL"

if curl -s "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo "✅ Backend accessible"
elif curl -s "$BACKEND_URL/api/referentials/regions" > /dev/null 2>&1; then
    echo "✅ Backend accessible (via referentials)"
else
    echo "⚠️  Backend non accessible sur $BACKEND_URL"
    echo "💡 Assurez-vous que le backend est démarré:"
    echo "   cd ../backend && npm run dev"
    echo ""
    echo "🔄 Tentative de démarrage quand même..."
fi

# Vérifier les dépendances
echo "📦 Vérification des dépendances..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules manquant, installation..."
    npm install
fi

# Nettoyer le cache Vite si nécessaire
if [ -d ".vite" ]; then
    echo "🧹 Nettoyage du cache Vite..."
    rm -rf .vite
fi

# Vérifier le port
PORT=3000
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port $PORT déjà utilisé, tentative de libération..."
    # Tuer le processus si c'est un ancien Vite
    pkill -f "vite.*$PORT" || true
    sleep 2
fi

echo ""
echo "🚀 Démarrage du frontend CareFlow..."
echo "📱 Interface: http://localhost:$PORT"
echo "🔗 API Backend: $VITE_API_URL"
echo ""
echo "📋 Pour tester l'inscription:"
echo "   1. Ouvrez http://localhost:$PORT/register"
echo "   2. Remplissez le formulaire"
echo "   3. Vérifiez la console pour les logs"
echo ""

# Démarrer Vite
npm run dev