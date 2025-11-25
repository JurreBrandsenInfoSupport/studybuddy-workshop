# Opdracht 3: Implementeren van de feature met AI-begeleiding

## Leerdoelen

Na het afronden van deze opdracht kun je:
- Uitleggen waarom het belangrijk is om een plan te hebben voordat je implementeert
- Het verschil beschrijven tussen zelf implementeren en AI-gestuurd implementeren
- Een implementatie-prompt effectief gebruiken voor systematische feature development
- De voortgang van een AI-implementatie bewaken en bijsturen waar nodig
- Een AI-geïmplementeerde feature reviewen en valideren

---

## Introductie

### Van Plan naar Code

In **Opdracht 1** heb je een feature specificatie gemaakt (TASK.md). In **Opdracht 2** heb je een gedetailleerd implementatieplan opgesteld. Nu komt de laatste fase: het daadwerkelijk **implementeren** van de feature.

De **Task → Plan → Implement** methodologie zorgt ervoor dat je:
1. ✅ Weet wat je moet bouwen (TASK)
2. ✅ Weet hoe je het gaat bouwen (PLAN)
3. → Nu: De feature daadwerkelijk bouwt (IMPLEMENT)

### Twee implementatie-opties

Net als bij de eerdere opdrachten heb je ook nu twee keuzes:

**Optie A: Handmatig implementeren**
- Je gebruikt het plan als handleiding
- Je schrijft alle code zelf
- Je blijft volledig in controle van elke regel code
- Dit geeft maximaal begrip, maar kost meer tijd

**Optie B: AI-gestuurd implementeren**
- Je laat AI het plan uitvoeren onder jouw supervisie
- AI schrijft de code, jij reviewt en stuurt bij
- Je blijft in controle via reviews en validaties
- Dit is sneller, maar vereist kritisch reviewen

> **Belangrijk:** Ook bij optie B blijf JIJ verantwoordelijk. Je moet het plan hebben doorgelezen en goedgekeurd voordat je het laat uitvoeren.

---

## De Implementatie-Prompt

Voor gestructureerde AI-implementatie gebruiken we een speciale **implementatie-prompt**. Deze prompt zorgt voor een systematische uitvoering in 6 stappen.

### Stap 1: Begrijp de Implementatie-Prompt

Bekijk de implementatie-prompt hieronder en let op de 6 stappen van het uitvoeringsproces:

<details>
<summary><strong>📄 implementatie-prompt.prompt.md</strong> (klik om uit te klappen)</summary>

```markdown
# Implement Requirements

Implement a feature based on the planning document provided as input.

**Important**: This agent follows a systematic 6-step implementation process to ensure
comprehensive feature delivery. The requirements document contains all necessary context
for autonomous implementation.

## Requirements File Input

The requirements document path will be provided as input. Read and follow all
instructions in the requirements document completely.

## Execution Process

### 1. Load the Requirements Document

- Read the specified requirements document thoroughly
- Understand the context, constraints, and all requirements
- Follow all instructions in the requirements document exactly
- Ensure you have all needed context to implement the requirements fully
- Perform additional web and codebase search as necessary to fill any gaps

### 2. Plan the Implementation

- Think before you execute the plan. Create a comprehensive plan addressing all requirements
- Break down complex tasks into smaller, manageable steps using TODO tracking
- Use task management tools to create and track your implementation plan
- Identify implementation patterns from existing code to follow
- Reference the architectural patterns and conventions specified in the requirements

### 3. Execute the Plan

- Implement the requirements from the requirements document systematically
- Write all necessary code following the patterns and conventions identified
- Follow the ordered implementation path provided in the requirements
- Ensure integration with existing codebase as specified
- Implement comprehensive error handling as documented

### 4. Validate

- Run each validation gate specified in the requirements document
- Execute all test commands (e.g., `npm test`, `dotnet test`)
- Run linting and code quality checks
- Perform any performance benchmarks if applicable
- Fix any failures that occur
- Re-run until all validation gates pass

### 5. Complete

- Ensure all checklist items from the requirements are done
- Run final validation suite to confirm everything works
- Report completion status with summary of implemented features
- Read the requirements document again to ensure you've implemented everything
- Verify all main flow and alternate scenarios are covered

### 6. Reference the Requirements Document

- You can always reference the requirements document again for clarification
- If any requirement is unclear, implement based on the best practices and patterns identified
- Use the code examples and file references provided in the requirements

## Implementation Guidelines

### Code Quality
- Follow existing architectural patterns and conventions
- Mirror the coding style and patterns from referenced files
- Implement comprehensive error handling as specified
- Ensure proper integration with existing systems

### Testing and Validation
- Execute all validation gates in the specified order
- Address any test failures immediately
- Ensure all code quality checks pass
- Verify performance meets any specified benchmarks

### Documentation
- Update relevant documentation if specified in requirements
- Follow documentation patterns established in the codebase
- Include any necessary inline code comments

## Success Criteria

Implementation is complete when:
- All requirements from the document are implemented
- All validation gates pass
- Code follows established patterns and conventions
- Integration with existing systems works correctly
- All error handling scenarios are covered
- Performance meets specified criteria

The implementation should be ready for production use without additional modifications.
```

