"""Client Ollama pour l'IA locale."""

import httpx
import json
import uuid
from datetime import datetime
from typing import AsyncGenerator, Optional, List
from app.core.config import settings


class OllamaClient:
    """Client pour communiquer avec Ollama."""
    
    def __init__(self):
        self.host = settings.ollama_host
        self.model = settings.ollama_model
        self.timeout = settings.ollama_timeout
        self._client = httpx.AsyncClient(timeout=self.timeout)
    
    async def health_check(self) -> bool:
        """Verifie si Ollama est accessible."""
        try:
            resp = await self._client.get(f"{self.host}/api/tags", timeout=5)
            return resp.status_code == 200
        except Exception:
            return False
    
    async def list_models(self) -> list:
        """Liste les modeles disponibles."""
        try:
            resp = await self._client.get(f"{self.host}/api/tags")
            data = resp.json()
            return [
                {
                    "name": m["name"],
                    "size": self._format_size(m.get("size", 0)),
                    "parameter_size": m.get("details", {}).get("parameter_size", "?"),
                }
                for m in data.get("models", [])
            ]
        except Exception as e:
            return [{"name": self.model, "size": "?", "parameter_size": "?", "error": str(e)}]
    
    async def generate(
        self,
        prompt: str,
        system: Optional[str] = None,
        context: Optional[List[dict]] = None,
        stream: bool = False,
    ) -> str:
        """Genere une reponse avec le modele."""
        
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        if context:
            messages.extend(context)
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "top_k": 40,
            },
        }
        
        resp = await self._client.post(
            f"{self.host}/api/chat",
            json=payload,
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("message", {}).get("content", "Pas de reponse")
    
    async def generate_stream(
        self,
        prompt: str,
        system: Optional[str] = None,
        context: Optional[List[dict]] = None,
    ) -> AsyncGenerator[str, None]:
        """Genere une reponse en streaming."""
        
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        if context:
            messages.extend(context)
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": True,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
            },
        }
        
        async with self._client.stream(
            "POST",
            f"{self.host}/api/chat",
            json=payload,
        ) as response:
            async for line in response.aiter_lines():
                if line.strip():
                    try:
                        data = json.loads(line)
                        if "message" in data:
                            yield data["message"].get("content", "")
                    except json.JSONDecodeError:
                        continue
    
    @staticmethod
    def _format_size(size_bytes: int) -> str:
        if size_bytes < 1024 * 1024 * 1024:
            return f"{size_bytes / (1024*1024):.1f} MB"
        return f"{size_bytes / (1024*1024*1024):.1f} GB"
    
    async def close(self):
        await self._client.aclose()


# Singleton
ollama_client = OllamaClient()

# System prompt par defaut
DEFAULT_SYSTEM_PROMPT = """Tu es un assistant professionnel expert en gestion de projet, analyse de donnees et redaction.
Tu reponds toujours en francais de maniere claire et structuree.
Tu utilises des exemples concrets pour illustrer tes reponses.
Tu peux aider avec: la gestion de projet, l'analyse de documents, la redaction professionnelle,
la programmation, la recherche d'informations et les taches administratives."""
