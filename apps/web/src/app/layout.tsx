import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { Providers } from '@/components/providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Court IQ — Score it live. Run it smart.',
    template: '%s | Court IQ',
  },
  description:
    'The smartest tournament management platform for pickleball. Automate scoring, seeding, playoffs, and DUPR submissions — all in real time.',
  keywords: ['pickleball', 'tournament management', 'DUPR', 'scoring', 'Court IQ'],
  authors: [{ name: 'Court IQ' }],
  creator: 'Court IQ',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'Court IQ — Score it live. Run it smart.',
    description: 'Automate your entire pickleball tournament — from first serve to DUPR upload.',
    siteName: 'Court IQ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Court IQ',
    description: 'The smartest tournament platform for pickleball.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#A8D634',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1f2e',
                border: '1px solid #2a3144',
                color: '#f0f4f8',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