</details>

**Reflectievragen:**
1. Waarom start het proces met "Load the Requirements Document"?
2. Wat is het verschil tussen stap 2 (Plan) en stap 3 (Execute)?
3. Waarom is stap 4 (Validate) zo belangrijk?
4. Wat betekent "Reference the Requirements Document" in stap 6?
5. Hoe zorgt deze prompt ervoor dat je in controle blijft?

---

## Opdracht Stappen

### Stap 2: Sla de Implementatie-Prompt op

Maak de implementatie-prompt beschikbaar als herbruikbare prompt file.

**Opdracht:**
1. Maak het bestand `.github/prompts/implementatie-prompt.prompt.md` aan
2. Kopieer de implementatie-prompt hierboven naar dit bestand
3. Commit dit bestand naar je repository

> **Pro tip:** Dit is een herbruikbare prompt die je bij elke feature implementatie kunt gebruiken!

---

### Stap 3: AI-gestuurd Implementeren

**Opdracht:**

1. **Start de implementatie:**
   - Open GitHub Copilot Chat
   - Gebruik deze prompt:
     ```
     /implementatie-prompt Implementeer de feature volgens het plan in docs/implementation-plans/difficulty-selector-feature.md
     ```
   - Wacht tot Copilot het volledige plan heeft geladen

2. **Bewaken van de voortgang:**

   De AI-agent zal de 6 stappen doorlopen. Let op de volgende signalen:

   **Stap 1 - Load Requirements:**
   - [ ] Heeft de agent het implementatieplan gelezen?
   - [ ] Begrijpt de agent de context van het project?

   **Stap 2 - Plan Implementation:**
   - [ ] Maakt de agent een TODO-lijst?
   - [ ] Zijn de stappen logisch en compleet?

   **Stap 3 - Execute Plan:**
   - [ ] Worden bestanden in de juiste volgorde aangepast?
   - [ ] Volgt de code de bestaande patronen?
   - [ ] Zijn de wijzigingen in lijn met het plan?

   **Stap 4 - Validate:**
   - [ ] Worden tests uitgevoerd?
   - [ ] Worden errors direct opgelost?

   **Stap 5 - Complete:**
   - [ ] Zijn alle requirements geïmplementeerd?
   - [ ] Is een samenvatting gegeven?

3. **Tussentijds reviewen (Aanbevolen!):**

   Je hoeft niet te wachten tot alles klaar is. Je kunt de implementatie in delen laten uitvoeren:

   ```
   Implementeer eerst alleen de backend wijzigingen uit het plan.
   ```

   ↓ Review de backend code

   ```
   Nu de frontend wijzigingen.
   ```

   ↓ Review de frontend code

   **Voordelen van gefaseerde implementatie:**
   - Kleinere, behapbare reviews
   - Sneller feedback geven
   - Makkelijker om bij te sturen
   - Minder kans op grote fouten

**Ga verder naar Stap 4 (Code Review) wanneer de AI klaar is.**

---

### Stap 4: Code Review (voor AI-geïmplementeerde code)

**Review Checklist:**

**1. Architectuur & Patronen**
- [ ] Volgt de code de bestaande project structuur?
- [ ] Worden dezelfde patterns gebruikt als in vergelijkbare componenten?
- [ ] Is de code consistent met de coding standards?

**2. Type Safety**
- [ ] Zijn alle TypeScript types correct gedefinieerd?
- [ ] Zijn types gesynchroniseerd tussen frontend en backend?
- [ ] Zijn er geen `any` types gebruikt waar specifieke types beter zijn?

**3. Functionaliteit**
- [ ] Zijn alle acceptatiecriteria uit de TASK.md geïmplementeerd?
- [ ] Werken de API endpoints correct?
- [ ] Werkt de UI zoals verwacht?
- [ ] Worden formulieren correct gevalideerd?

**4. Error Handling**
- [ ] Worden fouten netjes afgehandeld?
- [ ] Krijgt de gebruiker duidelijke foutmeldingen?
- [ ] Worden edge cases afgehandeld?

**5. Code Kwaliteit**
- [ ] Is de code leesbaar en goed georganiseerd?
- [ ] Zijn variabele- en functienamen beschrijvend?
- [ ] Is er geen ongebruikte code achtergebleven?
- [ ] Zijn er geen console.log statements vergeten?

**6. Integratie**
- [ ] Werkt de nieuwe feature samen met bestaande functionaliteit?
- [ ] Zijn bestaande features niet kapot gegaan?
- [ ] Werken filters en andere UI elementen nog?

