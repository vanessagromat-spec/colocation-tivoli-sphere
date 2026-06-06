#!/bin/bash
# ============================================================
# Script d'installation automatique d'Ollama et des modeles IA
# Usage: ./setup-ollama.sh [modele] [version]
# Exemple: ./setup-ollama.sh mistral
#          ./setup-ollama.sh llama3.1 latest
# ============================================================

set -e

MODEL=${1:-"mistral"}
VERSION=${2:-"latest"}
OLLAMA_VERSION="0.3.0"

echo "=========================================="
echo "  Installation de l'Agent IA Local"
echo "  Modele: $MODEL:$VERSION"
echo "=========================================="

# --- Verification des prerequis ---
echo "[1/6] Verification des prerequis..."

if ! command -v curl &> /dev/null; then
    echo "Erreur: curl est requis. Installez-le avec: sudo apt-get install curl"
    exit 1
fi

# Detection OS
OS=""
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if command -v apt-get &> /dev/null; then
        OS="debian"
    elif command -v yum &> /dev/null; then
        OS="rhel"
    elif command -v pacman &> /dev/null; then
        OS="arch"
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
fi

# RAM disponible
RAM_GB=$(free -g 2>/dev/null | awk '/^Mem:/{print $2}' || echo "0")
echo "  OS detecte: $OS"
echo "  RAM disponible: ${RAM_GB}GB"

# Check RAM minimum
if [ "$RAM_GB" -lt 4 ]; then
    echo "AVERTISSEMENT: Moins de 4GB RAM detecte. Les performances seront limitees."
    echo "Modeles recommandes: llama3.2 (3B), phi3"
fi

# --- Installation d'Ollama ---
echo "[2/6] Installation d'Ollama..."

if command -v ollama &> /dev/null; then
    echo "  Ollama est deja installe: $(ollama --version)"
else
    echo "  Telechargement d'Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
    echo "  Ollama installe avec succes"
fi

# --- Demarrage du service ---
echo "[3/6] Demarrage du service Ollama..."

if ! pgrep -x "ollama" > /dev/null; then
    ollama serve &
    OLLAMA_PID=$!
    sleep 3
    echo "  Service Ollama demarre (PID: $OLLAMA_PID)"
else
    echo "  Service Ollama deja en cours d'execution"
fi

# Attendre que le service soit pret
for i in {1..30}; do
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "  Service Ollama pret"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo "Erreur: Le service Ollama n'a pas demarre"
        exit 1
    fi
done

# --- Telechargement du modele ---
echo "[4/6] Telechargement du modele $MODEL:$VERSION..."
echo "  (Cette operation peut prendre plusieurs minutes...)"

ollama pull "$MODEL:$VERSION" || {
    echo "Erreur: Impossible de telecharger le modele $MODEL:$VERSION"
    echo "Modeles disponibles: ollama list"
    exit 1
}

echo "  Modele telecharge avec succes"

# --- Test du modele ---
echo "[5/6] Test du modele..."

TEST_RESPONSE=$(ollama run "$MODEL:$VERSION" "Reponds uniquement: OK" 2>/dev/null || echo "")
if [[ "$TEST_RESPONSE" == *"OK"* ]] || [[ "$TEST_RESPONSE" == *"ok"* ]]; then
    echo "  Modele fonctionne correctement"
else
    echo "  AVERTISSEMENT: Le test du modele a retourne une reponse inattendue"
    echo "  Reponse: $TEST_RESPONSE"
fi

# --- Verification finale ---
echo "[6/6] Verification finale..."

echo ""
echo "=========================================="
echo "  Installation terminee avec succes !"
echo "=========================================="
echo ""
echo "Modele installe: $MODEL:$VERSION"
echo "Version Ollama: $(ollama --version 2>/dev/null || echo 'inconnue')"
echo ""
echo "Modeles disponibles:"
ollama list 2>/dev/null || echo "  (Aucun)"
echo ""
echo "Pour tester: ollama run $MODEL:$VERSION"
echo "Pour lancer l'agent: docker-compose up"
echo ""

# Afficher les modeles recommandes selon la RAM
if [ "$RAM_GB" -lt 8 ]; then
    echo "--- Modeles recommandes pour votre configuration (${RAM_GB}GB) ---"
    echo "  llama3.2 (3B)  - Tres rapide, bonne qualite"
    echo "  phi3 (4B)      - Performant"
    echo "  gemma2 (2B)    - Ultra-leger"
elif [ "$RAM_GB" -lt 16 ]; then
    echo "--- Modeles recommandes pour votre configuration (${RAM_GB}GB) ---"
    echo "  mistral (7B)   - Excellente qualite FR"
    echo "  llama3.1 (8B)  - Tres bonne qualite"
    echo "  gemma2 (9B)    - Haute qualite"
else
    echo "--- Vous pouvez utiliser tous les modeles ---"
    echo "  mixtral (47B)  - Qualite maximale"
    echo "  llama3.1 (70B) - Ultra-performant"
fi
