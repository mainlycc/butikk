import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
