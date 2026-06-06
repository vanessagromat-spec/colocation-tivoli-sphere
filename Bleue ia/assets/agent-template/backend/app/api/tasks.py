"""Routes API pour les taches autonomes."""

import uuid
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import aiosqlite

from app.core.database import DB_PATH
from app.core.llm import ollama_client

router = APIRouter()


class TaskCreateRequest(BaseModel):
    name: str
    type: str
    params: Dict[str, Any]
    schedule: Optional[str] = None


# Stockage en memoire pour les taches en cours
tasks_store = {}


@router.post("/create")
async def create_task(request: TaskCreateRequest):
    """Cree une nouvelle tache autonome."""
    task_id = f"task_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
    
    task = {
        "id": task_id,
        "name": request.name,
        "type": request.type,
        "status": "pending",
        "params": request.params,
        "result": None,
        "created_at": datetime.now().isoformat(),
    }
    
    tasks_store[task_id] = task
    
    # Sauvegarder en base
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO autonomous_tasks (id, name, type, status, params) VALUES (?, ?, ?, ?, ?)",
            (task_id, request.name, request.type, "pending", json.dumps(request.params)),
        )
        await db.commit()
    
    # Executer la tache en arriere-plan (simplifie)
    import asyncio
    asyncio.create_task(_execute_task(task_id, request))
    
    return {"id": task_id, "status": "created"}


async def _execute_task(task_id: str, request: TaskCreateRequest):
    """Execute une tache de maniere asynchrone."""
    tasks_store[task_id]["status"] = "running"
    
    try:
        # Construire le prompt selon le type de tache
        prompt = _build_task_prompt(request)
        
        result = await ollama_client.generate(
            prompt=prompt,
            system="Tu es un assistant specialise dans l'execution de taches professionnelles.",
        )
        
        tasks_store[task_id]["status"] = "completed"
        tasks_store[task_id]["result"] = result
        
        # Mettre a jour la base
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(
                "UPDATE autonomous_tasks SET status = ?, result = ?, completed_at = ? WHERE id = ?",
                ("completed", result, datetime.now().isoformat(), task_id),
            )
            await db.commit()
    
    except Exception as e:
        tasks_store[task_id]["status"] = "failed"
        tasks_store[task_id]["result"] = str(e)


def _build_task_prompt(request: TaskCreateRequest) -> str:
    """Construit le prompt selon le type de tache."""
    params = request.params
    
    prompts = {
        "web_search": f"Effectue une recherche detaillee sur: {params.get('prompt', '')}",
        "file_processing": f"Analyse le contenu suivant et fournis un resume structure: {params.get('prompt', '')}",
        "email_generation": f"Redige un email professionnel: {params.get('prompt', '')}",
        "data_analysis": f"Analyse les donnees suivantes: {params.get('prompt', '')}",
        "code_generation": f"Ecris du code: {params.get('prompt', '')}",
    }
    
    return prompts.get(request.type, params.get('prompt', 'Executer la tache demandee.'))


@router.get("/list")
async def list_tasks():
    """Liste les taches."""
    return list(tasks_store.values())


@router.get("/{task_id}/status")
async def get_task_status(task_id: str):
    """Recupere le statut d'une tache."""
    task = tasks_store.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Tache non trouvee")
    return task


@router.post("/{task_id}/cancel")
async def cancel_task(task_id: str):
    """Annule une tache."""
    if task_id in tasks_store:
        tasks_store[task_id]["status"] = "cancelled"
    return {"status": "cancelled"}
