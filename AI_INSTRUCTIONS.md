# Instrukcje dla AI - CLI Butik

## 1. Komponenty UI - shadcn/ui

**WAŻNE:** Wszystkie komponenty UI muszą być z biblioteki shadcn/ui. Nie tworzyć własnych komponentów UI.

### Zasady:
- Każdy komponent UI (button, input, dialog, table, card, itp.) **MUSI** być komponentem shadcn/ui
- Przed użyciem komponentu shadcn/ui, AI musi sprawdzić czy jest zainstalowany w projekcie
- Jeśli komponent shadcn/ui nie jest zainstalowany, AI **MUSI**:
  1. **Zatrzymać pracę**
  2. **Poprosić użytkownika** o zainstalowanie komponentu używając komendy: `npx shadcn@latest add [nazwa-komponentu]`
  3. **Poczekać na potwierdzenie** użytkownika przed kontynuacją pracy
- **NIGDY** nie tworzyć własnych komponentów UI zamiast używać shadcn/ui
- **NIGDY** nie kopiować kodu komponentów shadcn/ui ręcznie

### Przykład:
Jeśli potrzebny jest komponent `tabs`, a nie jest zainstalowany:
```
Potrzebuję komponentu shadcn/ui: tabs
Proszę zainstalować go używając: npx shadcn@latest add tabs
Po instalacji kontynuuję pracę.
```

## 2. Zmiany w bazie danych Supabase

**WAŻNE:** Wszystkie zmiany w schemacie bazy danych Supabase muszą być zapisane jako pliki SQL w folderze `scripts/`.

### Zasady:
- Każda zmiana w bazie danych (CREATE TABLE, ALTER TABLE, CREATE INDEX, itp.) **MUSI** być zapisana jako osobny plik SQL
- Pliki SQL są numerowane kolejno w formacie: `XXX-nazwa-opisowa.sql`
- Numeracja jest ciągła - sprawdź ostatni numer w folderze `scripts/` i użyj następnego
- Nazwa pliku powinna być opisowa i wskazywać na rodzaj zmiany
- Plik SQL powinien zawierać:
  - Komentarze wyjaśniające co robi skrypt
  - Kod SQL gotowy do wykonania
  - Ewentualne instrukcje cofnienia (ROLLBACK) jeśli potrzebne

### Przykład:
Jeśli ostatni plik to `016-create-password-resets-table.sql`, a potrzebna jest nowa kolumna:
- Nowy plik: `017-add-status-column-to-users.sql`
- Zawartość:
```sql
-- Dodanie kolumny status do tabeli users
ALTER TABLE users 
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));
```

### Lokalizacja:
Wszystkie pliki SQL znajdują się w: `my-app/scripts/`

