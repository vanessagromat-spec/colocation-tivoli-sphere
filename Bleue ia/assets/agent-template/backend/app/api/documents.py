"""Routes API pour les documents."""

import uuid
import os
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import aiosqlite

from app.core.database import DB_PATH
from app.core.llm import ollama_client

router = APIRouter()

UPLOAD_DIR = "/app/data/documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class AnalyzeRequest(BaseModel):
    type: str = "summary"


@router.get("/")
async def list_documents():
    """Liste les documents."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM documents ORDER BY upload_date DESC")
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload un document."""
    doc_id = f"doc_{uuid.uuid4().hex[:8]}"
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{file.filename}")
    
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO documents (id, nom, type, taille, chemin) VALUES (?, ?, ?, ?, ?)",
            (doc_id, file.filename, file.filename.split(".")[-1], len(content), file_path),
        )
        await db.commit()
    
    return {"id": doc_id, "filename": file.filename}


@router.post("/{doc_id}/analyze")
async def analyze_document(doc_id: str, request: AnalyzeRequest):
    """Analyse un document avec l'IA."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Document non trouve")
        
        doc = dict(row)
    
    # Lire le contenu du document
    try:
        with open(doc["chemin"], "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()[:8000]  # Limiter le contenu
    except Exception:
        content = f"Fichier binaire: {doc['nom']}"
    
    # Construire le prompt d'analyse
    analysis_prompts = {
        "summary": f"Resume le document suivant de maniere concise:\n\n{content}",
        "extract": f"Extrais les points cles du document:\n\n{content}",
        "qa": f"Sur base du document, reponds aux questions possibles:\n\n{content}",
        "translate": f"Traduis ce document en anglais:\n\n{content}",
    }
    
    prompt = analysis_prompts.get(request.type, analysis_prompts["summary"])
    
    try:
        result = await ollama_client.generate(
            prompt=prompt,
            system="Tu es un expert en analyse de documents.",
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Erreur analyse: {str(e)}")
    
    # Sauvegarder le resume
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE documents SET summary = ? WHERE id = ?",
            (result[:500], doc_id),
        )
        await db.commit()
    
    return {"result": result}


@router.delete("/{doc_id}")
async def delete_document(doc_id: str):
    """Supprime un document."""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT chemin FROM documents WHERE id = ?", (doc_id,))
        row = await cursor.fetchone()
        if row and row[0] and os.path.exists(row[0]):
            os.remove(row[0])
        await db.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
        await db.commit()
    return {"status": "deleted"}
