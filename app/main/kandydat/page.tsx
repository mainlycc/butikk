'use client'

import { useMemo, useState } from 'react'
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
import { submitCandidateRegistration } from '@/app/actions/submit-candidate-registration'

const sourceOptions = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'social', label: 'Media społecznościowe' },
  { value: 'recommendation', label: 'Polecenie' },
  { value: 'events', label: 'Wydarzenia/konferencje' },
  { value: 'ads', label: 'Reklama online' },
  { value: 'other', label: 'Inne' },
]

type CandidateForm = {
  fullName: string
  email: string
  phone: string
  specialization: string
  experience: string
  linkedinUrl: string
  source: string
  message: string
  cvFile?: File | null
}

const initialState: CandidateForm = {
  fullName: '',
  email: '',
  phone: '',
  specialization: '',
  experience: '',
  linkedinUrl: '',
  source: '',
  message: '',
  cvFile: null,
}

export default function CandidatePage() {
  const [form, setForm] = useState<CandidateForm>(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: keyof CandidateForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setForm((prev) => ({ ...prev, cvFile: file }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    // Debug: loguj wartości formularza
    console.log('Form values:', {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      cvFile: form.cvFile ? form.cvFile.name : 'brak',
    })
    
    // Walidacja wymaganych pól
    const trimmedFullName = form.fullName?.trim() || ''
    const trimmedEmail = form.email?.trim() || ''
    const trimmedPhone = form.phone?.trim() || ''

    if (!trimmedFullName) {
      toast.error('Proszę wypełnić pole "Imię i nazwisko"')
      return
    }

    if (!trimmedEmail) {
      toast.error('Proszę wypełnić pole "Email"')
      return
    }

    if (!trimmedPhone) {
      toast.error('Proszę wypełnić pole "Numer telefonu"')
      return
    }

    if (!form.cvFile) {
      toast.error('Proszę załączyć plik CV')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('fullName', trimmedFullName)
      formData.append('email', trimmedEmail)
      formData.append('phone', trimmedPhone)
      formData.append('specialization', form.specialization?.trim() || '')
      formData.append('experience', form.experience?.trim() || '')
      formData.append('linkedinUrl', form.linkedinUrl?.trim() || '')
      formData.append('source', form.source || '')
      formData.append('message', form.message?.trim() || '')
      formData.append('cvFile', form.cvFile)

      console.log('Sending form data...')
      const result = await submitCandidateRegistration(formData)
      console.log('Result:', result)

      if (result.success) {
        toast.success('Zgłoszenie zostało wysłane! Nasz zespół skontaktuje się z Tobą wkrótce.')
        setForm(initialState)
        // Reset file input
        const fileInput = document.getElementById('cvFile') as HTMLInputElement
        if (fileInput) fileInput.value = ''
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

  const cvLabel = useMemo(() => {
    if (form.cvFile) return form.cvFile.name
    return 'Dodaj CV (PDF/DOCX)'
  }, [form.cvFile])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <main className="flex-1">
        <section className="py-8 px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Dla kandydatów</p>
                <h1 className="text-3xl font-bold">Rejestracja kandydata</h1>
                <p className="text-muted-foreground mt-2">
                  Dołącz do naszej bazy talentów. Podaj podstawowe informacje, a odezwiemy się z dopasowanymi ofertami.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full md:w-auto">
                <Link href="/main/rekruter">Zgłoś firmę</Link>
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
                        placeholder="Anna Nowak"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange('email')(e.target.value)}
                        placeholder="anna.nowak@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Numer telefonu *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => handleChange('phone')(e.target.value)}
                        placeholder="+48 600 000 000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specjalizacja</Label>
                      <Input
                        id="specialization"
                        value={form.specialization}
                        onChange={(e) => handleChange('specialization')(e.target.value)}
                        placeholder="Frontend, Backend, Data, QA..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Lata doświadczenia</Label>
                      <Input
                        id="experience"
                        type="number"
                        min={0}
                        max={50}
                        value={form.experience}
                        onChange={(e) => handleChange('experience')(e.target.value)}
                        placeholder="np. 5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedinUrl">LinkedIn (opcjonalnie)</Label>
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
                    <Label htmlFor="cvFile">CV *</Label>
                    <div className="space-y-2">
                      <Input id="cvFile" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                      <p className="text-sm text-muted-foreground">Dodaj aktualne CV. Akceptujemy PDF/DOCX.</p>
                      <p className="text-sm text-foreground">{cvLabel}</p>
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
                      placeholder="Dodaj link do portfolio lub krótko opisz swój profil."
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

