"""Routes API pour les projets."""

import uuid
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import aiosqlite

from app.core.database import DB_PATH

router = APIRouter()


class ProjectCreate(BaseModel):
    nom: str
    description: Optional[str] = ""
    date_echeance: Optional[str] = None


class TaskCreate(BaseModel):
    titre: str
    description: Optional[str] = ""
    colonne: Optional[str] = "a_faire"
    priorite: Optional[str] = "moyenne"


class TaskMove(BaseModel):
    colonne: str


@router.get("/")
async def get_projects():
    """Liste les projets."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM projects ORDER BY created_at DESC")
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


@router.post("/")
async def create_project(project: ProjectCreate):
    """Cree un projet."""
    project_id = f"proj_{uuid.uuid4().hex[:8]}"
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO projects (id, nom, description, date_echeance) VALUES (?, ?, ?, ?)",
            (project_id, project.nom, project.description, project.date_echeance),
        )
        await db.commit()
    return {"id": project_id}


@router.get("/{project_id}/tasks")
async def get_tasks(project_id: str):
    """Liste les taches d'un projet."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC",
            (project_id,),
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


@router.post("/{project_id}/tasks")
async def create_task(project_id: str, task: TaskCreate):
    """Cree une tache."""
    task_id = f"task_{uuid.uuid4().hex[:8]}"
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT INTO tasks (id, project_id, titre, description, colonne, priorite)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (task_id, project_id, task.titre, task.description, task.colonne, task.priorite),
        )
        await db.commit()
    return {"id": task_id}


@router.put("/tasks/{task_id}/move")
async def move_task(task_id: str, move: TaskMove):
    """Deplace une tache vers une autre colonne."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE tasks SET colonne = ? WHERE id = ?",
            (move.colonne, task_id),
        )
        await db.commit()
    return {"status": "moved"}
