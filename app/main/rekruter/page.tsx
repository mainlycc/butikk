'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
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
  linkedinUrl: string
  source: string
  message: string
}

const initialState: RecruiterForm = {
  fullName: '',
  email: '',
  company: '',
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
        <section className="py-8 px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Dla firm</p>
                <h1 className="text-3xl font-bold">Rejestracja rekrutera</h1>
                <p className="text-muted-foreground mt-2">
                  Wypełnij formularz, a nasz zespół skontaktuje się z Tobą, aby omówić potrzeby rekrutacyjne.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full md:w-auto">
                <Link href="/main/kandydat">Zgłoś się jako kandydat</Link>
              </Button>
            </div>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Formularz kontaktowy</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Imię i nazwisko *</Label>
                      <Input
                        id="fullName"
                        value={form.fullName}
                        onChange={(e) => handleChange('fullName')(e.target.value)}
                        required
                        placeholder="Jan Kowalski"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
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
                        placeholder="Nazwa firmy"
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

      <Footer />
    </div>
  )
}

