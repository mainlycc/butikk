Przeszukiwanie kodu pod kątem zaproszeń (invitations) i analiza wszystkich aspektów backendu i plików.


[2 tools called]


Czytanie kluczowych plików związanych z zaproszeniami:


[6 tools called]


Sprawdzanie strony rejestracji i szablonu email z zaproszeniem:


[5 tools called]


## 📋 System zaproszeń — dokumentacja

### 1. Struktura bazy danych

#### Tabela `tutor_invitations`
```1:11:e2/sql/08_create_tutor_invitations.sql
-- Tabela tutor_invitations
CREATE TABLE tutor_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_by UUID NOT NULL REFERENCES profiles(id),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Kolumny:
- `id` — UUID, klucz główny
- `email` — adres zapraszanego użytkownika
- `token` — unikalny UUID weryfikacyjny
- `status` — `'pending'`, `'accepted'`, `'expired'`
- `role` — `'user'`, `'admin'`, `'super_admin'` (dodana później)
- `created_by` — ID administratora tworzącego zaproszenie
- `expires_at` — data wygaśnięcia (domyślnie 7 dni)
- `created_at` / `updated_at` — znaczniki czasu

Indeksy:
- `idx_tutor_invitations_token` — szybkie wyszukiwanie po tokenie
- `idx_tutor_invitations_email` — wyszukiwanie po emailu
- `idx_tutor_invitations_status` — filtrowanie po statusie
- `idx_tutor_invitations_role` — filtrowanie po roli

#### Funkcje bazy danych

1. `expire_old_invitations()` — wygasza przeterminowane zaproszenia:
```19:26:e2/sql/08_create_tutor_invitations.sql
-- Funkcja do automatycznego wygaszania starych zaproszeń
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
  UPDATE tutor_invitations
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

2. `accept_invitation_by_token()` — akceptuje zaproszenie (omija RLS):
```28:36:e2/sql/08_create_tutor_invitations.sql
-- Funkcja do akceptacji zaproszenia przez token (omija RLS)
CREATE OR REPLACE FUNCTION accept_invitation_by_token(invitation_token UUID)
RETURNS void AS $$
BEGIN
  UPDATE tutor_invitations
  SET status = 'accepted', updated_at = NOW()
  WHERE token = invitation_token AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Row Level Security (RLS)

Polityki:
1. "Admins can manage tutor invitations" — admini i super_admini mogą zarządzać wszystkimi zaproszeniami
2. "Validate invitation token" — pozwala na odczyt zaproszeń ze statusem `'pending'` do walidacji tokenu

### 2. Backend — funkcje serwerowe (`lib/actions/invitations.ts`)

#### `createInvitation()` — tworzenie zaproszenia
```43:130:e2/lib/actions/invitations.ts
export async function createInvitation(
  email: string,
  role: 'user' | 'admin' | 'super_admin' = 'user'
): Promise<CreateInvitationResult> {
  const supabase = await createClient()

  // Sprawdź czy użytkownik jest adminem
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Nie jesteś zalogowany' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return { success: false, error: 'Brak uprawnień' }
  }

  // Sprawdź czy email już nie istnieje w systemie
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    return { success: false, error: 'Użytkownik z tym adresem email już istnieje' }
  }

  // Sprawdź czy istnieje aktywne zaproszenie dla tego emaila
  const { data: existingInvitation } = await supabase
    .from('tutor_invitations')
    .select('*')
    .eq('email', email)
    .eq('status', 'pending')
    .single()

  if (existingInvitation) {
    return { success: false, error: 'Aktywne zaproszenie dla tego emaila już istnieje' }
  }

  // Ustaw datę wygaśnięcia na 7 dni od teraz
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  // Utwórz zaproszenie
  const { data: invitation, error } = await supabase
    .from('tutor_invitations')
    .insert({
      email,
      role,
      created_by: user.id,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating invitation:', error)
    return { success: false, error: 'Nie udało się utworzyć zaproszenia' }
  }

  // Wyślij email z zaproszeniem
  // Linki zaproszeń zawsze wskazują na airset.pl
  const baseUrl = 'https://airset.pl'
  const invitationLink = `${baseUrl}/register?token=${invitation.token}`

  const emailResult = await sendInvitationEmail({
    to: email,
    invitationLink,
    expiryDays: 7,
  })

  if (!emailResult.success) {
    console.error('Failed to send invitation email:', emailResult.error)
    // Kontynuujemy - zaproszenie jest już utworzone, użytkownik może skopiować link ręcznie
    // W przyszłości można dodać opcję ponownego wysłania emaila
  } else {
    console.log('Invitation email sent successfully to:', email)
  }

  revalidatePath('/dashboard/invitations')
  return { success: true, invitation: invitation as TutorInvitation }
}
```

Kroki:
1. Sprawdza uprawnienia admina/super_admina
2. Sprawdza, czy email nie jest już w systemie
3. Sprawdza, czy nie ma aktywnego zaproszenia dla tego emaila
4. Tworzy zaproszenie z wygaśnięciem za 7 dni
5. Generuje link: `https://airset.pl/register?token={token}`
6. Wysyła email przez Resend
7. Odświeża cache strony

