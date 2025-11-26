-- Aktualizacja tabeli invitations do struktury zgodnej z systemem zaproszeń
-- Dodanie kolumny status, zmiana token na UUID, dodanie funkcji pomocniczych

-- 1. Dodaj kolumnę status jeśli nie istnieje
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invitations' AND column_name = 'status'
  ) THEN
    -- Migruj dane: jeśli used_at jest NULL, status = 'pending', w przeciwnym razie 'accepted'
    ALTER TABLE invitations ADD COLUMN status TEXT;
    UPDATE invitations SET status = CASE 
      WHEN used_at IS NULL THEN 'pending'
      ELSE 'accepted'
    END;
    ALTER TABLE invitations ALTER COLUMN status SET NOT NULL;
    ALTER TABLE invitations ADD CONSTRAINT invitations_status_check CHECK (status IN ('pending', 'accepted', 'expired'));
  END IF;
END $$;

-- 2. Zmień typ token z TEXT na UUID jeśli jeszcze nie jest UUID
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invitations' 
    AND column_name = 'token' 
    AND data_type = 'text'
  ) THEN
    -- Najpierw usuń constraint UNIQUE
    ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_token_key;
    
    -- Zmień typ kolumny na UUID
    ALTER TABLE invitations ALTER COLUMN token TYPE UUID USING token::uuid;
    
    -- Dodaj z powrotem constraint UNIQUE
    ALTER TABLE invitations ADD CONSTRAINT invitations_token_key UNIQUE (token);
  END IF;
END $$;

-- 3. Dodaj kolumnę updated_at jeśli nie istnieje
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invitations' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE invitations ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- 4. Utwórz indeks na status jeśli nie istnieje
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);

-- 5. Funkcja do automatycznego wygaszania starych zaproszeń
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
  UPDATE invitations
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Funkcja do akceptacji zaproszenia przez token (omija RLS)
CREATE OR REPLACE FUNCTION accept_invitation_by_token(invitation_token UUID)
RETURNS void AS $$
BEGIN
  UPDATE invitations
  SET status = 'accepted', updated_at = NOW()
  WHERE token = invitation_token AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Usuń stare policy i utwórz nowe dla RLS
DROP POLICY IF EXISTS "Admins can view invitations" ON invitations;
DROP POLICY IF EXISTS "Admins can create invitations" ON invitations;
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON invitations;
DROP POLICY IF EXISTS "System can update invitations" ON invitations;

-- Policy: Admini mogą zarządzać wszystkimi zaproszeniami
CREATE POLICY "Admins can manage invitations" ON invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Zaproszenie może być odczytane przez token (dla walidacji przed rejestracją)
CREATE POLICY "Validate invitation token" ON invitations
  FOR SELECT USING (
    -- Zezwalamy na odczyt jeśli zaproszenie jest pending (dla walidacji)
    status = 'pending'
    OR
    -- Admini mogą wszystko
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 8. Trigger do automatycznej aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_invitations_updated_at_trigger ON invitations;
CREATE TRIGGER update_invitations_updated_at_trigger
  BEFORE UPDATE ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_invitations_updated_at();

