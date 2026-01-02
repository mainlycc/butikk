'use client'

import { useMemo, useState } from 'react'
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
    
    if (!form.cvFile) {
      toast.error('Proszę załączyć plik CV')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('fullName', form.fullName)
      formData.append('email', form.email)
      formData.append('specialization', form.specialization)
      formData.append('experience', form.experience)
      formData.append('linkedinUrl', form.linkedinUrl || '')
      formData.append('source', form.source || '')
      formData.append('message', form.message || '')
      formData.append('cvFile', form.cvFile)

      const result = await submitCandidateRegistration(formData)

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
        <section className="py-12 px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Dla kandydatów</p>
                <h1 className="text-3xl font-bold">Rejestracja kandydata</h1>
                <p className="text-muted-foreground mt-2">
                  Dołącz do naszej bazy talentów. Podaj podstawowe informacje, a odezwiemy się z dopasowanymi ofertami.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/main/rekruter">Zgłoś firmę</Link>
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
                        placeholder="Anna Nowak"
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
                        placeholder="anna.nowak@example.com"
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
                        required
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
                        required
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
                    <Label htmlFor="cvFile">CV</Label>
                    <div className="space-y-2">
                      <Input id="cvFile" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} required />
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

