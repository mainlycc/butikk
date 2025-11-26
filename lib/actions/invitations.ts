'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendInvitationEmail } from '@/lib/email/send'

export type Invitation = {
  id: string
  email: string
  token: string
  status: 'pending' | 'accepted' | 'expired'
  role: 'user' | 'admin'
  created_by: string
  expires_at: string
  created_at: string
  updated_at: string
}

export type CreateInvitationResult = {
  success: boolean
  error?: string
  invitation?: Invitation
}

export type ValidateTokenResult = {
  valid: boolean
  error?: string
  email?: string
  role?: 'user' | 'admin'
}

export type RegisterResult = {
  success: boolean
  error?: string
}

export async function createInvitation(
  email: string,
  role: 'user' | 'admin' = 'user'
): Promise<CreateInvitationResult> {
  const supabase = await createClient()

  // Sprawdź czy użytkownik jest adminem
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Nie jesteś zalogowany' }
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!currentUser || currentUser.role !== 'admin') {
    return { success: false, error: 'Brak uprawnień' }
  }

  // Sprawdź czy email już nie istnieje w systemie
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    return { success: false, error: 'Użytkownik z tym adresem email już istnieje' }
  }

  // Sprawdź czy istnieje aktywne zaproszenie dla tego emaila
  const { data: existingInvitation } = await supabase
    .from('invitations')
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

  // Generuj unikalny token
  const token = crypto.randomUUID()

  // Utwórz zaproszenie
  const { data: invitation, error } = await supabase
    .from('invitations')
    .insert({
      email,
      token,
      role,
      status: 'pending',
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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const invitationLink = `${baseUrl}/register?token=${invitation.token}`

  const emailResult = await sendInvitationEmail({
    to: email,
    invitationLink,
    expiryDays: 7,
  })

  if (!emailResult.success) {
    console.error('Failed to send invitation email:', emailResult.error)
    // Kontynuujemy - zaproszenie jest już utworzone, użytkownik może skopiować link ręcznie
  } else {
    console.log('Invitation email sent successfully to:', email)
  }

  revalidatePath('/dashboard/invitations')
  return { success: true, invitation: invitation as Invitation }
}

export async function validateInvitationToken(token: string): Promise<ValidateTokenResult> {
  const supabase = await createClient()

  console.log('Validating invitation token:', token)

  let invitation
  let error

  // Próbuj użyć zwykłego klienta (policy powinna pozwalać na odczyt pending zaproszeń)
  const { data, error: fetchError } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .single()

  invitation = data
  error = fetchError

  // Jeśli RLS blokuje dostęp, użyj admin clienta jako fallback
  if (error && error.code === 'PGRST301' || error?.message?.includes('permission')) {
    console.log('RLS blocked access, using admin client as fallback')
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminClient = createAdminClient()
    
    const { data: adminData, error: adminError } = await adminClient
      .from('invitations')
      .select('*')
      .eq('token', token)
      .single()

    invitation = adminData
    error = adminError
  }

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
    // Aktualizuj status na expired używając admin clienta (aby ominąć RLS)
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminClient = createAdminClient()
    
    await adminClient
      .from('invitations')
      .update({ status: 'expired' })
      .eq('id', invitation.id)

    return { valid: false, error: 'To zaproszenie wygasło' }
  }

  return { valid: true, email: invitation.email, role: invitation.role as 'user' | 'admin' }
}

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
    .from('invitations')
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

  // Utwórz rekord użytkownika w tabeli users
  const { error: userError } = await adminClient
    .from('users')
    .insert({
      id: authData.user.id,
      email: userEmail,
      role: userRole,
      invited_by: invitation.created_by,
      invited_at: new Date().toISOString(),
    })

  if (userError) {
    console.error('Error creating user record:', userError)
    // Nie przerywamy - konto zostało utworzone, tylko rekord w users może być niepoprawny
  }

  // Aktualizuj rolę użytkownika jeśli trigger nadpisał (używamy admin clienta aby ominąć RLS)
  const { error: roleUpdateError } = await adminClient
    .from('users')
    .update({ role: userRole })
    .eq('id', authData.user.id)

  if (roleUpdateError) {
    console.error('Error updating user role:', roleUpdateError)
    // Nie przerywamy - konto zostało utworzone, tylko rola może być niepoprawna
  }

  // Aktualizuj status zaproszenia używając funkcji bazy danych (omija RLS)
  // Używamy admin clienta aby mieć pewność, że RLS nie blokuje
  const { error: updateError } = await adminClient.rpc('accept_invitation_by_token', {
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

export async function getInvitations(): Promise<Invitation[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!currentUser || currentUser.role !== 'admin') {
    return []
  }

  const { data: invitations, error } = await supabase
    .from('invitations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invitations:', error)
    return []
  }

  return (invitations || []) as Invitation[]
}

export async function resendInvitations(ids: string[]): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Nie jesteś zalogowany' }
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!currentUser || currentUser.role !== 'admin') {
    return { success: false, error: 'Brak uprawnień' }
  }

  // Pobierz zaproszenia
  const { data: invitations, error } = await supabase
    .from('invitations')
    .select('*')
    .in('id', ids)

  if (error || !invitations) {
    return { success: false, error: 'Nie udało się pobrać zaproszeń' }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Wyślij ponownie email dla każdego zaproszenia
  for (const invitation of invitations) {
    if (invitation.status === 'pending') {
      const invitationLink = `${baseUrl}/register?token=${invitation.token}`
      await sendInvitationEmail({
        to: invitation.email,
        invitationLink,
        expiryDays: 7,
      })
    }
  }

  revalidatePath('/dashboard/invitations')
  return { success: true }
}

export async function deleteInvitations(ids: string[]): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Nie jesteś zalogowany' }
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!currentUser || currentUser.role !== 'admin') {
    return { success: false, error: 'Brak uprawnień' }
  }

  const { error } = await supabase
    .from('invitations')
    .delete()
    .in('id', ids)

  if (error) {
    console.error('Error deleting invitations:', error)
    return { success: false, error: 'Nie udało się usunąć zaproszeń' }
  }

  revalidatePath('/dashboard/invitations')
  return { success: true }
}

export async function cancelInvitation(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Nie jesteś zalogowany' }
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!currentUser || currentUser.role !== 'admin') {
    return { success: false, error: 'Brak uprawnień' }
  }

  const { error } = await supabase
    .from('invitations')
    .update({ status: 'expired' })
    .eq('id', id)

  if (error) {
    console.error('Error canceling invitation:', error)
    return { success: false, error: 'Nie udało się anulować zaproszenia' }
  }

  revalidatePath('/dashboard/invitations')
  return { success: true }
}

