"""Configuration de l'application."""

import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Parametres de configuration."""
    
    # Application
    app_name: str = "Agent IA Pro"
    app_env: str = "development"
    debug: bool = False
    
    # Ollama
    ollama_host: str = "http://localhost:11434"
    ollama_model: str = "mistral"
    ollama_timeout: int = 120
    
    # Base de donnees
    database_path: str = "/app/data/agent.db"
    
    # Taches
    tasks_enabled: bool = True
    max_concurrent_tasks: int = 3
    
    # Modules
    module_crm: bool = True
    module_projects: bool = True
    module_documents: bool = True
    
    # Securite
    secret_key: str = "changez-moi-en-production"
    auth_enabled: bool = False
    
    class Config:
        env_prefix = ""
        case_sensitive = False


settings = Settings()
