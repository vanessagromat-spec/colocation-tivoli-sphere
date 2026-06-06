"""
Agent IA Proprietaire - Backend FastAPI
Point d'entree principal de l'application.
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import init_db
from app.api import chat, tasks, crm, projects, documents, system


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialisation et nettoyage de l'application."""
    await init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    description="Agent IA 100% local et open-source - Backend API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Taches"])
app.include_router(crm.router, prefix="/api/v1/crm", tags=["CRM"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["Projets"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["Documents"])
app.include_router(system.router, prefix="/api/v1", tags=["Systeme"])


@app.get("/health", tags=["Sante"])
async def health_check():
    """Point de controle de sante."""
    from app.core.llm import ollama_client
    ollama_ok = await ollama_client.health_check()
    return {
        "status": "healthy" if ollama_ok else "degraded",
        "ollama": ollama_ok,
        "model": settings.ollama_model,
    }
