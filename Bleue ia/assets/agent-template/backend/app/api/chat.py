"""Routes API pour le chatbot."""

import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from app.core.llm import ollama_client, DEFAULT_SYSTEM_PROMPT
from app.core.memory import memory

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    stream: bool = False


class ChatResponse(BaseModel):
    response: str
    conversation_id: str


@router.post("/send", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """Envoie un message au chatbot et recupere la reponse."""
    
    # Creer ou recuperer la conversation
    conv_id = request.conversation_id
    if not conv_id:
        conv_id = await memory.create_conversation(request.message[:50])
    
    # Sauvegarder le message utilisateur
    await memory.add_message(conv_id, "user", request.message)
    
    # Recuperer le contexte
    context = await memory.get_context_for_llm(conv_id)
    
    try:
        # Generer la reponse
        response_text = await ollama_client.generate(
            prompt=request.message,
            system=DEFAULT_SYSTEM_PROMPT,
            context=context,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Erreur Ollama: {str(e)}")
    
    # Sauvegarder la reponse
    await memory.add_message(conv_id, "assistant", response_text)
    
    return ChatResponse(
        response=response_text,
        conversation_id=conv_id,
    )


@router.get("/conversations")
async def list_conversations():
    """Liste les conversations."""
    return await memory.get_conversations()


@router.get("/conversations/{conv_id}/messages")
async def get_messages(conv_id: str):
    """Recupere les messages d'une conversation."""
    return await memory.get_messages(conv_id)


@router.delete("/conversations/{conv_id}")
async def delete_conversation(conv_id: str):
    """Supprime une conversation."""
    await memory.delete_conversation(conv_id)
    return {"status": "deleted"}
