'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export type AdminUser = {
  id: string
  email: string
  role: 'admin' | 'user'
  created_at: string | null
  last_login: string | null
}

export async function getUsersForAdmin(): Promise<AdminUser[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('users')
    .select('id, email, role, created_at, last_login')
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('Error fetching users for admin:', error)
    return []
  }

  return data as AdminUser[]
}

export async function deleteUsers(ids: string[]): Promise<{ success: boolean; error?: string }> {
  if (!ids || ids.length === 0) {
    return { success: false, error: 'Brak użytkowników do usunięcia' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  const adminClient = createAdminClient()

  // Usuń użytkowników z Auth
  for (const id of ids) {
    try {
      const { error: authError } = await adminClient.auth.admin.deleteUser(id)
      if (authError) {
        console.error(`Failed to delete auth user ${id}:`, authError)
      }
    } catch (e) {
      console.error(`Unexpected error deleting auth user ${id}:`, e)
    }
  }

  // Usuń wpisy z tabeli users
  const { error: dbError } = await adminClient
    .from('users')
    .delete()
    .in('id', ids)

  if (dbError) {
    console.error('Error deleting users from table:', dbError)
    return { success: false, error: 'Nie udało się usunąć użytkowników z bazy' }
  }

  revalidatePath('/dashboard/users')
  return { success: true }
}


