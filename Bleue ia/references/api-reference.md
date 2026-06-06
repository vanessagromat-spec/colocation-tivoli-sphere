# Reference API - Agent IA Proprietaire

## Base URL
```
http://localhost:8000/api/v1
```

## Documentation interactive
```
http://localhost:8000/docs        # Swagger UI
http://localhost:8000/redoc       # ReDoc
```

## Authentification
L'API utilise un token Bearer (optionnel, configurable) :
```
Authorization: Bearer <token>
```

## Endpoints

### Chatbot

#### Envoyer un message
```http
POST /chat/send
Content-Type: application/json

{
  "message": "Bonjour, peux-tu m'aider ?",
  "conversation_id": "conv_123",
  "model": "mistral",
  "stream": true
}
```

Reponse (streaming SSE) :
```json
{
  "type": "token",
  "content": "Bonjour",
  "conversation_id": "conv_123"
}
```

#### Liste des conversations
```http
GET /chat/conversations
```

#### Historique d'une conversation
```http
GET /chat/conversations/{conv_id}/messages
```

#### Effacer l'historique
```http
DELETE /chat/conversations/{conv_id}
```

### Agent autonome

#### Creer une tache
```http
POST /tasks/create
Content-Type: application/json

{
  "name": "Analyse de document",
  "type": "file_processing",
  "params": {
    "file_path": "/data/rapport.pdf",
    "action": "summarize"
  },
  "schedule": null
}
```

Types de taches :
- `web_search` : Recherche web
- `file_processing` : Traitement de fichiers
- `email_generation` : Generation d'emails
- `data_analysis` : Analyse de donnees
- `code_generation` : Generation de code
- `custom` : Tache personnalisee

#### Liste des taches
```http
GET /tasks/list
```

#### Statut d'une tache
```http
GET /tasks/{task_id}/status
```

#### Resultat d'une tache
```http
GET /tasks/{task_id}/result
```

#### Annuler une tache
```http
POST /tasks/{task_id}/cancel
```

#### Taches planifiees (cron)
```http
POST /tasks/schedule
Content-Type: application/json

{
  "name": "Rapport quotidien",
  "type": "data_analysis",
  "params": {...},
  "cron": "0 9 * * *"
}
```

### CRM

#### Contacts

```http
# Liste des contacts
GET /crm/contacts

# Creer un contact
POST /crm/contacts
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean@example.com",
  "telephone": "+33612345678",
  "statut": "prospect",
  "notes": "Rencontre au salon..."
}

# Modifier un contact
PUT /crm/contacts/{id}

# Supprimer un contact
DELETE /crm/contacts/{id}

# Rechercher
GET /crm/contacts/search?q=dupont
```

#### Pipeline / Opportunites

```http
# Liste des opportunites
GET /crm/opportunities

# Creer une opportunite
POST /crm/opportunities
{
  "titre": "Projet Site Web",
  "contact_id": "123",
  "valeur": 5000,
  "statut": "negociation",
  "etape": "proposal"
}

# Pipeline par etape
GET /crm/pipeline
```

### Projets (Kanban)

#### Projets
```http
GET /projects
POST /projects
{
  "nom": "Refonte Site",
  "description": "...",
  "date_echeance": "2025-06-30",
  "statut": "actif"
}
```

#### Taches Kanban
```http
GET /projects/{project_id}/tasks
POST /projects/{project_id}/tasks
{
  "titre": "Maquettes",
  "description": "...",
  "colonne": "a_faire",
  "priorite": "haute",
  "assigne_a": "user@example.com"
}

# Deplacer une tache
PUT /tasks/{task_id}/move
{
  "colonne": "en_cours"
}
```

### Documents

#### Upload
```http
POST /documents/upload
Content-Type: multipart/form-data
file: [fichier.pdf]
```

#### Analyse
```http
POST /documents/{doc_id}/analyze
{
  "type": "summary"
}
# Types: summary, extract, qa, translate
```

#### Liste
```http
GET /documents
```

### Modeles IA

#### Liste des modeles disponibles
```http
GET /models/available
```

#### Changer de modele
```http
POST /models/switch
{
  "model": "llama3.1"
}
```

#### Statut d'Ollama
```http
GET /models/status
```

### Systeme

#### Sante
```http
GET /health
```

#### Statistiques
```http
GET /stats
```

#### Configuration
```http
GET /config
PUT /config
```

## WebSocket (temps reel)

Endpoint : `ws://localhost:8000/ws`

### Souscription aux taches
```json
{
  "action": "subscribe",
  "channel": "tasks"
}
```

### Streaming chat
```json
{
  "action": "chat",
  "message": "Bonjour",
  "conversation_id": "conv_123"
}
```

## Codes d'erreur

| Code | Signification |
|------|--------------|
| 200 | Succes |
| 400 | Requete invalide |
| 401 | Non authentifie |
| 404 | Ressource non trouvee |
| 422 | Validation impossible |
| 500 | Erreur serveur |
| 503 | Service indisponible (Ollama hors ligne) |

## Exemples d'integration

### cURL - Chat simple
```bash
curl -X POST http://localhost:8000/api/v1/chat/send \
  -H "Content-Type: application/json" \
  -d '{"message": "Explique-moi le Machine Learning"}'
```

### Python - Client
```python
import requests

class AgentClient:
    def __init__(self, base_url="http://localhost:8000/api/v1"):
        self.base_url = base_url
    
    def chat(self, message):
        r = requests.post(f"{self.base_url}/chat/send", 
                         json={"message": message})
        return r.json()
    
    def create_task(self, name, task_type, params):
        r = requests.post(f"{self.base_url}/tasks/create",
                         json={"name": name, "type": task_type, 
                               "params": params})
        return r.json()

client = AgentClient()
response = client.chat("Bonjour !")
print(response)
```

### JavaScript - Client
```javascript
class AgentClient {
  constructor(baseUrl = 'http://localhost:8000/api/v1') {
    this.baseUrl = baseUrl;
  }
  
  async chat(message) {
    const res = await fetch(`${this.baseUrl}/chat/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    return res.json();
  }
}
```
