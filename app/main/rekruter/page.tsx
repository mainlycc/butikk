'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TopNav } from '@/components/layout/top-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Globe, Mail, Share2, Network } from 'lucide-react'
import { toast } from 'sonner'
import { submitRecruiterRegistration } from '@/app/actions/submit-recruiter-registration'

const sourceOptions = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'social', label: 'Media społecznościowe' },
  { value: 'recommendation', label: 'Polecenie' },
  { value: 'events', label: 'Wydarzenia/konferencje' },
  { value: 'ads', label: 'Reklama online' },
  { value: 'other', label: 'Inne' },
]

type RecruiterForm = {
  fullName: string
  email: string
  company: string
  companyUrl: string
  linkedinUrl: string
  source: string
  message: string
}

const initialState: RecruiterForm = {
  fullName: '',
  email: '',
  company: '',
  companyUrl: '',
  linkedinUrl: '',
  source: '',
  message: '',
}

export default function RecruiterPage() {
  const [form, setForm] = useState<RecruiterForm>(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: keyof RecruiterForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('fullName', form.fullName)
      formData.append('email', form.email)
      formData.append('company', form.company)
      formData.append('companyUrl', form.companyUrl)
      formData.append('linkedinUrl', form.linkedinUrl)
      formData.append('source', form.source || '')
      formData.append('message', form.message || '')

      const result = await submitRecruiterRegistration(formData)

      if (result.success) {
        toast.success('Zgłoszenie zostało wysłane! Nasz zespół skontaktuje się z Tobą wkrótce.')
        setForm(initialState)
      } else {
        toast.error(result.error || 'Nie udało się wysłać zgłoszenia. Spróbuj ponownie.')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Wystąpił błąd. Spróbuj ponownie.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <main className="flex-1">
        <section className="py-12 px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Dla firm</p>
                <h1 className="text-3xl font-bold">Rejestracja rekrutera</h1>
                <p className="text-muted-foreground mt-2">
                  Wypełnij formularz, a nasz zespół skontaktuje się z Tobą, aby omówić potrzeby rekrutacyjne.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/main/kandydat">Zgłoś się jako kandydat</Link>
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Formularz kontaktowy</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Imię i nazwisko</Label>
                      <Input
                        id="fullName"
                        value={form.fullName}
                        onChange={(e) => handleChange('fullName')(e.target.value)}
                        required
                        placeholder="Jan Kowalski"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange('email')(e.target.value)}
                        required
                        placeholder="jan.kowalski@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Firma</Label>
                      <Input
                        id="company"
                        value={form.company}
                        onChange={(e) => handleChange('company')(e.target.value)}
                        required
                        placeholder="Nazwa firmy"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyUrl">Link do strony firmy</Label>
                      <Input
                        id="companyUrl"
                        type="url"
                        value={form.companyUrl}
                        onChange={(e) => handleChange('companyUrl')(e.target.value)}
                        required
                        placeholder="https://"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedinUrl">Link do LinkedIn</Label>
                      <Input
                        id="linkedinUrl"
                        type="url"
                        value={form.linkedinUrl}
                        onChange={(e) => handleChange('linkedinUrl')(e.target.value)}
                        required
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="source">Skąd o nas wiesz?</Label>
                    <Select value={form.source} onValueChange={handleChange('source')}>
                      <SelectTrigger id="source">
                        <SelectValue placeholder="Wybierz opcję" />
                      </SelectTrigger>
                      <SelectContent>
                        {sourceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Dodatkowe informacje</Label>
                    <Textarea
                      id="message"
                      value={form.message}
                      onChange={(e) => handleChange('message')(e.target.value)}
                      placeholder="Opisz potrzeby rekrutacyjne, liczbę stanowisk, wymagania itp."
                      rows={4}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                      {isSubmitting ? 'Wysyłanie...' : 'Wyślij zgłoszenie'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t pt-16 pb-8 px-4 sm:px-10">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-foreground">
              <Network className="text-primary w-6 h-6" />
              <h3 className="text-lg font-bold">Qualibase</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Nowoczesna platforma rekrutacyjna dla branży IT.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-foreground text-sm font-bold uppercase tracking-wide">Platforma</h4>
            <Link href="#" className="text-muted-foreground text-sm hover:text-primary">
              Przeglądaj oferty
            </Link>
            <Link href="#" className="text-muted-foreground text-sm hover:text-primary">
              Baza kandydatów
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-foreground text-sm font-bold uppercase tracking-wide">Firma</h4>
            <Link href="#" className="text-muted-foreground text-sm hover:text-primary">
              O nas
            </Link>
            <Link href="#" className="text-muted-foreground text-sm hover:text-primary">
              Kontakt
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-foreground text-sm font-bold uppercase tracking-wide">Social</h4>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Globe className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Share2 className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© 2024 Qualibase Inc. Wszelkie prawa zastrzeżone.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
              Polityka Prywatności
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
              Regulamin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

