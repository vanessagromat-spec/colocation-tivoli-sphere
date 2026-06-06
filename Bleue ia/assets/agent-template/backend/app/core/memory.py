"""Gestion de la memoire des conversations."""

import json
from datetime import datetime, timedelta
from typing import List, Optional
import aiosqlite
from app.core.config import settings
from app.core.database import DB_PATH


class ConversationMemory:
    """Memoire contextuelle des conversations."""
    
    def __init__(self, max_messages: int = 20):
        self.max_messages = max_messages
    
    async def create_conversation(self, title: str = "Nouvelle conversation") -> str:
        """Cree une nouvelle conversation."""
        conv_id = f"conv_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{id(datetime)}"
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(
                "INSERT INTO conversations (id, title) VALUES (?, ?)",
                (conv_id, title),
            )
            await db.commit()
        return conv_id
    
    async def add_message(self, conversation_id: str, role: str, content: str):
        """Ajoute un message a une conversation."""
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(
                "INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)",
                (conversation_id, role, content),
            )
            await db.execute(
                "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (conversation_id,),
            )
            await db.commit()
    
    async def get_messages(self, conversation_id: str) -> List[dict]:
        """Recupere l'historique d'une conversation."""
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                """SELECT role, content, timestamp FROM messages 
                   WHERE conversation_id = ? 
                   ORDER BY timestamp DESC LIMIT ?""",
                (conversation_id, self.max_messages),
            )
            rows = await cursor.fetchall()
            return [
                {"role": row["role"], "content": row["content"], "timestamp": row["timestamp"]}
                for row in reversed(rows)
            ]
    
    async def get_conversations(self) -> List[dict]:
        """Liste toutes les conversations."""
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT id, title, updated_at FROM conversations ORDER BY updated_at DESC"
            )
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]
    
    async def delete_conversation(self, conversation_id: str):
        """Supprime une conversation."""
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute("DELETE FROM messages WHERE conversation_id = ?", (conversation_id,))
            await db.execute("DELETE FROM conversations WHERE id = ?", (conversation_id,))
            await db.commit()
    
    async def get_context_for_llm(self, conversation_id: str) -> List[dict]:
        """Recupere le contexte formate pour le LLM."""
        messages = await self.get_messages(conversation_id)
        return [{"role": m["role"], "content": m["content"]} for m in messages]


memory = ConversationMemory(max_messages=settings.ollama_timeout)
