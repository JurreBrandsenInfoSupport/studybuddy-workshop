# Opdracht 1: Feature specificatie maken met AI-ondersteuning

## Leerdoelen
In deze opdracht leer je:
- Het verschil tussen handmatig en AI-gegenereerde feature specificaties
- Hoe je GitHub Copilot effectief kunt sturen met instructie files
- Hoe je herbruikbare prompt files maakt voor consistente output
- Waarom controle over AI-tools essentieel is in softwareontwikkeling

---

## Context

Je gaat werken aan de **StudyBuddy+** app - een taakbeheer applicatie voor studenten. Bekijk eerst de README van dit project om te begrijpen wat de app doet.

**De feature die we gaan specificeren:**
Een moeilijkheidsgraad-optie waarmee gebruikers kunnen aangeven hoe complex een taak is.
- Opties: 'makkelijk', 'gemiddeld', 'moeilijk'
- Dit helpt studenten bij het inschatten van tijd en prioriteit

---

## Fase 1: Handmatig een feature specificeren (zonder AI)

### Stap 1: Maak je eigen TASK.md

Zonder hulp van AI, ga je een specificatie schrijven voor de moeilijkheidsgraad feature.

**Schrijf het volgende op in een bestand genaamd `TASK-handmatig.md`:**

1. **Feature beschrijving** - Wat moet er gebouwd worden?
2. **User story** - Wie wil dit, waarom, en wat is het voordeel?
3. **Acceptatie criteria** - Wanneer is deze feature 'done'?
4. **Technische overwegingen** - Welke onderdelen moeten aangepast worden?

> **Tip:** Denk aan zowel frontend (gebruikersinterface) als backend (API endpoints, database)

### Stap 2: Reflectie

Bekijk wat je hebt gemaakt en stel jezelf deze vragen:
- Is de beschrijving compleet en duidelijk?
- Heb je aan alle edge cases gedacht?
- Zijn de acceptatie criteria testbaar?
- Heb je iets belangrijks over het hoofd gezien?

**Schrijf je bevindingen op.** We komen hier later op terug.

---

## Fase 2: AI-gegenereerde specificatie (zonder sturing)

Nu gaan we dezelfde feature specificeren met GitHub Copilot, maar **zonder extra sturing**.

### Stap 3: Gebruik Copilot voor een TASK.md

1. Open GitHub Copilot Chat
2. Gebruik deze prompt:
   ```
   Genereer een TASK.md voor het toevoegen van een moeilijkheidsgraad
   optie aan de StudyBuddy+ app. Gebruikers moeten kunnen kiezen uit
   'makkelijk', 'gemiddeld' en 'moeilijk'.
   ```
3. Sla het resultaat op als `TASK-copilot-ongestuurd.md`

> Let op: Zorg er voor dat copilot niet gaat spieken bij je handmatige versie! Haal deze zonodig even weg uit je editor.

### Stap 4: Vergelijk en analyseer

Leg je drie documenten naast elkaar:
- Je handmatige versie
- De AI-gegenereerde versie
- De opdracht requirements

**Reflectievragen:**
- Welke is completer?
- Welke sluit beter aan bij jouw project?
- Welke onverwachte zaken heeft Copilot toegevoegd?
- Welke aannames heeft Copilot gemaakt die misschien niet kloppen?

> **Belangrijk inzicht:** AI kan waardevolle suggesties doen, maar introduceert ook scope creep en ongefundeerde aannames. Zonder sturing krijg je **wildgroei**.

---

## Fase 3: AI sturen met instructie files

Om controle te houden over AI-output, gebruiken we **instructie files**. Dit zijn richtlijnen die Copilot altijd volgt binnen je project.

### Stap 5: Experimenteer met instructies

1. Maak het bestand `.github/copilot-instructions.md` aan
2. Voeg deze testinstructie toe:
   ```markdown
   Geef altijd antwoord in BLOKLETTERS.
   ```
3. Open Copilot Chat en stel een willekeurige vraag
4. Observeer: Copilot houdt zich aan je instructie!

**Dit is krachtig:** Alles wat je hier definieert wordt project-breed toegepast.

### Stap 6: Definieer project-specifieke instructies

Vervang de testinstructie door een professionele instructie file. Gebruik dit template:

```markdown
# GitHub Copilot Instructions

Follow these instructions when writing code or documentation for this project.

## Project Overview

TODO: Describe the goals of the project

## Project Structure

TODO: Describe your project structure

- **Tip** Are you using feature slicing or clean architecture?
- **Tip** Where are projects located in the directory structure?
- **Tip** What does each of the projects do in the solution?

## Technology Stack

TODO: Describe your technology stack

- **Tip** How do the technologies map on the project structure?
- **Tip** How are technologies used?

## Coding Standards

TODO: Define your coding standards

## Feature Development Guidelines

TODO: Add guidelines for developing new features
```

