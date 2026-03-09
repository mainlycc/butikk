'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Trash2, Users, ShieldCheck } from 'lucide-react'
import type { AdminUser } from '@/lib/actions/users'
import { deleteUsers } from '@/lib/actions/users'

interface UsersManagementProps {
  users: AdminUser[]
}

export function UsersManagement({ users: initialUsers }: UsersManagementProps) {
  const [users, setUsers] = useState(initialUsers)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(users.map((u) => u.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error('Wybierz przynajmniej jednego użytkownika')
      return
    }

    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedIds.length === 0) {
      setIsConfirmOpen(false)
      return
    }

    setIsProcessing(true)
    const result = await deleteUsers(selectedIds)

    if (result.success) {
      toast.success(`Usunięto ${selectedIds.length} użytkowników`)
      setUsers(users.filter((u) => !selectedIds.includes(u.id)))
      setSelectedIds([])
      setIsConfirmOpen(false)
    } else {
      toast.error(result.error || 'Nie udało się usunąć użytkowników')
    }

    setIsProcessing(false)
  }

  const allSelected = selectedIds.length > 0 && selectedIds.length === users.length

  const formatDateTime = (value: string | null) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-7 w-7" />
            Użytkownicy
          </h1>
          <p className="text-muted-foreground">
            Zarządzaj kontami użytkowników i dostępem do platformy
          </p>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                Zaznaczono {selectedIds.length} użytkowników
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={isProcessing}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Usuń zaznaczonych
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            Lista użytkowników
          </CardTitle>
          <CardDescription>
            Tutaj zobaczysz wszystkich użytkowników mających dostęp do platformy. Usunięcie użytkownika powoduje
            trwałe skasowanie konta i utratę dostępu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Brak użytkowników</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rola</TableHead>
                  <TableHead>Data utworzenia</TableHead>
                  <TableHead>Ostatnie logowanie</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(user.id)}
                        onCheckedChange={(checked) => handleSelectOne(user.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Administrator' : 'Użytkownik'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(user.created_at)}</TableCell>
                    <TableCell>{formatDateTime(user.last_login)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isConfirmOpen} onOpenChange={(open) => !isProcessing && setIsConfirmOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usunąć użytkowników?</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz trwale usunąć{' '}
              <span className="font-semibold text-foreground">{selectedIds.length}</span>{' '}
              {selectedIds.length === 1 ? 'użytkownika' : 'użytkowników'}? Tej operacji nie można cofnąć,
              a osoby te stracą dostęp do platformy.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isProcessing}
            >
              Anuluj
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isProcessing}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


