# Voeg een moeilijkheidsgraadselector toe aan het aanmaken van taken

## User Story
Als student
wil ik een moeilijkheidsgraad toewijzen aan mijn taken,
zodat ik de studietijd beter kan inschatten en uitdagende opdrachten kan prioriteren.

## Beschrijving
Breid de interface voor het aanmaken en bewerken van taken uit met een moeilijkheidsgraadselector. Dit helpt studenten weloverwogen beslissingen te nemen over de taakplanning. De moeilijkheidsgraad moet worden opgeslagen in het taakmodel en weergegeven in de takenlijst. Gebruikers kunnen kiezen uit drie niveaus: 'makkelijk', 'gemiddeld' en 'moeilijk'.

## Acceptatiecriteria
- [ ] Een dropdownmenu met opties: Makkelijk, Gemiddeld, Moeilijk verschijnt in het taakcreatieformulier.
- [ ] De geselecteerde moeilijkheidsgraad wordt samen met de taak opgeslagen.
- [ ] Het moeilijkheidsniveau wordt weergegeven op taakkaarten in de takenlijst.
- [ ] Bestaande taken hebben standaard de moeilijkheidsgraad 'Gemiddeld'.
- [ ] API accepteert en valideert het moeilijkheidsgraadveld (alleen 'makkelijk', 'gemiddeld', 'moeilijk' zijn toegestaan).

## Technische opmerkingen
- **Frontend:** Voeg selectie-invoer toe aan het `add-task-form.tsx` component, werk de `task-card.tsx` weergave bij om de moeilijkheidsgraad te tonen.
- **Backend:** Breid de Task interface in `backend/src/types.ts` uit met het difficulty veld, werk de POST en PATCH eindpunten in `backend/src/index.ts` bij.
- **Database:** Voeg difficulty property toe aan taakobjecten in `backend/src/database.ts` (in-memory database).

## Testoverwegingen
- Test of alle drie de moeilijkheidsgraden kunnen worden geselecteerd en opgeslagen.
- Controleer de achterwaartse compatibiliteit met bestaande taken.
- Controleer of de moeilijkheidsgraad behouden blijft na paginavernieuwing.
- Valideer dat de API incorrecte moeilijkheidsgraadwaarden afwijst.
- Test de filtering en weergave van taken met verschillende moeilijkheidsgraden.
