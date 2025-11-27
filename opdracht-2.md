# Opdracht 2: Plannen van de implementatie van een feature met Context Engineering

## Leerdoelen

Na het afronden van deze opdracht kun je:
- Uitleggen wat "vibe coding" is en waarom dit een risico vormt
- Het verschil beschrijven tussen co-pilot en auto-pilot ontwikkeling
- Context engineering toepassen bij AI-ondersteund programmeren
- De "Task → Plan → Implement" methodologie gebruiken
- Een plan-prompt analyseren en effectief inzetten
- Kritisch een AI-gegenereerd implementatieplan beoordelen

---

## Introductie

### Het probleem: Vibe Coding

Gebruik maken van AI voor het schrijven van code heeft als valkuil dat het al gauw "black box" werk wordt. Je geeft een prompt en krijgt code terug, zonder dat je precies weet hoe die code tot stand is gekomen. Dit wordt ook wel **vibe coding** genoemd.

**Vibe coding** kenmerkt zich door:
- Code accepteren zonder te begrijpen hoe het werkt
- Hopen dat de gegenereerde code correct is
- Eindeloos itereren wanneer iets niet werkt
- Focus op "het werkt" in plaats van "ik begrijp waarom het werkt"

**Voorbeeld van vibe coding:**
```
Prompt: "Maak een login functie"
[AI genereert 50 regels code]
Developer: "Lijkt goed! *commit*"
```

### De oplossing: AI-Augmented Engineering

Om wel in controle te blijven (we noemen het tenslotte **co-pilot** en niet **pilot**) is het belangrijk om als mens constant in de lead te blijven bij de beslissingen die worden genomen door onze AI-agent.

**AI-Augmented Eningeering kenmerkt zich door:**
- Jij blijft de beslisser en begrijpt de code
- Je vraagt eerst om een plan voordat code wordt geschreven
- Je valideert elke stap voordat je verder gaat
- Je leert en begrijpt van de gegenereerde code

---

## Context Engineering

**Context engineering** is een opkomende praktijk waarbij je bewust de juiste context aanbiedt aan je AI-agent om betere, meer controleerbare resultaten te krijgen.

**Kernprincipes:**
1. Expliciete context: Geef duidelijk aan wat de AI wel en niet moet weten
2. Relevante informatie: Wijs naar bestaande code, patronen en documentatie
3. Gestructureerde aanpak: Gebruik een vaste methodologie
4. Validatie gates: Definieer wanneer iets "goed genoeg" is

### De Task → Plan → Implement Methodologie

```
┌──────────┐      ┌──────────┐      ┌──────────────┐
│   TASK   │ ───> │   PLAN   │ ───> │  IMPLEMENT   │
└──────────┘      └──────────┘      └──────────────┘
     ↑                  ↑                    ↑
  Wat gaan          Review &             Execute
  we maken?         Goedkeuren           het plan
```

In **Opdracht 1** hebben we de TASK gemaakt. In deze opdracht focussen we op de **PLAN** fase, waarin we:
- De taak analyseren
- Een gedetailleerd implementatieplan opstellen
- Het plan reviewen en goedkeuren voordat we implementeren

**Belangrijk:** We gaan pas implementeren als we tevreden zijn met het plan!

---

## Opdracht Stappen

### Stap 1: Maak eerst zelf een globaal plan

Voordat we AI gebruiken, is het belangrijk om zelf na te denken over de aanpak.

**Opdracht:**
1. Open het `TASK.md` bestand dat je in Opdracht 1 hebt gemaakt
2. Maak op papier of in een nieuw document een eigen globaal plan met:
   - Welke bestanden moet je waarschijnlijk aanpassen?
   - Welke nieuwe bestanden moet je waarschijnlijk maken?
   - Welke externe bibliotheken of documentatie heb je nodig?
   - Wat zijn potentiële uitdagingen?
   - In welke volgorde zou je de feature implementeren?

**Doel:** Dit helpt je om straks het AI-gegenereerde plan kritisch te kunnen beoordelen.

_Je plan hoeft niet perfect te zijn. Het gaat erom dat je zelf nadenkt over de aanpak._

---

### Stap 2: Analyseer de Plan-Prompt

We gaan gebruik maken van een speciale plan-prompt. Deze is zo geschreven dat het de juiste context opzoekt: de taak, alleen de code die we nodig hebben, maar ook online resources waar eventuele best practices in staan.

**Opdracht:**
Bekijk de plan-prompt hieronder en beantwoord de volgende vragen:

<details>
<summary><strong>plan-prompt.md</strong> (klik om uit te klappen)</summary>