#### `validateInvitationToken()` — walidacja tokenu
```132:173:e2/lib/actions/invitations.ts
export async function validateInvitationToken(token: string): Promise<ValidateTokenResult> {
  const supabase = await createClient()

  console.log('Validating invitation token:', token)

  const { data: invitation, error } = await supabase
    .from('tutor_invitations')
    .select('*')
    .eq('token', token)
    .single()

  if (error) {
    console.error('Error fetching invitation:', error)
    return { valid: false, error: 'Nieprawidłowy token zaproszenia' }
  }

  if (!invitation) {
    console.error('Invitation not found for token:', token)
    return { valid: false, error: 'Nieprawidłowy token zaproszenia' }
  }

  console.log('Found invitation:', invitation)

  if (invitation.status !== 'pending') {
    return { valid: false, error: 'To zaproszenie zostało już wykorzystane lub wygasło' }
  }

  const now = new Date()
  const expiresAt = new Date(invitation.expires_at)

  if (now > expiresAt) {
    // Aktualizuj status na expired
    await supabase
      .from('tutor_invitations')
      .update({ status: 'expired' })
      .eq('id', invitation.id)

    return { valid: false, error: 'To zaproszenie wygasło' }
  }

  return { valid: true, email: invitation.email, role: invitation.role as 'user' | 'admin' | 'super_admin' }
}
```

Kroki:
1. Wyszukuje zaproszenie po tokenie
2. Sprawdza status (`'pending'`)
3. Sprawdza wygaśnięcie (aktualizuje status przy wygaśnięciu)
4. Zwraca email i rolę przy poprawnej walidacji

#### `registerWithInvitation()` — rejestracja z zaproszeniem
```175:263:e2/lib/actions/invitations.ts
export async function registerWithInvitation(
  token: string,
  fullName: string,
  password: string
): Promise<RegisterResult> {
  const supabase = await createClient()

  // Waliduj token
  const validation = await validateInvitationToken(token)
  if (!validation.valid || !validation.email || !validation.role) {
    return { success: false, error: validation.error }
  }

  // Zapisz zweryfikowane wartości do zmiennych lokalnych
  const userEmail = validation.email
  const userRole = validation.role

  // Pobierz zaproszenie
  const { data: invitation } = await supabase
    .from('tutor_invitations')
    .select('*')
    .eq('token', token)
    .single()

  if (!invitation) {
    return { success: false, error: 'Nie znaleziono zaproszenia' }
  }

  // Używamy Admin API do utworzenia użytkownika z automatycznie potwierdzonym emailem
  // To eliminuje potrzebę wysyłania drugiego emaila potwierdzającego przez Supabase
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  // Sprawdź czy użytkownik już istnieje
  const { data: existingUsers } = await adminClient.auth.admin.listUsers()
  const existingUser = existingUsers?.users?.find(
    (u) => u.email?.toLowerCase() === userEmail.toLowerCase()
  )

  if (existingUser) {
    return { success: false, error: 'Użytkownik z tym adresem email już istnieje' }
  }

  // Utwórz użytkownika z automatycznie potwierdzonym emailem
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: userEmail,
    password,
    email_confirm: true, // Automatycznie potwierdź email - nie wysyłaj drugiego emaila
    user_metadata: {
      full_name: fullName,
      role: userRole,
    },
  })

  if (authError) {
    console.error('Auth error:', authError)
    return { success: false, error: authError.message }
  }

  if (!authData.user) {
    return { success: false, error: 'Nie udało się utworzyć konta' }
  }

  // Aktualizuj profil użytkownika (rolę), ponieważ trigger zawsze ustawia rolę na 'user'
  const { error: profileError } = await adminClient
    .from('profiles')
    .update({ role: userRole })
    .eq('id', authData.user.id)

  if (profileError) {
    console.error('Error updating user profile role:', profileError)
    // Nie przerywamy - konto zostało utworzone, tylko rola może być niepoprawna
  }

  // Aktualizuj status zaproszenia używając funkcji bazy danych (omija RLS)
  const { error: updateError } = await supabase.rpc('accept_invitation_by_token', {
    invitation_token: token
  })

  if (updateError) {
    console.error('Error updating invitation:', updateError)
    // Nie przerywamy - konto zostało utworzone, tylko status zaproszenia się nie zaktualizował
  }

  // Odśwież cache dla strony zaproszeń (aby admin zobaczył zmieniony status)
  revalidatePath('/dashboard/invitations')

  return { success: true }
}
```

