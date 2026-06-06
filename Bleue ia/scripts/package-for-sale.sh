#!/bin/bash
# ============================================================
# Script de packaging pour distribution commerciale
# Usage: ./package-for-sale.sh [nom-du-produit] [version]
# Exemple: ./package-for-sale.sh "AgentPro" "1.0.0"
# ============================================================

set -e

PRODUCT_NAME=${1:-"AgentIA-Pro"}
VERSION=${2:-"1.0.0"}
BUILD_DIR="build"
OUTPUT_DIR="dist"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="${PRODUCT_NAME// /-}_${VERSION}_${TIMESTAMP}"

echo "=========================================="
echo "  Packaging pour distribution"
echo "  Produit: $PRODUCT_NAME"
echo "  Version: $VERSION"
echo "=========================================="

# --- Nettoyage ---
echo "[1/8] Nettoyage..."
rm -rf "$BUILD_DIR" "$OUTPUT_DIR"
mkdir -p "$BUILD_DIR/$PACKAGE_NAME" "$OUTPUT_DIR"

# --- Copie des sources ---
echo "[2/8] Copie des sources..."
cp -r assets/agent-template/frontend "$BUILD_DIR/$PACKAGE_NAME/" 2>/dev/null || true
cp -r assets/agent-template/backend "$BUILD_DIR/$PACKAGE_NAME/" 2>/dev/null || true
cp assets/agent-template/docker-compose.yml "$BUILD_DIR/$PACKAGE_NAME/" 2>/dev/null || true
cp assets/agent-template/.env.example "$BUILD_DIR/$PACKAGE_NAME/" 2>/dev/null || true
cp references/api-reference.md "$BUILD_DIR/$PACKAGE_NAME/" 2>/dev/null || true
cp references/licensing-guide.md "$BUILD_DIR/$PACKAGE_NAME/" 2>/dev/null || true
cp references/ollama-models.md "$BUILD_DIR/$PACKAGE_NAME/" 2>/dev/null || true
cp scripts/setup-ollama.sh "$BUILD_DIR/$PACKAGE_NAME/" 2>/dev/null || true
cp scripts/backup-data.sh "$BUILD_DIR/$PACKAGE_NAME/" 2>/dev/null || true

# --- Generation de la licence ---
echo "[3/8] Generation de la licence..."
cat > "$BUILD_DIR/$PACKAGE_NAME/LICENCE.md" << LICFILE
# LICENCE D'UTILISATION

## $PRODUCT_NAME - Version $VERSION

Copyright (c) $(date +%Y) [VOTRE NOM/SOCIETE]

Tous droits reserves.

### 1. Objet
Cette licence accorde au Client un droit non-exclusif et non-transferable 
d'utiliser le logiciel "$PRODUCT_NAME" (ci-apres "le Logiciel").

### 2. Droits accordes
Le Client est autorise a :
- Installer et utiliser le Logiciel sur ses appareils
- Modifier le code source pour un usage interne
- Creer des sauvegardes de securite

### 3. Restrictions
Le Client ne peut pas :
- Revendre, louer ou sous-licencier le Logiciel
- Distribuer le Logiciel a des tiers sans autorisation
- Supprimer les mentions de propriete intellectuelle
- Utiliser le Logiciel pour des activites illegales

### 4. Composants tiers
Le Logiciel utilise des composants open-source soumis a leurs propres licences.
Ces composants restent la propriete de leurs auteurs respectifs.

### 5. Garantie
Le Logiciel est fourni "en l'etat" sans garantie explicite.

Pour toute question : [VOTRE EMAIL]
LICFILE

# --- Generation du guide d'installation ---
echo "[4/8] Generation du guide..."
cat > "$BUILD_DIR/$PACKAGE_NAME/GUIDE_INSTALLATION.md" << GUIDEFILE
# Guide d'installation - $PRODUCT_NAME v$VERSION

## Prerequis
- Docker 24+ et Docker Compose v2+
- 8GB RAM minimum (16GB recommande)
- 20GB d'espace disque

