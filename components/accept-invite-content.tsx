"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { acceptInvitation, getInvitation } from "@/app/actions/accept-invitation"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export function AcceptInviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [invitation, setInvitation] = useState<{ email: string; role?: string } | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    async function checkInvitation() {
      if (!token) {
        setError("Brak tokenu zaproszenia")
        setLoading(false)
        return
      }

      const result = await getInvitation(token)
      if (!result.success) {
        setError('error' in result ? (result.error ?? "Błąd") : "Błąd")
        setLoading(false)
        return
      }

      setInvitation(result.invitation)
      setLoading(false)
    }

    checkInvitation()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!invitation) {
      setError("Brak danych zaproszenia. Odśwież stronę i spróbuj ponownie.")
      return
    }

    if (password.length < 6) {
      setError("Hasło musi mieć co najmniej 6 znaków")
      return
    }

    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne")
      return
    }

    setSubmitting(true)

    const result = await acceptInvitation(token!, invitation.email, password)

    if (!result.success) {
      setError('error' in result ? (result.error ?? "Błąd podczas akceptowania zaproszenia") : "Błąd podczas akceptowania zaproszenia")
      setSubmitting(false)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      router.push("/database")
    }, 2000)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <Card className="w-full max-w-md border-slate-700 bg-slate-800/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <h2 className="text-2xl font-bold text-white">Konto utworzone!</h2>
              <p className="text-slate-400">Przekierowywanie do aplikacji...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <Card className="w-full max-w-md border-slate-700 bg-slate-800/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <h2 className="text-2xl font-bold text-white">Błąd</h2>
              <p className="text-slate-400">{error}</p>
              <Button onClick={() => router.push("/")} className="mt-4">
                Wróć do strony głównej
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Zaproszenie do Butik Kandydatów</CardTitle>
          <CardDescription className="text-slate-400">
            Zostałeś zaproszony jako{" "}
            <strong className="text-blue-400">{invitation?.role === "admin" ? "Administrator" : "Użytkownik"}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={invitation?.email || ""}
                disabled
                className="bg-slate-700/50 border-slate-600 text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Hasło
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 znaków"
                required
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-300">
                Potwierdź hasło
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Powtórz hasło"
                required
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Tworzenie konta...
                </>
              ) : (
                "Utwórz konto"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