Kroki:
1. Waliduje token
2. Sprawdza, czy użytkownik już istnieje
3. Tworzy użytkownika przez Admin API z `email_confirm: true`
4. Aktualizuje rolę w profilu
5. Zmienia status zaproszenia na `'accepted'` przez `accept_invitation_by_token`
6. Odświeża cache

#### Pozostałe funkcje
- `getInvitations()` — pobiera listę zaproszeń (tylko dla adminów)
- `resendInvitations()` — ponownie wysyła email do zaznaczonych zaproszeń
- `deleteInvitations()` — usuwa zaproszenia
- `cancelInvitation()` — ustawia status na `'expired'`

### 3. Frontend — komponenty

#### Strona zarządzania zaproszeniami
```6:38:e2/app/dashboard/invitations/page.tsx
export default async function InvitationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Sprawdź uprawnienia
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return (
      <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
        <p className="text-sm text-destructive font-medium">
          Brak dostępu. Ta strona jest dostępna tylko dla administratorów.
        </p>
      </div>
    )
  }

  const invitations = await getInvitations()

  return (
    <div className="space-y-4">
      <InvitationsManagement invitations={invitations} />
    </div>
  )
}
```

Funkcje:
- Sprawdza uprawnienia
- Pobiera listę zaproszeń
- Renderuje komponent zarządzania

#### Dialog tworzenia zaproszenia
```20:129:e2/app/dashboard/invitations/invitation-dialog.tsx
export function InvitationDialog() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'user' | 'admin' | 'super_admin'>('user')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      toast.error('Nieprawidłowy adres email')
      return
    }

    setIsLoading(true)

    const result = await createInvitation(email.trim().toLowerCase(), role)

    if (result.success) {
      toast.success('Zaproszenie zostało wysłane')
      setOpen(false)
      setEmail('')
      setRole('user')
      // Odśwież stronę
      window.location.reload()
    } else {
      toast.error(result.error || 'Nie udało się wysłać zaproszenia')
    }

    setIsLoading(false)
  }
  // ... reszta komponentu
}
```

Funkcje:
- Formularz z emailem i rolą
- Walidacja emaila
- Wywołanie `createInvitation()`
- Odświeżanie listy po sukcesie

#### Strona rejestracji z tokenem
```14:87:e2/app/(auth)/register/page.tsx
export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Brak tokenu zaproszenia')
        setLoading(false)
        return
      }

      const result = await validateInvitationToken(token)

      if (result.valid && result.email) {
        setEmail(result.email)
        setError(null)
      } else {
        setError(result.error || 'Nieprawidłowy token')
      }

      setLoading(false)
    }

    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error('Brak tokenu zaproszenia')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Hasła nie są identyczne')
      return
    }

    if (password.length < 6) {
      toast.error('Hasło musi mieć co najmniej 6 znaków')
      return
    }

    if (!fullName.trim()) {
      toast.error('Imię i nazwisko jest wymagane')
      return
    }

    setIsSubmitting(true)

    const result = await registerWithInvitation(token, fullName.trim(), password)

    if (result.success) {
      toast.success('Konto zostało utworzone! Możesz się teraz zalogować.')
      router.push('/login')
    } else {
      toast.error(result.error || 'Nie udało się utworzyć konta')
    }

    setIsSubmitting(false)
  }
  // ... reszta komponentu
}
```

Kroki:
1. Pobiera token z URL (`?token=...`)
2. Waliduje token przy załadowaniu
3. Wyświetla email (zablokowane)
4. Zbiera imię i nazwisko oraz hasło
5. Wywołuje `registerWithInvitation()`
6. Przekierowuje do logowania