> **Pro tip:** Je kunt Copilot vragen dit template in te vullen: "Vul bovenstaand template in op basis van de codebase" en controleer het resultaat!


<details>
<summary><strong>Spoiler: Voorbeeld van een ingevulde instructie file</strong></summary>

```markdown
# GitHub Copilot Instructions

Follow these instructions when writing code or documentation for this project.

## Project Overview

StudyBuddy+ is a task management application for students, helping them organize
study tasks with time estimates, status tracking, and filtering capabilities.

## Project Structure

This is a monorepo containing:
- `frontend/` - Next.js application (React, TypeScript, Tailwind CSS)
- `backend/` - Express.js REST API (Node.js, TypeScript)
- In-memory database with seeded example data

## Technology Stack

### Frontend
- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** React hooks and Server Components where possible

### Backend
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** In-memory (array-based for development)
- **API Style:** RESTful

## Coding Standards

- Use TypeScript for all new code
- Follow functional programming principles where applicable
- Prefer Server Components in Next.js unless client interactivity is needed
- Use async/await over promises
- API responses should follow the format: `{ success: boolean, data?: any, error?: string }`
- All API endpoints should be prefixed with `/api/`

## Feature Development Guidelines

- New features should include both frontend and backend changes
- Always update types/interfaces when adding new data fields
- Consider existing task properties: title, description, status, estimatedTime
- Test with existing seeded data first
```

</details>

### Stap 7: Test de impact

1. Genereer opnieuw een TASK.md. Gebruik deze prompt:
   ```
   Genereer een TASK.md voor het toevoegen van een moeilijkheidsgraad
   optie aan de StudyBuddy+ app. Gebruikers moeten kunnen kiezen uit
   'makkelijk', 'gemiddeld' en 'moeilijk'.
   ```
2. Sla op als `TASK-copilot-gestuurd.md`
3. Vergelijk met de eerdere versies

**Let op:**
- Gebruikt Copilot nu de juiste technologieën?
- Sluit de structuur beter aan bij je project?
- Zijn de suggesties relevanter?

---

## Fase 4: Herbruikbare prompts met prompt files

Voor terugkerende taken (zoals het maken van issues) kun je **prompt files** gebruiken. Dit zijn herbruikbare prompt templates.

### Stap 8: Maak een prompt file

1. Maak het bestand `.github/prompts/create-task.prompt.md` aan

<details>
<summary>2. Voeg deze professionele prompt template toe:</summary>

