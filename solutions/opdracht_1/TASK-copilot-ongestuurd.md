# TASK: Moeilijkheidsgraad toevoegen aan StudyBuddy+

## Doel
Uitbreiden van de StudyBuddy+ applicatie met een moeilijkheidsgraad optie. Gebruikers moeten bij het aanmaken van een taak kunnen kiezen uit drie moeilijkheidsniveaus: 'makkelijk', 'gemiddeld' en 'moeilijk'.

## Acceptatiecriteria
- [ ] Gebruikers kunnen bij het aanmaken van een taak een moeilijkheidsgraad selecteren
- [ ] De moeilijkheidsgraad wordt opgeslagen in de database
- [ ] De moeilijkheidsgraad wordt getoond op de taakkaart
- [ ] De moeilijkheidsgraad kan gebruikt worden voor filtering/sortering (optioneel)

## Technische implementatie

### 1. Backend aanpassingen

#### 1.1 Type definitie uitbreiden (`backend/src/types.ts`)
```typescript
export type TaskDifficulty = "makkelijk" | "gemiddeld" | "moeilijk";

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  estimatedMinutes: number;
  status: TaskStatus;
  difficulty: TaskDifficulty;  // NIEUW
  createdAt: string;
}

export interface CreateTaskInput {
  title: string;
  subject: string;
  estimatedMinutes: number;
  difficulty: TaskDifficulty;  // NIEUW
}
```

#### 1.2 Database schema updaten (`backend/src/database.ts`)
Voeg de `difficulty` kolom toe aan de database tabel:
```sql
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  estimatedMinutes INTEGER NOT NULL,
  status TEXT NOT NULL,
  difficulty TEXT NOT NULL,  -- NIEUW
  createdAt TEXT NOT NULL
)
```

**Let op:** Als de database al bestaat, moet je een migratie uitvoeren of de database opnieuw initialiseren.

#### 1.3 API endpoints aanpassen (`backend/src/index.ts`)
Zorg ervoor dat de POST /tasks endpoint het `difficulty` veld accepteert en opslaat:
```typescript
app.post("/tasks", (req: Request, res: Response) => {
  const { title, subject, estimatedMinutes, difficulty } = req.body as CreateTaskInput;

  // Validatie toevoegen
  if (!difficulty || !["makkelijk", "gemiddeld", "moeilijk"].includes(difficulty)) {
    return res.status(400).json({ error: "Invalid difficulty level" });
  }

  // Insert met difficulty veld
  // ...
});
```

### 2. Frontend aanpassingen

#### 2.1 Type definitie uitbreiden (`frontend/lib/types.ts`)
```typescript
export type TaskDifficulty = "makkelijk" | "gemiddeld" | "moeilijk"

export type StudyTask = {
  id: string
  title: string
  subject: string
  estimatedMinutes: number
  status: TaskStatus
  difficulty: TaskDifficulty  // NIEUW
  createdAt: string
}

export type CreateTaskInput = Omit<StudyTask, "id" | "status" | "createdAt">
```

#### 2.2 Formulier uitbreiden (`frontend/components/add-task-form.tsx`)
Voeg een select dropdown toe voor moeilijkheidsgraad:
```tsx
<div className="grid gap-2">
  <Label htmlFor="difficulty">Moeilijkheidsgraad</Label>
  <Select
    value={difficulty}
    onValueChange={setDifficulty}
  >
    <SelectTrigger id="difficulty">
      <SelectValue placeholder="Selecteer moeilijkheidsgraad" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="makkelijk">Makkelijk</SelectItem>
      <SelectItem value="gemiddeld">Gemiddeld</SelectItem>
      <SelectItem value="moeilijk">Moeilijk</SelectItem>
    </SelectContent>
  </Select>
</div>
```

Voeg state toe voor difficulty:
```tsx
const [difficulty, setDifficulty] = useState<TaskDifficulty>("gemiddeld")
```

Update de handleSubmit functie om difficulty mee te sturen.

#### 2.3 Taakkaart uitbreiden (`frontend/components/task-card.tsx`)
Toon de moeilijkheidsgraad op de taakkaart met een badge of icon:
```tsx
<div className="flex items-center gap-2">
  <Badge variant={getDifficultyVariant(task.difficulty)}>
    {task.difficulty}
  </Badge>
</div>
```

