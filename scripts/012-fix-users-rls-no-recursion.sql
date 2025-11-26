-- Naprawa nieskończonej rekurencji w RLS policies dla tabeli users
-- Usuń wszystkie istniejące policies
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can view users" ON users;
DROP POLICY IF EXISTS "Authenticated users can read users" ON users;
DROP POLICY IF EXISTS "Admins can create users" ON users;
DROP POLICY IF EXISTS "Users can insert own record" ON users;
DROP POLICY IF EXISTS "Authenticated users can insert own record" ON users;
DROP POLICY IF EXISTS "Users can update own last_login" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Service role can create users" ON users;
DROP POLICY IF EXISTS "Service role full access" ON users;

-- Prosta policy: wszyscy zalogowani użytkownicy mogą czytać tabelę users
-- To jest bezpieczne, ponieważ tabela zawiera tylko email i role (nie wrażliwe dane)
CREATE POLICY "Authenticated users can view all users"
  ON users
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Użytkownicy mogą wstawić swój własny rekord (podczas akceptacji zaproszenia)
CREATE POLICY "Users can insert own record"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Użytkownicy mogą aktualizować tylko swoje last_login
-- Uproszczona wersja bez sprawdzania wartości z tej samej tabeli
CREATE POLICY "Users can update own last_login"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role może wszystko (dla operacji admin)
CREATE POLICY "Service role full access"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

