---
name: proprietaire-ai-agent
description: Guide de creation d'un agent IA complet, 100% proprietaire et open-source, avec chatbot conversationnel, capacites autonomes d'execution de taches, et modules business integres (CRM, automatisation, analytics). Packaged avec Docker pour distribution commerciale. A utiliser quand un utilisateur veut creer un agent IA qu'il possede legalement, peut exploiter commercialement, et revendre. Inclut l'installation automatique de modeles IA locaux (Llama, Mistral via Ollama), interface React intuitive, backend Python FastAPI, et base de donnees SQLite embarquee.
---

# Proprietaire AI Agent

## Vue d'ensemble

Skill de creation d'un agent IA autonome, 100% open-source et proprietaire, executable localement sans API couteuse. L'agent combine : (1) un chatbot conversationnel avec memoire, (2) un moteur d'execution de taches autonomes, et (3) des modules business (CRM, projets, documents). Packaged avec Docker pour distribution et vente.

## Architecture technique

```
agent-ia-proprietaire/
├── frontend/               # React + TypeScript + Tailwind + shadcn/ui
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Chat, Dashboard, Settings, CRM
│   │   ├── hooks/          # Custom hooks (useAI, useLocalStorage)
│   │   └── lib/            # Utils, API client
│   └── package.json
├── backend/                # Python FastAPI
│   ├── app/
│   │   ├── core/           # LLM local, memoire, taches
│   │   ├── modules/        # CRM, projets, documents
│   │   └── api/            # Routes API
│   ├── models/             # Modeles Ollama (telecharges auto)
│   └── requirements.txt
├── docker-compose.yml
└── LICENSE                 # Licence proprietaire / commercial
```

## Flux de creation

### Etape 1 : Verifier les prerequis

Avant de commencer, verifier que l'environnement dispose de :
- Docker + Docker Compose
- Node.js 18+ (si dev local frontend)
- Python 3.10+ (si dev local backend)
- Au moins 8GB RAM (16GB recommande pour les modeles IA)
- 20GB d'espace disque minimum

### Etape 2 : Generer l'application complete

Utiliser le template dans `assets/agent-template/` comme base. Ce template contient :
- Frontend React preconfigure avec composants shadcn/ui
- Backend FastAPI avec integration Ollama
- Docker Compose complet
- Scripts d'installation automatique des modeles IA

Copier le template et personnaliser selon les besoins specifiques du projet.

### Etape 3 : Configurer le modele IA local

L'agent utilise **Ollama** pour executer des modeles IA localement :

**Modeles supportes (tous open-source, gratuits) :**
- `llama3.2` (3B) - Rapide, ideal pour machines modestes
- `mistral` (7B) - Equilibre performance/vitesse
- `llama3` (8B) - Bonne qualite generale
- `codellama` (7B) - Specialise code
- `mixtral` (47B) - Haute qualite ( necessite 16GB+ RAM )

Le script `scripts/setup-ollama.sh` installe et configure automatiquement Ollama avec le modele choisi.

### Etape 4 : Personnaliser les capacites

**Configuration dans `backend/app/config/capabilities.yaml` :**

```yaml
chatbot:
  memory_enabled: true          # Memoire des conversations
  memory_window: 20             # Nombre de messages retenus
  system_prompt: "..."          # Personnalite de l'agent
  
autonomous:
  enabled: true
  max_concurrent_tasks: 3
  task_types:
    - web_search
    - file_processing
    - email_generation
    - data_analysis
    - code_generation
    
business:
  crm:
    enabled: true
    fields: [nom, email, telephone, statut, notes]
  projects:
    enabled: true
    kanban: true
  documents:
    enabled: true
    supported: [pdf, docx, txt, md]
```

### Etape 5 : Construire et lancer

```bash
docker-compose up --build
```

L'application est accessible sur :
- Frontend : http://localhost:3000
- Backend API : http://localhost:8000
- Documentation API : http://localhost:8000/docs

### Etape 6 : Packager pour distribution

Le script `scripts/package-for-sale.sh` cree un package distribuable incluant :
- Le code source complet
- Les Dockerfiles optimises
- La licence commerciale
- Un guide d'installation pour le client final
- Un fichier docker-compose production-ready

## Capacites de l'agent

### 1. Chatbot conversationnel
- Interface chat moderne avec historique
- Memoire contextuelle des conversations
- Support du markdown, code highlighting
- Personnalisation du ton et de la personnalite
- Export des conversations

### 2. Agent autonome
- Execution de taches en arriere-plan
- Recherche web automatisee
- Traitement de fichiers (PDF, DOCX, images)
- Generation de rapports
- Envoi d'emails automatiques
- Planification de taches (cron-like)

### 3. Modules business
- **CRM** : Gestion de contacts, pipeline de ventes
- **Projets** : Tableaux Kanban, taches, deadlines
- **Documents** : Analyse de documents, resume, extraction
- **Analytics** : Tableaux de bord, rapports d'activite
- **Automatisation** : Workflows personalises, triggers

## Personnalisation

### Modifier l'identite de l'agent
Editer `backend/app/config/personality.yaml` :

```yaml
name: "Assistant Pro"
description: "Votre assistant IA personnel"
tone: "professionnel"  # professionnel, amical, technique
language: "fr"
expertise:
  - gestion_projet
  - analyse_donnees
  - redaction
```

### Ajouter une nouvelle capacite
1. Creer un fichier dans `backend/app/modules/`
2. Definir les routes API dans `backend/app/api/`
3. Ajouter l'onglet correspondant dans le frontend

### Changer le modele IA
Modifier le fichier `.env` :
```env
OLLAMA_MODEL=mistral
OLLAMA_HOST=http://ollama:11434
```

Puis relancer : `docker-compose up --build`

## Securite et confidentialite

- **100% local** : Aucune donnee ne quitte la machine
- **Pas de cle API** : Pas de cout recurrent
- **Chiffrement** : Les donnees sensibles sont chiffrees au repos
- **Authentification** : Systeme de login integre (optionnel)
- **HTTPS** : Support TLS pour les deploiements distants

## Distribution commerciale

Pour revendre l'agent ou l'exploiter commercialement :

1. **Personnaliser la marque** : Logo, couleurs, nom dans le frontend
2. **Configurer la licence** : Voir `references/licensing-guide.md`
3. **Packager** : Utiliser `scripts/package-for-sale.sh`
4. **Documenter** : Fournir le guide d'installation au client

**Models de monetisation possibles :**
- Vente de licences par utilisateur
- Vente de deploiements cles en main
- Abonnement SaaS (si heberge sur le cloud)
- Prestation de personnalisation

## Ressources

### scripts/
- `setup-ollama.sh` : Installation automatique d'Ollama et des modeles
- `package-for-sale.sh` : Packaging pour distribution commerciale
- `backup-data.sh` : Sauvegarde des donnees utilisateur

### references/
- `ollama-models.md` : Guide des modeles IA disponibles et leurs performances
- `licensing-guide.md` : Guide juridique pour la commercialisation
- `api-reference.md` : Documentation complete de l'API

### assets/
- `agent-template/` : Template complet de l'application (frontend + backend + Docker)

## Prerequis materiels

| Configuration | RAM | Stockage | Modele recommande |
|--------------|-----|----------|-------------------|
| Minimum | 8GB | 20GB | llama3.2 (3B) |
| Recommande | 16GB | 50GB | mistral (7B) |
| Performant | 32GB | 100GB | mixtral (47B) |