Voeg een helper functie toe voor styling:
```tsx
const getDifficultyVariant = (difficulty: TaskDifficulty) => {
  switch (difficulty) {
    case "makkelijk": return "default"
    case "gemiddeld": return "secondary"
    case "moeilijk": return "destructive"
  }
}
```

#### 2.4 API client aanpassen (`frontend/lib/api.ts`)
Zorg ervoor dat de `createTask` functie het difficulty veld meestuurt:
```typescript
export async function createTask(input: CreateTaskInput): Promise<StudyTask> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),  // difficulty zit nu in input
  })
  // ...
}
```

### 3. Optionele uitbreidingen

#### 3.1 Filtering op moeilijkheidsgraad
Voeg filter opties toe in `task-filters.tsx`:
```tsx
<Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
  <SelectItem value="all">Alle moeilijkheden</SelectItem>
  <SelectItem value="makkelijk">Makkelijk</SelectItem>
  <SelectItem value="gemiddeld">Gemiddeld</SelectItem>
  <SelectItem value="moeilijk">Moeilijk</SelectItem>
</Select>
```

#### 3.2 Visuele indicatoren
Gebruik verschillende kleuren of icons per moeilijkheidsgraad:
- 🟢 Makkelijk (groen)
- 🟡 Gemiddeld (oranje)
- 🔴 Moeilijk (rood)

## Testplan

### Handmatige tests
1. **Taak aanmaken**
   - Open de applicatie
   - Klik op "Nieuwe taak toevoegen"
   - Vul alle velden in inclusief moeilijkheidsgraad
   - Klik op "Toevoegen"
   - Verifieer dat de taak verschijnt met de juiste moeilijkheidsgraad

2. **Moeilijkheidsgraad weergave**
   - Controleer of de moeilijkheidsgraad correct wordt weergegeven op de taakkaart
   - Verifieer dat de styling/kleuren kloppen

3. **Database persistentie**
   - Maak een taak aan met moeilijkheidsgraad "moeilijk"
   - Herstart de applicatie
   - Verifieer dat de moeilijkheidsgraad behouden blijft

4. **Validatie**
   - Probeer een taak aan te maken zonder moeilijkheidsgraad te selecteren
   - Verifieer dat er een foutmelding verschijnt of een default waarde wordt gebruikt

### API tests (optioneel)
```bash
# Test POST /tasks met difficulty
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Wiskunde oefenen",
    "subject": "Wiskunde",
    "estimatedMinutes": 60,
    "difficulty": "moeilijk"
  }'

# Test GET /tasks en controleer difficulty veld
curl http://localhost:3001/tasks
```

## Implementatie volgorde

1. ✅ Start met de backend (types → database → API)
2. ✅ Test de backend endpoints met curl of Postman
3. ✅ Implementeer frontend types
4. ✅ Voeg UI componenten toe (form & card)
5. ✅ Test de complete flow end-to-end
6. ✅ Voeg optionele features toe (filtering, styling)

## Veelvoorkomende problemen

### Database reset nodig
Als je de database schema wijzigt, moet je mogelijk de database opnieuw initialiseren:
```bash
# Verwijder de database file
rm backend/tasks.db

# Herstart de backend - nieuwe database wordt automatisch aangemaakt
cd backend
npm run dev
```

### Type errors na wijzigingen
Zorg ervoor dat je TypeScript types consistent zijn tussen frontend en backend:
- Gebruik exact dezelfde string literals ("makkelijk", "gemiddeld", "moeilijk")
- Update alle interfaces die StudyTask gebruiken

### Missing difficulty in oude data
Als je bestaande taken hebt zonder difficulty veld, voeg dan een migratie toe of gebruik een default waarde.

## Resources

- [shadcn/ui Select component](https://ui.shadcn.com/docs/components/select)
- [shadcn/ui Badge component](https://ui.shadcn.com/docs/components/badge)
- [SQLite ALTER TABLE](https://www.sqlite.org/lang_altertable.html)

## Geschatte tijdsduur
- Backend: 30-45 minuten
- Frontend: 45-60 minuten
- Testing: 15-30 minuten
- **Totaal: 1.5-2.5 uur**
