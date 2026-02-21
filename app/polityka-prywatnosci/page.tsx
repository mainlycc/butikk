import type { Metadata } from 'next'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qualibase.pl'

export const metadata: Metadata = {
  title: 'Polityka prywatności',
  description:
    'Polityka prywatności platformy QualiBase – informacje o przetwarzaniu danych osobowych kandydatów i rekruterów.',
  alternates: {
    canonical: `${baseUrl}/polityka-prywatnosci`,
  },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <main className="flex-1 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
            Polityka prywatności
          </h1>

          <p className="text-sm text-muted-foreground mb-8">
            Ostatnia aktualizacja: 04.02.2026
          </p>

          <div className="space-y-8 text-sm sm:text-base leading-relaxed text-muted-foreground">
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                1. Informacje ogólne
              </h2>
              <p>
                Niniejsza Polityka Prywatności określa zasady przetwarzania danych osobowych przez serwis
                internetowy prowadzony przez Deskset, z siedzibą w Krakowie (dalej: „Administrator”).
              </p>
              <p>
                Administrator dokłada szczególnej staranności w celu ochrony prywatności Użytkowników oraz
                bezpieczeństwa przetwarzanych danych osobowych, zgodnie z obowiązującymi przepisami prawa, w
                szczególności Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 („RODO”).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                2. Administrator danych
              </h2>
              <p>Administratorem danych osobowych jest:</p>
              <p>
                Deskset Sp. z o.o.
                <br />
                siedziba: Kraków, Polska
                <br />
                e-mail kontaktowy: dominik.nowicki@qualibase.pl
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                3. Zakres przetwarzanych danych
              </h2>
              <p>
                W ramach funkcjonowania serwisu Administrator przetwarza dane osobowe w następujących
                kategoriach:
              </p>
              <p className="font-semibold">a) Dane Kandydatów</p>
              <p>
                Administrator przetwarza dane osobowe przekazane dobrowolnie przez Kandydatów, w szczególności
                dane zawarte w dokumentach aplikacyjnych oraz w profilu kandydata, obejmujące informacje
                dotyczące kwalifikacji zawodowych, doświadczenia, umiejętności oraz inne dane niezbędne do
                realizacji celów rekrutacyjnych.
              </p>
              <p>
                Dane Kandydatów prezentowane Rekruterom w ramach serwisu mają charakter zanonimizowany i nie
                umożliwiają bezpośredniej identyfikacji osoby fizycznej.
              </p>
              <p className="font-semibold">b) Dane Rekruterów (Użytkowników serwisu)</p>
              <p>
                Administrator przetwarza dane identyfikacyjne, kontaktowe oraz dane związane z zatrudnieniem lub
                reprezentowaniem podmiotu gospodarczego, przekazane w związku z rejestracją i korzystaniem z
                konta użytkownika w serwisie.
              </p>
              <p className="font-semibold">c) Dane przetwarzane w ramach kontaktu</p>
              <p>
                Administrator przetwarza dane identyfikacyjne oraz kontaktowe przekazane za pośrednictwem
                formularza kontaktowego lub w ramach bezpośredniej korespondencji z Administratorem.
              </p>
              <p className="font-semibold">d) Dane techniczne i statystyczne</p>
              <p>
                Podczas korzystania z serwisu mogą być przetwarzane dane techniczne oraz statystyczne, w tym
                dane dotyczące sposobu korzystania z serwisu, w celu zapewnienia jego prawidłowego działania,
                analizy oraz optymalizacji.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                4. Cele przetwarzania danych
              </h2>
              <p>Dane osobowe przetwarzane są w celu:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>prowadzenia i obsługi portalu rekrutacyjnego,</li>
                <li>umożliwienia Rekruterom dostępu do anonimizowanej bazy Kandydatów,</li>
                <li>tworzenia i obsługi kont użytkowników,</li>
                <li>kontaktu za pośrednictwem formularza kontaktowego,</li>
                <li>realizacji działań marketingowych i analitycznych (SEO, Google Ads, narzędzia AI),</li>
                <li>poprawy funkcjonowania i bezpieczeństwa serwisu.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                5. Podstawa prawna przetwarzania
              </h2>
              <p>Dane osobowe przetwarzane są na podstawie:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>art. 6 ust. 1 lit. a RODO – zgoda osoby, której dane dotyczą,</li>
                <li>art. 6 ust. 1 lit. b RODO – wykonanie umowy lub podjęcie działań przed jej zawarciem,</li>
                <li>
                  art. 6 ust. 1 lit. f RODO – prawnie uzasadniony interes Administratora (np. analiza statystyczna,
                  marketing, bezpieczeństwo serwisu).
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                6. Odbiorcy danych
              </h2>
              <p>Dane osobowe mogą być przekazywane:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>podmiotom świadczącym usługi IT, hostingowe i analityczne,</li>
                <li>dostawcom narzędzi marketingowych (np. Google),</li>
                <li>dostawcom rozwiązań opartych na sztucznej inteligencji.</li>
              </ul>
              <p>
                Dane nie są sprzedawane ani udostępniane podmiotom trzecim w celach niezwiązanych z
                funkcjonowaniem serwisu.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                7. Przekazywanie danych poza UE
              </h2>
              <p>
                W związku z korzystaniem z narzędzi takich jak Google Ads lub rozwiązań AI, dane mogą być
                przekazywane poza Europejski Obszar Gospodarczy. W takim przypadku Administrator stosuje
                odpowiednie zabezpieczenia, zgodnie z RODO (np. standardowe klauzule umowne).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                8. Prawa osób, których dane dotyczą
              </h2>
              <p>Każda osoba, której dane są przetwarzane, ma prawo do:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>dostępu do swoich danych,</li>
                <li>ich sprostowania,</li>
                <li>usunięcia („prawo do bycia zapomnianym”),</li>
                <li>ograniczenia przetwarzania,</li>
                <li>przenoszenia danych,</li>
                <li>wniesienia sprzeciwu wobec przetwarzania,</li>
                <li>cofnięcia zgody w dowolnym momencie,</li>
                <li>wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                9. Pliki cookies
              </h2>
              <p>Serwis wykorzystuje pliki cookies w celu:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>zapewnienia prawidłowego działania strony,</li>
                <li>prowadzenia statystyk i analiz (Google Analytics),</li>
                <li>realizacji kampanii reklamowych (Google Ads),</li>
                <li>optymalizacji treści i działań marketingowych.</li>
              </ul>
              <p>
                Użytkownik może w każdej chwili zmienić ustawienia cookies w swojej przeglądarce.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                10. Zabezpieczenia danych
              </h2>
              <p>
                Administrator stosuje odpowiednie środki techniczne i organizacyjne w celu ochrony danych
                osobowych, w szczególności:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>szyfrowanie połączeń (SSL),</li>
                <li>ograniczony dostęp do danych,</li>
                <li>procedury bezpieczeństwa IT.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                11. Zmiany polityki prywatności
              </h2>
              <p>
                Administrator zastrzega sobie prawo do wprowadzania zmian w Polityce Prywatności. Aktualna
                wersja dokumentu zawsze dostępna jest na stronie internetowej serwisu.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

