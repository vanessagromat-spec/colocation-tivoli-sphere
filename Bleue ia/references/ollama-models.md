# Guide des Modeles IA Ollama

## Table des matieres
1. [Modeles recommandes](#modeles-recommandes)
2. [Benchmarks par usage](#benchmarks-par-usage)
3. [Installation des modeles](#installation)
4. [Configuration avancee](#configuration-avancee)

## Modeles recommandes

### Usage general (chat, raisonnement)

| Modele | Parametres | RAM requise | Vitesse | Qualite |
|--------|-----------|-------------|---------|---------|
| llama3.2 | 3B | 4GB | Tres rapide | Bonne |
| llama3.1 | 8B | 8GB | Rapide | Tres bonne |
| mistral | 7B | 8GB | Rapide | Tres bonne |
| mixtral | 47B | 32GB | Moderee | Excellente |
| gemma2 | 9B | 8GB | Rapide | Tres bonne |
| qwen2.5 | 7B | 8GB | Rapide | Tres bonne |

### Code et developpement

| Modele | Parametres | RAM requise | Specialisation |
|--------|-----------|-------------|----------------|
| codellama | 7B | 8GB | Code general |
| codellama:13b | 13B | 16GB | Code avance |
| deepseek-coder | 6.7B | 8GB | Code, documentation |
| qwen2.5-coder | 7B | 8GB | Multilingue code |

### Francais optimise

| Modele | Parametres | RAM requise | Qualite FR |
|--------|-----------|-------------|------------|
| mistral | 7B | 8GB | Excellente |
| llama3.1 | 8B | 8GB | Tres bonne |
| qwen2.5 | 7B | 8GB | Tres bonne |

## Benchmarks par usage

### Chatbot conversationnel
1. **mistral** - Meilleur rapport qualite/vitesse
2. **llama3.1** - Bon equilibre, multilingue
3. **gemma2** - Qualite elevee, Google

### Analyse de documents longs
1. **mixtral** - Grande fenetre contexte
2. **llama3.1:70b** - Tres performant (64GB RAM)
3. **mistral** - Alternative rapide

### Generation de code
1. **codellama:13b** - Meilleur pour le code
2. **deepseek-coder** - Excellent pour la doc
3. **qwen2.5-coder** - Multilingue

### Taches autonomes (agents)
1. **llama3.1** - Bonne adherence aux instructions
2. **mistral** - Rapide pour boucles d'agents
3. **qwen2.5** - Formatage JSON fiable

## Installation

### Installation automatique
```bash
# Le script setup-ollama.sh installe tout automatiquement
./scripts/setup-ollama.sh mistral
```

### Installation manuelle
```bash
# 1. Installer Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. Telecharger un modele
ollama pull mistral

# 3. Tester
ollama run mistral "Bonjour, comment vas-tu ?"
```

### Liste des modeles disponibles
```bash
ollama list
```

### Supprimer un modele
```bash
ollama rm codellama:13b
```

## Configuration avancee

### Fichier Modelfile personnalise

Creer un `Modelfile` pour personnaliser le comportement :

```dockerfile
FROM mistral

# Parametres de generation
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40

# Contexte systeme
SYSTEM """Tu es un assistant professionnel expert en gestion de projet. 
Tu reponds toujours en francais, de maniere claire et structuree.
Tu utilises des exemples concrets pour illustrer tes reponses."""
```

Puis construire :
```bash
ollama create mon-agent -f Modelfile
```

### Parameters importants

| Parametre | Description | Valeur recommandee |
|-----------|-------------|-------------------|
| temperature | Creativite (0=precis, 1=creatif) | 0.7 |
| top_p | Diversite des reponses | 0.9 |
| top_k | Nombre de tokens consideres | 40 |
| num_ctx | Taille contexte | 4096 |
| num_thread | Threads CPU | auto |

### Execution GPU
```bash
# Ollama detecte automatiquement le GPU
# Pour forcer le CPU :
OLLAMA_NO_GPU=1 ollama serve
```