```markdown
Je bent een **GitHub Issue Generator** voor het StudyBuddy+ project.

Maak bondige, goed gestructureerde issues met behulp van het **User Story-formaat**.

---

## Uitvoerformaat

### Titel
Korte, actiegerichte beschrijving (maximaal 60 tekens)
Voorbeeld: "Moeilijkheidsniveau toevoegen aan taken"

### User Story
Als [gebruikerstype]
wil ik [doel],
zodat [voordeel].

### Beschrijving
- Vat de context en het doel samen (2-3 zinnen)
- Verwijs naar gerelateerde functies of afhankelijkheden
- Noteer eventuele technische beperkingen

### Acceptatiecriteria
Gebruik testbare, specifieke criteria:
- [ ] Verwachte uitkomst 1
- [ ] Verwachte uitkomst 2
- [ ] Verwachte uitkomst 3

### Technische opmerkingen (indien van toepassing)
- **Frontend-wijzigingen:** Component-/pagina-aanpassingen
- **Backend-wijzigingen:** API-eindpunten, datamodelwijzigingen
- **Database:** Nieuwe velden of structuurwijzigingen

### Testoverwegingen
- Unittests nodig?
- Integratiescenario's?
- Edgecases om rekening mee te houden?

---

## Vereisten

- Volg de INVEST-principes (Onafhankelijk, Onderhandelbaar, Waardevol, Schattingsbaar, Klein, Testbaar)
- Houd problemen gericht op één enkele feature of oplossing
- Maak acceptatiecriteria objectief verifieerbaar
- Gebruik duidelijke, jargonvrije taal
- Verwijs naar de bestaande codebasestructuur (Next.js frontend, Express backend)

---

## Wat NIET op te nemen

- Vage vereisten ("Verbeter de gebruikersinterface", "Maak het beter")
- Implementatiedetails (specifieke code)
- Automatisch toegewezen labels of toegewezen personen
- Meerdere niet-gerelateerde features in één probleem

---

## Voorbeelduitvoer

**Titel:** Voeg een moeilijkheidsgraadselector toe aan het aanmaken van taken

**Gebruikersverhaal:**
Als student
wil ik een moeilijkheidsgraad toewijzen aan mijn taken,
zodat ik de studietijd beter kan inschatten en uitdagende opdrachten kan prioriteren.

**Beschrijving:**
Breid de interface voor het aanmaken en bewerken van taken uit met een moeilijkheidsgraadselector. Dit helpt studenten weloverwogen beslissingen te nemen over de taakplanning. De moeilijkheidsgraad moet worden
opgeslagen in het taakmodel en weergegeven in de takenlijst.

**Acceptatiecriteria:**
- [ ] Een dropdownmenu met opties: Gemakkelijk, Gemiddeld, Moeilijk verschijnt in het taakcreatieformulier.
- [ ] De geselecteerde moeilijkheidsgraad wordt samen met de taak opgeslagen.
- [ ] Het moeilijkheidsniveau wordt weergegeven op taakkaarten in de takenlijst.
- [ ] Bestaande taken hebben standaard de moeilijkheidsgraad 'Gemiddeld'.
- [ ] API accepteert en valideert het moeilijkheidsgraadveld.

**Technische opmerkingen:**
- **Frontend:** Voeg selectie-invoer toe aan het TaskForm-component, werk de TaskCard-weergave bij.
- **Backend:** Breid de Taakinterface uit met het moeilijkheidsgraadveld, werk de POST/PATCH-eindpunten bij.
- **Database:** Voeg moeilijkheidsgraad toe aan taakobjecten in het geheugen.

**Testaandachtspunten:**
- Test of alle drie de moeilijkheidsgraden kunnen worden geselecteerd en opgeslagen.
- Controleer de achterwaartse compatibiliteit met bestaande taken.
- Controleer of de moeilijkheidsgraad behouden blijft na paginavernieuwing.
```

</details>

### Stap 9: Gebruik de prompt file

1. Open GitHub Copilot Chat
2. Genereer opnieuw een TASK.md. Gebruik deze prompt:
   ```
   /create-task Genereer een TASK.md voor het toevoegen van een moeilijkheidsgraad
   optie aan de StudyBuddy+ app. Gebruikers moeten kunnen kiezen uit
   'makkelijk', 'gemiddeld' en 'moeilijk'.
   ```
3. Sla het resultaat op als `TASK-final.md`

> **Magie:** De prompt file content wordt automatisch vooraf gegaan aan je vraag!

### Stap 10: Finale evaluatie

Vergelijk `TASK-final.md` met alle eerdere versies:

**Checklist:**
- [ ] Volgt de gespecificeerde template structuur
- [ ] Bevat alle benodigde secties
- [ ] Technische details zijn specifiek voor Next.js + Express
- [ ] Acceptatie criteria zijn testbaar
- [ ] Scope is duidelijk afgebakend (geen wildgroei)
- [ ] INVEST-principes worden gevolgd

---

## Terugblik: Wat heb je geleerd?

### Belangrijkste inzichten

1. **AI zonder sturing = wildgroei**
   Copilot maakt aannames en voegt features toe die je niet gevraagd hebt.

2. **Instructie files = project-brede consistentie**
   Eén keer definiëren, overal toegepast. Perfect voor coding standards en tech stack.

3. **Prompt files = herbruikbare workflows**
   Voor terugkerende taken (issues, PRs, documentatie) voorkom je het wiel opnieuw uitvinden.

4. **Combinatie = professionele AI-workflow**
   Instructie files (context) + Prompt files (structuur) + Je expertise (validatie) = Optimaal resultaat

### Progressie die je hebt doorlopen

```
Handmatig (langzaam, foutgevoelig)
    ↓
AI zonder sturing (snel, maar onvoorspelbaar)
    ↓
AI met instructies (snel, consistent, controlled)
    ↓
AI met templates (snel, gestructureerd, professioneel)
```

### Best practices voor je mee te nemen

- Valideer altijd AI-output - jij blijft verantwoordelijk
- Start met een goede instructie file in elk project
- Maak prompt files voor repetitieve taken
- Itereer op je prompts - ze worden beter met gebruik
- Deel je prompt files met je team voor consistentie

---

## Volgende stap

In **Opdracht 2** ga je de code voor deze feature daadwerkelijk implementeren met behulp van GitHub Copilot. Je zult zien hoe de TASK.md die je nu hebt gemaakt als basis dient voor de development fase.

**Klaar? Ga naar `opdracht-2.md`**