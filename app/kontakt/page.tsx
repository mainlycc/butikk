import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qualibase.pl'

export const metadata: Metadata = {
  title: 'Kontakt',
  description:
    'Skontaktuj się z Deskset Sp. z o.o. – operatorem platformy QualiBase. Dane kontaktowe, adres siedziby oraz informacje rejestrowe spółki.',
  alternates: {
    canonical: `${baseUrl}/main#kontakt`,
  },
}

export default function ContactPage() {
  redirect('/main#kontakt')
}

