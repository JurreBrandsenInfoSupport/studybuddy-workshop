**Feature beschrijving**
Ik wil een feature toevoegen met een moeilijkheidsgraad-optie waarmee gebruikers kunnen aangeven hoe complex een taak is.
- Opties: 'makkelijk', 'gemiddeld', 'moeilijk'
- Dit helpt studenten bij het inschatten van tijd en prioriteit

**User story**
Als een student wil ik bij het aanmaken van een taak een moeilijkheidsgraad kunnen selecteren, zodat ik beter kan plannen hoeveel tijd ik aan de taak moet besteden.

**Acceptatiecriteria**
- [ ] Bij het aanmaken van een taak is er een dropdown-menu voor moeilijkheidsgraad met de opties 'makkelijk', 'gemiddeld' en 'moeilijk'.
- [ ] De geselecteerde moeilijkheidsgraad wordt opgeslagen en weergegeven bij de taakdetails.
- [ ] De moeilijkheidsgraad kan worden aangepast na het aanmaken van de taak.

**Technische overwegingen**
front-end:
- Voeg een dropdown-menu toe in het taak-aanmaakformulier.
- Zorg ervoor dat de geselecteerde waarde wordt verzonden naar de back-end bij het opslaan van de taak.

back-end:
- Breid het taakmodel uit met een nieuw veld voor moeilijkheidsgraad.
- Zorg ervoor dat de moeilijkheidsgraad wordt opgeslagen en opgehaald uit de database.
