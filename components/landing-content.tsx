"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/client"
import { Users, Mail, Search, FileText, AlertCircle } from "lucide-react"

interface LandingContentProps {
  infoData: {
    title: string
    description: string
    instructions: string[]
  }
  hideGuide?: boolean
}

export default function LandingContent({ infoData, hideGuide = false }: LandingContentProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim() || !email.includes("@")) {
      setError("Proszę wprowadzić poprawny adres e-mail")
      return
    }

    if (!password) {
      setError("Proszę wprowadzić hasło")
      return
    }

    setIsLoading(true)

    const supabase = getSupabaseBrowserClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError("Nieprawidłowy email lub hasło")
      setIsLoading(false)
      return
    }

    // Odśwież router, aby upewnić się, że cookies są zsynchronizowane
    router.refresh()
    // Użyj window.location zamiast router.push, aby wymusić pełne przeładowanie
    window.location.href = "/database"
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-background via-accent/30 to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-32">
          <div className="text-center space-y-8">
            {infoData.title.trim() ? (
              <div className="inline-block">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-balance">
                    {infoData.title}
                  </h1>
                </div>
              </div>
            ) : null}

            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed">
              {infoData.description}
            </p>

            <Card className="max-w-md mx-auto shadow-xl border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Zaloguj się</CardTitle>
                <CardDescription>Wprowadź swoje dane logowania</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="twoj.email@firma.pl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 text-lg"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Hasło"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 text-lg"
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={isLoading}>
                    {isLoading ? "Logowanie..." : "Zaloguj się"}
                  </Button>

                  <div className="text-center pt-2">
                    <Link
                      href="/reset-password"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Zapomniałem hasła
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {!hideGuide && (
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-balance">Jak korzystać z systemu</h2>
            <p className="text-lg text-muted-foreground text-balance">
              Prosty i intuicyjny proces wyszukiwania kandydatów
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Mail,
                title: "Zaloguj się",
                description: "Wprowadź swój adres e-mail, aby rozpocząć",
              },
              {
                icon: Search,
                title: "Filtruj kandydatów",
                description: "Użyj wyszukiwarki, aby znaleźć idealnych kandydatów",
              },
              {
                icon: FileText,
                title: "Przeglądaj CV",
                description: "Wyświetl CV wybranych kandydatów w formie slajdów",
              },
              {
                icon: Users,
                title: "Wyślij zapytanie",
                description: "Wyślij zapytanie bezpośrednio do wybranych kandydatów",
              },
            ].map((feature, idx) => (
              <Card key={idx} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Instructions */}
          {infoData.instructions.length > 0 && (
            <Card className="mt-16 border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Instrukcje</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {infoData.instructions.map((instruction, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-semibold text-primary">{idx + 1}</span>
                      </div>
                      <p className="text-base leading-relaxed">{instruction}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
