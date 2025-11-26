-- Naprawa schematu tabeli invitations do zgodności z działającym systemem zaproszeń
-- Zmiana invited_by na created_by, usunięcie used_at, poprawa RLS policies

-- 1. Zmień kolumnę invited_by na created_by jeśli jeszcze nie została zmieniona
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invitations' AND column_name = 'invited_by'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invitations' AND column_name = 'created_by'
  ) THEN
    -- Zmień nazwę kolumny
    ALTER TABLE invitations RENAME COLUMN invited_by TO created_by;
  END IF;
END $$;

-- 2. Usuń kolumnę used_at jeśli istnieje (zastąpiona przez status)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invitations' AND column_name = 'used_at'
  ) THEN
    ALTER TABLE invitations DROP COLUMN used_at;
  END IF;
END $$;

-- 2a. Usuń kolumnę access_expires_at jeśli istnieje (nie jest używana)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invitations' AND column_name = 'access_expires_at'
  ) THEN
    ALTER TABLE invitations DROP COLUMN access_expires_at;
  END IF;
END $$;

-- 3. Upewnij się, że kolumna created_by istnieje i ma poprawny typ
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invitations' AND column_name = 'created_by'
  ) THEN
    -- Jeśli nie ma żadnej z tych kolumn, dodaj created_by
    ALTER TABLE invitations ADD COLUMN created_by UUID REFERENCES users(id) NOT NULL;
  END IF;
END $$;

-- 4. Upewnij się, że wszystkie wymagane kolumny istnieją
DO $$
BEGIN
  -- Sprawdź czy istnieje kolumna status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invitations' AND column_name = 'status'
  ) THEN
    ALTER TABLE invitations ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
    ALTER TABLE invitations ADD CONSTRAINT invitations_status_check CHECK (status IN ('pending', 'accepted', 'expired'));
  END IF;

  -- Sprawdź czy istnieje kolumna updated_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invitations' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE invitations ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;

  -- Sprawdź czy token jest UUID
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invitations' 
    AND column_name = 'token' 
    AND data_type = 'text'
  ) THEN
    ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_token_key;
    ALTER TABLE invitations ALTER COLUMN token TYPE UUID USING token::uuid;
    ALTER TABLE invitations ADD CONSTRAINT invitations_token_key UNIQUE (token);
  END IF;
END $$;

-- 5. Upewnij się, że funkcja accept_invitation_by_token istnieje i ma SECURITY DEFINER
CREATE OR REPLACE FUNCTION accept_invitation_by_token(invitation_token UUID)
RETURNS void AS $$
BEGIN
  UPDATE invitations
  SET status = 'accepted', updated_at = NOW()
  WHERE token = invitation_token AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Upewnij się, że funkcja expire_old_invitations istnieje
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
  UPDATE invitations
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Popraw RLS policies - upewnij się, że policy "Validate invitation token" pozwala na odczyt pending zaproszeń
DROP POLICY IF EXISTS "Validate invitation token" ON invitations;

-- Policy: Zaproszenie może być odczytane przez token (dla walidacji przed rejestracją)
-- Ważne: pozwala na odczyt zaproszeń ze statusem 'pending' bez wymagania autentykacji
CREATE POLICY "Validate invitation token" ON invitations
  FOR SELECT USING (
    -- Zezwalamy na odczyt jeśli zaproszenie jest pending (dla walidacji przed rejestracją)
    status = 'pending'
    OR
    -- Admini mogą wszystko
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 8. Upewnij się, że policy dla adminów istnieje
DROP POLICY IF EXISTS "Admins can manage invitations" ON invitations;

CREATE POLICY "Admins can manage invitations" ON invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 9. Utwórz indeksy jeśli nie istnieją
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);

-- 10. Upewnij się, że trigger updated_at istnieje
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

