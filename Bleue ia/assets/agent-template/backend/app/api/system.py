"""Routes API systeme."""

import aiosqlite
from fastapi import APIRouter

from app.core.database import DB_PATH
from app.core.llm import ollama_client

router = APIRouter()


@router.get("/stats")
async def get_stats():
    """Statistiques de l'application."""
    stats = {
        "conversations": 0,
        "tasks": 0,
        "contacts": 0,
        "documents": 0,
    }
    
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            for table, key in [
                ("conversations", "conversations"),
                ("autonomous_tasks", "tasks"),
                ("contacts", "contacts"),
                ("documents", "documents"),
            ]:
                cursor = await db.execute(f"SELECT COUNT(*) FROM {table}")
                row = await cursor.fetchone()
                stats[key] = row[0] if row else 0
    except Exception:
        pass
    
    return stats


@router.get("/models/available")
async def list_models():
    """Liste les modeles IA disponibles."""
    return await ollama_client.list_models()


@router.get("/models/status")
async def get_model_status():
    """Statut du modele IA."""
    healthy = await ollama_client.health_check()
    return {"status": "online" if healthy else "offline", "healthy": healthy}
