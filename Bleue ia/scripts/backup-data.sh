#!/bin/bash
# ============================================================
# Script de sauvegarde des donnees de l'Agent IA
# Usage: ./backup-data.sh [repertoire_destination]
# Exemple: ./backup-data.sh /mnt/sauvegardes
# ============================================================

set -e

BACKUP_DIR=${1:-"./backups"}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="agent_backup_${TIMESTAMP}"
RETENTION_DAYS=30

echo "=========================================="
echo "  Sauvegarde de l'Agent IA"
echo "  Date: $(date)"
echo "=========================================="

mkdir -p "$BACKUP_DIR"

# --- Sauvegarde de la base de donnees ---
echo "[1/3] Sauvegarde de la base de donnees..."

if docker ps | grep -q "agent-backend"; then
    docker exec agent-backend sqlite3 /app/data/agent.db ".backup /app/data/agent_backup.db"
    docker cp agent-backend:/app/data/agent_backup.db "$BACKUP_DIR/${BACKUP_NAME}_database.db"
    docker exec agent-backend rm /app/data/agent_backup.db
    echo "  Base de donnees sauvegardee"
else
    echo "  Conteneur backend non trouve, tentative copie directe..."
    if [ -f "backend/data/agent.db" ]; then
        cp backend/data/agent.db "$BACKUP_DIR/${BACKUP_NAME}_database.db"
        echo "  Base de donnees sauvegardee (copie directe)"
    else
        echo "  AVERTISSEMENT: Base de donnees non trouvee"
    fi
fi

# --- Sauvegarde des documents ---
echo "[2/3] Sauvegarde des documents..."

if docker ps | grep -q "agent-backend"; then
    docker cp agent-backend:/app/data/documents "$BACKUP_DIR/${BACKUP_NAME}_documents" 2>/dev/null || echo "  Aucun document a sauvegarder"
else
    if [ -d "backend/data/documents" ]; then
        cp -r backend/data/documents "$BACKUP_DIR/${BACKUP_NAME}_documents"
        echo "  Documents sauvegardes"
    fi
fi

# --- Sauvegarde de la configuration ---
echo "[3/3] Sauvegarde de la configuration..."

cp .env "$BACKUP_DIR/${BACKUP_NAME}_config.env" 2>/dev/null || echo "  Pas de fichier .env"

# Resume
echo ""
echo "=========================================="
echo "  Sauvegarde terminee"
echo "=========================================="
echo ""
echo "Fichiers crees dans: $BACKUP_DIR/"
echo ""
ls -lh "$BACKUP_DIR/${BACKUP_NAME}_"* 2>/dev/null || echo "  Aucun fichier"
echo ""

# Nettoyage des vieilles sauvegardes
echo "Nettoyage des sauvegardes de plus de $RETENTION_DAYS jours..."
find "$BACKUP_DIR" -name "agent_backup_*" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null
echo "Termine."

# Option: compression
echo ""
read -p "Compresser la sauvegarde ? (o/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]; then
    cd "$BACKUP_DIR"
    tar -czf "${BACKUP_NAME}.tar.gz" ${BACKUP_NAME}_*
    rm -f ${BACKUP_NAME}_*
    echo "Sauvegarde compressee: ${BACKUP_NAME}.tar.gz"
fi
