# Task: Moeilijkheidsgraad toevoegen aan StudyBuddy+

## Doel
Voeg een moeilijkheidsgraad-optie toe aan taken in de StudyBuddy+ applicatie. Gebruikers moeten kunnen kiezen uit drie niveaus: 'makkelijk', 'gemiddeld' en 'moeilijk'.

## Acceptatiecriteria
- [ ] Gebruikers kunnen een moeilijkheidsgraad selecteren bij het aanmaken van een taak
- [ ] Gebruikers kunnen een moeilijkheidsgraad wijzigen bij het bewerken van een taak
- [ ] De moeilijkheidsgraad wordt visueel weergegeven op de taakkaart
- [ ] Gebruikers kunnen taken filteren op moeilijkheidsgraad
- [ ] De moeilijkheidsgraad wordt opgeslagen in de database

## Technische Implementatie

### 1. Backend Wijzigingen

#### Types (`backend/src/types.ts`)
- Voeg een `Difficulty` type toe met de waarden: `'easy'`, `'medium'`, `'hard'`
- Voeg een optioneel `difficulty` veld toe aan de `Task` interface

#### Database (`backend/src/database.ts`)
- Voeg `difficulty` toe aan de bestaande seed data
- Update de task objecten om het nieuwe veld te bevatten

#### API (`backend/src/index.ts`)
- Geen wijzigingen nodig aan de endpoints (bestaande CRUD operaties ondersteunen al nieuwe velden)
- Valideer dat de moeilijkheidsgraad één van de toegestane waarden is bij POST/PUT requests

### 2. Frontend Wijzigingen

#### Types (`frontend/lib/types.ts`)
- Voeg een `Difficulty` type toe (matching backend)
- Voeg een optioneel `difficulty` veld toe aan de `Task` interface

#### Formulier (`frontend/components/add-task-form.tsx`)
- Voeg een select/dropdown component toe voor moeilijkheidsgraad
- Include de geselecteerde moeilijkheidsgraad in de API request bij het aanmaken van een taak
- Voeg default waarde toe (bijvoorbeeld 'medium')

#### Taakkaart (`frontend/components/task-card.tsx`)
- Toon de moeilijkheidsgraad met een visuele indicator (badge, kleur, icoon)
- Gebruik verschillende kleuren voor elk niveau:
  - Makkelijk: groen
  - Gemiddeld: geel/oranje
  - Moeilijk: rood

#### Filters (`frontend/components/task-filters.tsx`)
- Voeg een filter dropdown toe voor moeilijkheidsgraad
- Implementeer filter logica om taken te filteren op geselecteerde moeilijkheidsgraad
- Sta "Alle" optie toe om alle moeilijkheidsgraden te tonen

#### Dashboard (`frontend/components/study-dashboard.tsx`)
- Update de filter state om moeilijkheidsgraad filter te ondersteunen
- Pas de filter logica aan om taken op moeilijkheidsgraad te filteren

## Implementatie Stappen

1. **Backend Setup**
   - Update `types.ts` met nieuwe type definities
   - Update database seed data in `database.ts`
   - Test API endpoints met nieuwe veld

2. **Frontend Setup**
   - Update `types.ts` met nieuwe type definities
   - Sync types met backend

3. **UI Components**
   - Implementeer moeilijkheidsgraad selector in formulier
   - Voeg visuele indicator toe aan taakkaart
   - Implementeer filter functionaliteit

4. **Testing**
   - Test het aanmaken van taken met verschillende moeilijkheidsgraden
   - Test het filteren op moeilijkheidsgraad
   - Verificeer dat de moeilijkheidsgraad correct wordt opgeslagen en weergegeven

## Voorbeeldcode Snippets

### Backend Type (TypeScript)
```typescript
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  estimatedTime: number;
  difficulty?: Difficulty;
}
```

### Frontend Select Component (React/TypeScript)
```tsx
<select
  value={difficulty}
  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
  className="..."
>
  <option value="easy">Makkelijk</option>
  <option value="medium">Gemiddeld</option>
  <option value="hard">Moeilijk</option>
</select>
```

### Difficulty Badge Component
```tsx
const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
};

const difficultyLabels = {
  easy: 'Makkelijk',
  medium: 'Gemiddeld',
  hard: 'Moeilijk',
};
```

## Opmerkingen
- Maak het veld optioneel voor backwards compatibility met bestaande data
- Gebruik Nederlandse labels in de UI
- Houd de styling consistent met de rest van de applicatie (Tailwind CSS)
- Overweeg een default waarde ('medium') voor nieuwe taken
