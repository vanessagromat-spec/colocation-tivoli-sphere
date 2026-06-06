"""Routes API pour le CRM."""

import uuid
from datetime import datetime
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import aiosqlite

from app.core.database import DB_PATH

router = APIRouter()


class ContactCreate(BaseModel):
    nom: str
    prenom: str
    email: Optional[str] = ""
    telephone: Optional[str] = ""
    statut: Optional[str] = "prospect"
    notes: Optional[str] = ""


class ContactUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    statut: Optional[str] = None
    notes: Optional[str] = None


@router.get("/contacts")
async def get_contacts():
    """Liste tous les contacts."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM contacts ORDER BY created_at DESC")
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


@router.post("/contacts")
async def create_contact(contact: ContactCreate):
    """Cree un contact."""
    contact_id = f"contact_{uuid.uuid4().hex[:8]}"
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT INTO contacts (id, nom, prenom, email, telephone, statut, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (contact_id, contact.nom, contact.prenom, contact.email,
             contact.telephone, contact.statut, contact.notes),
        )
        await db.commit()
    return {"id": contact_id}


@router.put("/contacts/{contact_id}")
async def update_contact(contact_id: str, contact: ContactUpdate):
    """Met a jour un contact."""
    updates = {k: v for k, v in contact.dict().items() if v is not None}
    if updates:
        set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
        values = list(updates.values()) + [contact_id]
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(f"UPDATE contacts SET {set_clause} WHERE id = ?", values)
            await db.commit()
    return {"status": "updated"}


@router.delete("/contacts/{contact_id}")
async def delete_contact(contact_id: str):
    """Supprime un contact."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM contacts WHERE id = ?", (contact_id,))
        await db.commit()
    return {"status": "deleted"}


@router.get("/contacts/search")
async def search_contacts(q: str):
    """Recherche des contacts."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """SELECT * FROM contacts 
               WHERE nom LIKE ? OR prenom LIKE ? OR email LIKE ?
               ORDER BY nom""",
            (f"%{q}%", f"%{q}%", f"%{q}%"),
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
