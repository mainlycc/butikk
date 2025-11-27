"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { requestPasswordReset } from "@/app/actions/reset-password"
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!email.trim() || !email.includes("@")) {
      setError("Proszę wprowadzić poprawny adres e-mail")
      return
    }

    setIsLoading(true)

    const result = await requestPasswordReset(email.trim())

    if (result.success) {
      setSuccess(true)
      setEmail("")
    } else {
      setError(result.error || "Wystąpił błąd podczas wysyłania żądania resetu hasła")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-accent/30 to-background p-6">
      <Card className="w-full max-w-md shadow-xl border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Resetowanie hasła</CardTitle>
          <CardDescription>Wprowadź adres e-mail, aby otrzymać link do resetowania hasła</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <p>
                  Jeśli konto z tym adresem email istnieje, wysłaliśmy link do resetowania hasła. Sprawdź swoją
                  skrzynkę pocztową.
                </p>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Link jest ważny przez 1 godzinę.</p>
                <p>Jeśli nie otrzymałeś emaila, sprawdź folder spam lub spróbuj ponownie później.</p>
              </div>
              <Button onClick={() => router.push("/")} variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Powrót do logowania
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="twoj.email@firma.pl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-lg"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={isLoading}>
                {isLoading ? "Wysyłanie..." : "Wyślij link resetowania"}
              </Button>

              <div className="text-center">
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
                  <ArrowLeft className="h-4 w-4 inline mr-1" />
                  Powrót do logowania
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