**Acties bij bevindingen:**
- Kleine problemen? Pas zelf aan
- Grotere problemen? Vraag de AI om specifieke verbeteringen:
  ```
  Verbeter de error handling in de createTask functie om ook netwerk errors af te handelen.
  ```

---

### Stap 5: Testen van de Feature

**Test Scenario's:**

**Scenario 1: Nieuwe taak aanmaken met moeilijkheidsgraad**
1. Start de applicatie (backend + frontend)
2. Ga naar het taak-aanmaak formulier
3. Vul een nieuwe taak in
4. Selecteer een moeilijkheidsgraad (Makkelijk / Gemiddeld / Moeilijk)
5. Sla de taak op
6. Controleer of de moeilijkheidsgraad zichtbaar is op de taakkaart

**Scenario 2: Bestaande taken hebben default waarde**
1. Bekijk de bestaande (seed) taken in de lijst
2. Controleer of deze een default moeilijkheidsgraad hebben (Gemiddeld)

**Scenario 3: API validatie**
1. Probeer via de API een taak aan te maken met een ongeldige moeilijkheidsgraad
2. Controleer of de API dit afwijst met een duidelijke foutmelding

**Scenario 4: Persistentie**
1. Maak een nieuwe taak aan met moeilijkheidsgraad
2. Ververs de pagina
3. Controleer of de moeilijkheidsgraad behouden is gebleven

**Scenario 5: Edge cases**
- Wat gebeurt er als je geen moeilijkheidsgraad selecteert?
- Werken de andere filters nog correct?
- Is de moeilijkheidsgraad bewerkbaar na aanmaken?

---

### Stap 6: Validatie & Quality Gates

Voer de validaties uit die in het implementatieplan zijn gedefinieerd.

**Opdracht:**

1. **Linting & Type Checking:**
   ```powershell
   cd backend; npm run lint
   cd frontend; npm run lint
   ```
   - [ ] Geen linting errors
   - [ ] Geen type errors

2. **Build Test:**
   ```powershell
   cd backend; npm run build
   cd frontend; npm run build
   ```
   - [ ] Backend build succesvol
   - [ ] Frontend build succesvol

3. **Runtime Test:**
   ```powershell
   cd backend; npm run dev
   cd frontend; npm run dev
   ```
   - [ ] Backend start zonder errors
   - [ ] Frontend start zonder errors
   - [ ] API endpoints bereikbaar

4. **Functionele Test:**
   - [ ] Alle test scenario's uit Stap 5 slagen
   - [ ] Alle acceptatiecriteria zijn gehaald

**Als er problemen zijn:**
- Los ze op (zelf of met AI-hulp)
- Draai de validaties opnieuw
- Herhaal tot alles groen is

---

## Best Practices voor AI-gestuurd Implementeren

Gebaseerd op deze opdracht, hier zijn de belangrijkste lessen:

### 1. Vertrouw niet blind, valideer altijd
- Lees het implementatieplan voordat je het laat uitvoeren
- Review code gefaseerd, niet alles in één keer
- Test handmatig alle scenario's
- Draai alle validation gates

### 2. Blijf in de driver's seat
- Jij bepaalt WHAT en HOW (via TASK en PLAN)
- AI voert uit, jij valideert
- Bij twijfel: stop en analyseer
- Begrijp de code voordat je het commit

### 3. Gebruik gefaseerde implementatie
- Backend eerst, dan frontend
- Review na elke fase
- Kleiner blast radius bij fouten
- Sneller feedback loop

### 4. Houd de kwaliteit hoog
- Gebruik linting en type checking
- Test niet alleen de happy path
- Check edge cases en error scenarios
- Valideer integratie met bestaande code

### 5. Documenteer je keuzes
- Waarom heb je bepaalde AI-suggesties wel/niet overgenomen?
- Welke problemen kwamen je tegen?
- Wat zou je anders doen bij de volgende feature?

---

## Oplevering

Zorg dat je de volgende items hebt:

- [ ] `.github/prompts/implementatie-prompt.prompt.md` - De implementatie-prompt
- [ ] Werkende feature met alle acceptatiecriteria geïmplementeerd
- [ ] Code review notities (bij AI-implementatie)
- [ ] Alle validation gates groen
- [ ] Reflectie op je implementatie-ervaring

**Bonus:**
- [ ] Screenshot van de werkende feature
- [ ] Git commits met duidelijke messages
- [ ] Notities over wat je hebt geleerd

---

## Ter Afsluiting

Gefeliciteerd! Je hebt nu hands-on ervaring met **AI-Augmented Engineering**. Je bent geen "vibe coder" meer, maar een engineer die AI effectief inzet als tool, waarbij jij altijd in controle blijft.

**Remember:**
> "AI is een krachtige co-pilot, maar jij blijft de pilot. Jij bepaalt de bestemming, de route, en wanneer je gas geeft of remt."

Veel succes met je volgende features! 🚀
