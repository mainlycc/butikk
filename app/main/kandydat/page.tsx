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
  specialization: string
  experience: string
  linkedinUrl: string
  source: string
  message: string
  cvFile?: File | null
}

const initialState: CandidateForm = {
  fullName: '',
  specialization: '',
  experience: '',
  linkedinUrl: '',
  source: '',
  message: '',
  cvFile: null,
}

export default function CandidatePage() {
  const [form, setForm] = useState<CandidateForm>(initialState)

  const handleChange = (field: keyof CandidateForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setForm((prev) => ({ ...prev, cvFile: file }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log('Kandydat form submit', form)
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
                      <Label htmlFor="specialization">Specjalizacja</Label>
                      <Input
                        id="specialization"
                        value={form.specialization}
                        onChange={(e) => handleChange('specialization')(e.target.value)}
                        required
                        placeholder="Frontend, Backend, Data, QA..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Button type="submit" className="w-full md:w-auto">
                      Wyślij zgłoszenie
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}

