import { TopNav } from '@/components/layout/top-nav'

export default function ONasPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">O nas</h1>
          <div className="space-y-4 text-lg text-muted-foreground">
            <p>
              QualiBase to platforma dla rekruterów i kandydatów z branży IT, która ułatwia
              procesy rekrutacyjne i wspiera rozwój zawodowy. Niektóre funkcjonalności są
              dostępne wyłącznie dla zalogowanych użytkowników. Zachęcamy do rejestracji, aby
              w pełni korzystać z możliwości platformy.
            </p>
            <p>
              Cenimy każde zgłoszenie i każdego użytkownika. Mamy nadzieję, że QualiBase
              będzie wartościowym wsparciem w Twojej karierze lub procesach rekrutacyjnych.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

