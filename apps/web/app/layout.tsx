import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { Providers } from '@/components/providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Court IQ — Score it live. Run it smart.',
    template: '%s | Court IQ',
  },
  description:
    'The intelligent tournament platform for pickleball. Automate scoring, seeding, playoffs, and DUPR submissions in real time.',
  keywords: ['pickleball', 'tournament', 'scoring', 'DUPR', 'live score', 'court management'],
  openGraph: {
    title: 'Court IQ',
    description: 'Score it live. Run it smart.',
    type: 'website',
    siteName: 'Court IQ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Court IQ',
    description: 'Score it live. Run it smart.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast: 'font-sans',
                success: 'border-brand-green/30 bg-brand-green/5',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
