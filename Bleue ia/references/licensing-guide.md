# Guide Juridique - Commercialisation de l'Agent IA

## Sommaire
1. [Propriete intellectuelle](#propriete-intellectuelle)
2. [Licences des composants](#licences-composants)
3. [Modeles de contrat](#modeles-contrat)
4. [Obligations legales](#obligations-legales)

## Propriete intellectuelle

### Ce que vous possedez

Vous etes proprietaire de :
- **Le code source** que vous avez ecrit ou fait ecrire
- **La personnalite de l'agent** (nom, ton, comportement personnalise)
- **Les modules business specifiques** que vous avez developpes
- **L'interface utilisateur** personnalisee
- **Les donnees** generees par vos clients

### Ce qui reste open-source

Vous ne possedez PAS (et ne pouvez pas revendre seuls) :
- Les modeles IA (Llama, Mistral, etc.) - licences respectives
- Ollama - licence MIT
- React, FastAPI - licences MIT/Apache
- Les composants shadcn/ui - licence MIT

**Strategie** : Vendez un **produit assemble et configure**, pas les composants individuels.

## Licences des composants

### Composants MIT/Apache (libre usage commercial)
- React, FastAPI, Ollama, shadcn/ui, Tailwind CSS
- **Action requise** : Inclure les notices de copyright

### Modeles IA
- **Llama** (Meta) : Licence commerciale autorisee
- **Mistral** : Licence Apache 2.0 (usage commercial OK)
- **Gemma** (Google) : Licence Gemma (usage commercial OK)
- **Qwen** (Alibaba) : Licences variees selon la version

### Conseil
Toujours verifier la licence exacte du modele choisi sur le site Ollama avant commercialisation.

## Modeles de contrat

### Licence logicielle (pour les clients)

```
LICENCE D'UTILISATION [NOM DE VOTRE AGENT]

Accorde a : [Client]
Par : [Votre societe]
Date : [Date]

1. OBJET
Cette licence accorde au Client un droit non-exclusif d'utiliser 
le logiciel [Nom Agent] (ci-apres "le Logiciel").

2. ETENDUE
- Nombre d'utilisateurs : [X]
- Nombre d'appareils : [X]
- Duree : [Perpetuelle / Abonnement de X mois]

3. RESTRICTIONS
Le Client ne peut pas :
- Revendre, louer ou sous-licencier le Logiciel
- Decompiler ou tenter d'extraire le code source
- Supprimer les mentions de propriete intellectuelle

4. PROPRIETE
Le Logiciel reste la propriete exclusive de [Votre societe].
Les donnees saisies par le Client lui appartiennent.

5. GARANTIE
Le Logiciel est fourni "en l'etat" sans garantie de performance.
Le modele IA utilise est un composant open-source tiers.

6. PRIX ET PAIEMENT
[Prix] payable [conditions].

Signatures :
_________________        _________________
[Licencieur]              [Client]
```

### Contrat de prestation (personnalisation)

Si vous personnalisez l'agent pour un client specifique :
- Facturer au forfait ou a l'heure
- Preciser les livrables (code source ou executable)
- Definir les droits de propriete (generalement le client possede le livrable)

## Obligations legales

### RGPD (si donnees personnelles)
Si l'agent traite des donnees personnelles (noms, emails, etc.) :
- **DPO** : Nommer un delegue a la protection des donnees si > 250 salaries ou traitement a haut risque
- **Registre** : Tenir a jour le registre des activites de traitement
- **Droits** : Permettre l'acces, la rectification, l'effacement des donnees
- **Securite** : Chiffrement, sauvegardes, authentification
- **Sous-traitance** : Si heberge chez un tiers, contrat de sous-traitance

### Mention CNIL
Si traitement de donnees : declarer sur cnil.fr (sauf exemptions).

### Facturation
- Emission de factures avec TVA (si assujetti)
- Mentionner le SIRET sur les factures
- Tenir une comptabilite des recettes

### Assurance
Recommande : assurance responsabilite civile professionnelle (RC Pro).

## Checklist avant vente

- [ ] Enregistrement de la marque (optionnel mais recommande)
- [ ] Redaction de la licence d'utilisation
- [ ] Verification des licences des composants open-source
- [ ] Mise en place des CGV/CGU
- [ ] Politique de confidentialite (RGPD)
- [ ] Contrat de maintenance/support (optionnel)
- [ ] Assurance RC Pro
- [ ] Comptabilite prete