```markdown
# Generate Requirements Document

Generate a complete requirements document for feature implementation based on thorough
research. **Start by reading the TASK.md file** to understand what needs to be done, how
examples provided help, and any other considerations.

**Important**: The requirements document will be used by another AI agent for
implementation. Include all necessary context since the implementing agent only gets
access to what you document here. The agent has access to the codebase and web search
capabilities, so include specific URLs and code references.

## Research Process

### 0. Task Analysis
- **First step**: Read and analyze the TASK.md file in the project root
- Extract the feature description, examples, documentation references, and considerations
- Use this as the foundation for all subsequent research

### 1. Codebase Analysis
- Search for similar patterns/features in the workspace
- Identify files to reference in the requirements document
- Note existing conventions and architectural patterns to follow
- Check test patterns and validation approaches

### 2. External Research
- Find relevant library documentation (include specific URLs)
- Look for implementation examples and best practices
- Identify common pitfalls and gotchas
- Research integration patterns

### 3. Context Gathering
- Identify specific patterns to mirror and their locations
- Document integration requirements and dependencies
- Note any version-specific considerations

## Requirements Document Structure

### Critical Context to Include
- **Documentation URLs**: Link to specific sections
- **Code Examples**: Real snippets from the codebase showing patterns to follow
- **Architectural Patterns**: Existing approaches that should be mirrored
- **Integration Points**: How this feature connects with existing code
- **Gotchas**: Library quirks, version issues, common mistakes

### Implementation Blueprint
- Start with high-level approach and pseudocode
- Reference specific files for patterns to follow
- Include comprehensive error handling strategies
- Provide ordered task list for step-by-step implementation
- Document validation and testing approach

### Validation Gates
Define specific commands and criteria for validation:
- Test commands (e.g., `npm test`, `dotnet test`)
- Linting and code quality checks
- Performance benchmarks if applicable
- Integration test requirements

## Output Requirements

Save the requirements document as: `docs/implementation-plans/{feature-name}.md`

The document should be comprehensive enough for autonomous implementation without additional clarification.

## Quality Checklist

Before finishing, verify the requirements include:
- [ ] All necessary context for autonomous implementation
- [ ] Validation gates that are executable
- [ ] References to existing patterns and conventions
- [ ] Clear, ordered implementation path
- [ ] Comprehensive error handling documentation
- [ ] Main flow and alternate scenarios covered
- [ ] Specific code examples and file references

**Quality Score**: Rate the requirements document on a scale from 1-10 for confidence in successful single-pass implementation. Explain the score and suggest improvements if below 8.
```

</details>

**Reflectievragen:**
1. Wat is het doel van deze prompt? (Hint: kijk naar de eerste alinea)
2. Waarom start het Research Process met "Task Analysis"?
3. Wat is het verschil tussen "Codebase Analysis" en "External Research"?
4. Waarom vraagt de prompt om specifieke URLs en code references?
5. Wat zijn "Validation Gates" en waarom zijn ze belangrijk?
6. Waarom eindigt de prompt met een "Quality Score"?

---

### Stap 3: Uitvoeren van de Plan-Prompt

Nu gaan we de plan-prompt daadwerkelijk gebruiken om een implementatieplan te genereren.

**Opdracht:**

1. voeg de plan-prompt toe aan `.github/prompts/plan-prompt.prompt.md`
2. Voer de prompt uit en laat de AI een implementatieplan genereren
3. Wacht tot het plan compleet is voordat je verder gaat
4. Controleer of het plan is opgeslagen in `docs/implementation-plans/{feature-name}.md`

---

### Stap 4: Review van het Plan

Nu komt het belangrijkste deel: het kritisch beoordelen van het AI-gegenereerde plan.

**Opdracht:**

Vergelijk het AI-gegenereerde plan met je eigen plan uit Stap 1 en beantwoord:

1. **Volledigheid:**
   - [ ] Zijn alle bestanden die je zelf had bedacht opgenomen?
   - [ ] Zijn er bestanden in het AI-plan die je zelf gemist had?
   - [ ] Mist er iets essentieels?

2. **Context & Referenties:**
   - [ ] Bevat het plan concrete URL's naar documentatie?
   - [ ] Verwijst het plan naar bestaande code patronen in de codebase?
   - [ ] Zijn de code voorbeelden relevant en begrijpelijk?

3. **Implementatie Aanpak:**
   - [ ] Is de volgorde van stappen logisch?
   - [ ] Begrijp je waarom elke stap nodig is?
   - [ ] Zijn er edge cases of error handling scenarios genoemd?

4. **Validation:**
   - [ ] Zijn er concrete test commando's gedefinieerd?
   - [ ] Is duidelijk wanneer de feature "klaar" is?
   - [ ] Zijn er acceptatiecriteria genoemd?

5. **Quality Score:**
   - [ ] Heeft de AI zelf een score gegeven (1-10)?
   - [ ] Ben je het eens met deze score?
   - [ ] Als de score onder de 8 is, wat zijn dan de voorgestelde verbeteringen?

**Geef zelf ook een score:**
- Wat is jouw score voor dit plan (1-10)?
- Waarom geef je deze score?
- Wat zou er verbeterd moeten worden?

---

### Stap 5: Itereren op het Plan (optioneel)

Als je niet tevreden bent met het plan (score < 8), kun je zelf het plan aanpassen en/of kun je de AI vragen om het te verbeteren.

---

## Oplevering

Zorg dat je de volgende bestanden hebt:

- [ ] `TASK.md` - Je taakbeschrijving uit Opdracht 1
- [ ] `docs/implementation-plans/{feature-name}.md` - Het (goedgekeurde) implementatieplan
- [ ] Je eigen handmatige plan uit Stap 1 (papier of digitaal)
- [ ] Je review notities en score uit Stap 4

**Voor de volgende opdracht** gaan we het goedgekeurde plan daadwerkelijk implementeren!
