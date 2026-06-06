"""Base de donnees SQLite."""

import aiosqlite
import os
from datetime import datetime
from app.core.config import settings

DB_PATH = settings.database_path


def _ensure_dir():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)


async def init_db():
    """Initialise la base de donnees."""
    _ensure_dir()
    async with aiosqlite.connect(DB_PATH) as db:
        # Conversations
        await db.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                title TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Messages
        await db.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id TEXT,
                role TEXT CHECK(role IN ('user', 'assistant')),
                content TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id)
            )
        """)
        
        # Contacts CRM
        await db.execute("""
            CREATE TABLE IF NOT EXISTS contacts (
                id TEXT PRIMARY KEY,
                nom TEXT NOT NULL,
                prenom TEXT NOT NULL,
                email TEXT,
                telephone TEXT,
                statut TEXT DEFAULT 'prospect',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Projets
        await db.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                nom TEXT NOT NULL,
                description TEXT,
                statut TEXT DEFAULT 'actif',
                date_echeance TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Taches
        await db.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                project_id TEXT,
                titre TEXT NOT NULL,
                description TEXT,
                colonne TEXT DEFAULT 'a_faire',
                priorite TEXT DEFAULT 'moyenne',
                assigne_a TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Documents
        await db.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                nom TEXT NOT NULL,
                type TEXT,
                taille INTEGER,
                chemin TEXT,
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                summary TEXT
            )
        """)
        
        # Taches autonomes
        await db.execute("""
            CREATE TABLE IF NOT EXISTS autonomous_tasks (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT,
                status TEXT DEFAULT 'pending',
                params TEXT,
                result TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP
            )
        """)
        
        await db.commit()


async def get_db():
    """Generateur de connexion base de donnees."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db
