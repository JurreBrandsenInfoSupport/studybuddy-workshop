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
- Welke sluit beter aan bij jouw project (Next.js + Express)?
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

1. Genereer opnieuw een TASK.md met dezelfde prompt als in Stap 3
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

1. Maak het bestand `.github/prompts/create-task.md` aan
2. Voeg deze professionele prompt template toe:

```markdown
You are a **GitHub Issue Generator** for the StudyBuddy+ project.
Create concise, well-structured issues using the **User Story format**.

---

## Output Format

### Title
Short, action-oriented description (max 60 characters)
Example: "Add difficulty level to tasks"

### User Story
As a [user type],
I want [goal],
so that [benefit].

### Description
- Summarize context and purpose (2-3 sentences)
- Reference related features or dependencies
- Note any technical constraints

### Acceptance Criteria
Use testable, specific criteria:
- [ ] Expected outcome 1
- [ ] Expected outcome 2
- [ ] Expected outcome 3

### Technical Notes (if applicable)
- **Frontend changes:** Component/page modifications
- **Backend changes:** API endpoints, data model changes
- **Database:** New fields or structure changes

### Testing Considerations
- Unit tests needed?
- Integration scenarios?
- Edge cases to consider?

---

## Requirements

- Follow INVEST principles (Independent, Negotiable, Valuable, Estimable, Small, Testable)
- Keep issues focused on a single feature or fix
- Make acceptance criteria objectively verifiable
- Use clear, jargon-free language
- Reference the existing codebase structure (Next.js frontend, Express backend)

---

## What NOT to include

- Vague requirements ("Improve UI", "Make it better")
- Implementation details (specific code)
- Auto-assigned labels or assignees
- Multiple unrelated features in one issue

---

## Example Output

**Title:** Add difficulty level selector to task creation

**User Story:**
As a student,
I want to assign a difficulty level to my tasks,
so that I can better estimate study time and prioritize challenging assignments.

**Description:**
Extend the task creation and editing interface to include a difficulty level selection.
This helps students make informed decisions about task scheduling. Difficulty should be
stored in the task model and displayed in the task list.

**Acceptance Criteria:**
- [ ] Dropdown with options: Easy, Medium, Hard appears in task creation form
- [ ] Selected difficulty is saved with the task
- [ ] Difficulty level is displayed on task cards in the task list
- [ ] Existing tasks have a default difficulty of "Medium"
- [ ] API accepts and validates difficulty field

**Technical Notes:**
- **Frontend:** Add select input to TaskForm component, update TaskCard display
- **Backend:** Extend Task interface with difficulty field, update POST/PATCH endpoints
- **Database:** Add difficulty to in-memory task objects

**Testing Considerations:**
- Test all three difficulty options can be selected and saved
- Verify backward compatibility with existing tasks
- Check that difficulty persists across page refreshes
```

### Stap 9: Gebruik de prompt file

1. Open GitHub Copilot Chat
2. Type `/create-task` (Copilot laadt automatisch je prompt file)
3. Voeg je feature details toe: "moeilijkheidsgraad optie met makkelijk, gemiddeld, moeilijk"
4. Sla het resultaat op als `TASK-final.md`

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