## Installation rapide

### 1. Decompresser
tar -xzf ${PACKAGE_NAME}.tar.gz
cd $PACKAGE_NAME

### 2. Configurer
cp .env.example .env
# Editer .env selon vos besoins

### 3. Lancer
docker-compose up --build -d

### 4. Acceder
- Application : http://localhost:3000
- API : http://localhost:8000
- Documentation : http://localhost:8000/docs

## Installation du modele IA (premiere fois)
./setup-ollama.sh mistral

## Support
Voir LICENCE.md pour les conditions d'utilisation.
GUIDEFILE

# --- Generation du .env.example ---
echo "[5/8] Generation de la configuration..."
cat > "$BUILD_DIR/$PACKAGE_NAME/.env.example" << ENVFILE
OLLAMA_MODEL=mistral
OLLAMA_HOST=http://ollama:11434
OLLAMA_TIMEOUT=120
APP_NAME=Agent IA Pro
APP_ENV=production
APP_PORT=8000
FRONTEND_PORT=3000
DATABASE_PATH=/app/data/agent.db
TASKS_ENABLED=true
MAX_CONCURRENT_TASKS=3
MODULE_CRM=true
MODULE_PROJECTS=true
MODULE_DOCUMENTS=true
LOG_LEVEL=INFO
ENVFILE

# --- Creation du docker-compose si absent ---
echo "[6/8] Verification Docker Compose..."
if [ ! -f "$BUILD_DIR/$PACKAGE_NAME/docker-compose.yml" ]; then
cat > "$BUILD_DIR/$PACKAGE_NAME/docker-compose.yml" << DCFILE
version: '3.8'
services:
  ollama:
    image: ollama/ollama:latest
    container_name: agent-ollama
    volumes:
      - ollama_models:/root/.ollama
    ports:
      - "11434:11434"
    environment:
      - OLLAMA_ORIGINS=*
    restart: unless-stopped
  backend:
    build: ./backend
    container_name: agent-backend
    volumes:
      - agent_data:/app/data
    ports:
      - "8000:8000"
    environment:
      - OLLAMA_HOST=http://ollama:11434
      - DATABASE_PATH=/app/data/agent.db
    depends_on:
      - ollama
    restart: unless-stopped
  frontend:
    build: ./frontend
    container_name: agent-frontend
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://localhost:8000/api/v1
    depends_on:
      - backend
    restart: unless-stopped
volumes:
  ollama_models:
  agent_data:
DCFILE
fi

# --- Nettoyage ---
echo "[7/8] Nettoyage des fichiers inutiles..."
find "$BUILD_DIR/$PACKAGE_NAME" -type d \( \
    -name "node_modules" -o -name "__pycache__" -o -name ".git" \
    -o -name "dist" -o -name "build" -o -name ".vite" \
\) -exec rm -rf {} + 2>/dev/null || true
find "$BUILD_DIR/$PACKAGE_NAME" -type f \( \
    -name "*.pyc" -o -name ".DS_Store" -o -name ".env" \
\) -delete 2>/dev/null || true

# --- Creation de l'archive ---
echo "[8/8] Creation de l'archive..."
cd "$BUILD_DIR"
tar -czf "../$OUTPUT_DIR/${PACKAGE_NAME}.tar.gz" "$PACKAGE_NAME"
cd - > /dev/null

echo ""
echo "=========================================="
echo "  Packaging termine !"
echo "=========================================="
echo ""
echo "Fichier: $OUTPUT_DIR/${PACKAGE_NAME}.tar.gz"
echo "Taille: $(du -h "$OUTPUT_DIR/${PACKAGE_NAME}.tar.gz" 2>/dev/null | cut -f1 || echo 'inconnue')"
echo ""
echo "Prochaines etapes:"
echo "  1. Personnaliser LICENCE.md avec vos informations"
echo "  2. Ajouter votre logo dans frontend/public/"
echo "  3. Tester: tar -xzf $OUTPUT_DIR/${PACKAGE_NAME}.tar.gz && docker-compose up"