### 4. System emaili

#### Szablon emaila
```1:73:e2/lib/email/templates/invitation-email.ts
export function generateInvitationEmail(
  fullName: string,
  invitationLink: string,
  expiryDays: number = 7
): string {
  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zaproszenie do airset</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; background-color: #f6f9fc;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1e293b; padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0;">airset</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 24px;">
              <p style="color: #334155; font-size: 16px; line-height: 26px; margin: 0 0 16px;">
                Witaj ${fullName}!
              </p>
              
              <p style="color: #334155; font-size: 16px; line-height: 26px; margin: 0 0 16px;">
                Zostałeś zaproszony do platformy szkoleniowej airset. Aby rozpocząć korzystanie z platformy, kliknij poniższy przycisk i ustaw swoje hasło:
              </p>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${invitationLink}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 6px;">
                      Akceptuj zaproszenie
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #64748b; font-size: 14px; line-height: 20px; margin: 24px 0 8px;">
                Lub skopiuj i wklej poniższy link do przeglądarki:
              </p>
              
              <p style="color: #3b82f6; font-size: 14px; word-break: break-all; margin: 0 0 24px;">
                ${invitationLink}
              </p>
              
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
              
              <p style="color: #64748b; font-size: 14px; line-height: 20px; margin: 0 0 8px;">
                <strong>Ważne:</strong> To zaproszenie jest ważne przez ${expiryDays} dni.
              </p>
              
              <p style="color: #64748b; font-size: 14px; line-height: 20px; margin: 0;">
                Jeśli nie spodziewałeś się tego zaproszenia, możesz zignorować tę wiadomość.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
```

#### Wysyłka emaila (Resend)
```16:47:e2/lib/email/send.ts
export async function sendInvitationEmail({
  to,
  invitationLink,
  expiryDays = 7,
}: SendInvitationEmailParams): Promise<SendEmailResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set in environment variables')
      return { success: false, error: 'RESEND_API_KEY is not configured' }
    }

    const html = generateInvitationEmail('Nowy Użytkownik', invitationLink, expiryDays)

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Zaproszenie do airset - Aktywuj swoje konto',
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    console.log('Email sent successfully:', data)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Unexpected error sending email:', error)
    return { success: false, error: 'Nieoczekiwany błąd podczas wysyłania emaila' }
  }
}
```

### 5. Przepływ działania

1. Tworzenie zaproszenia (admin)
   - Admin wypełnia formularz (email, rola)
   - System tworzy rekord w bazie z tokenem
   - Email z linkiem: `https://airset.pl/register?token={uuid}`

2. Otrzymanie emaila (użytkownik)
   - Otwiera link w przeglądarce

3. Walidacja tokenu (strona rejestracji)
   - Sprawdza token, status `'pending'`, wygaśnięcie
   - Wyświetla formularz z zablokowanym emailem

4. Rejestracja (użytkownik)
   - Wypełnia imię, nazwisko, hasło
   - System tworzy konto przez Admin API z `email_confirm: true`
   - Aktualizuje rolę w profilu
   - Zmienia status zaproszenia na `'accepted'`

5. Logowanie (użytkownik)
   - Loguje się z emailem i hasłem

### 6. Bezpieczeństwo

- RLS — tylko admini mogą zarządzać zaproszeniami
- Token UUID — unikalny i nieprzewidywalny
- Wygaśnięcie — automatyczne po 7 dniach
- Weryfikacja emaila — automatyczna przy rejestracji
- Status zaproszenia — jednorazowe użycie (zmiana na `'accepted'`)
- Walidacja — przed utworzeniem konta

### 7. Pliki systemu

Backend:
- `e2/lib/actions/invitations.ts` — funkcje serwerowe
- `e2/sql/08_create_tutor_invitations.sql` — struktura bazy
- `e2/sql/09_add_role_to_tutor_invitations.sql` — dodanie roli

Frontend:
- `e2/app/dashboard/invitations/page.tsx` — strona zarządzania
- `e2/app/dashboard/invitations/invitations-management.tsx` — komponent zarządzania
- `e2/app/dashboard/invitations/invitation-dialog.tsx` — dialog tworzenia
- `e2/app/(auth)/register/page.tsx` — strona rejestracji

Email:
- `e2/lib/email/templates/invitation-email.ts` — szablon HTML
- `e2/lib/email/send.ts` — wysyłka przez Resend

To kompletny opis systemu zaproszeń w aplikacji.