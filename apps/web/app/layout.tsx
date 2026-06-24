import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Court IQ — Score it live. Run it smart.',
    template: '%s | Court IQ',
  },
  description:
    'The smartest tournament management platform for pickleball. Automate scoring, seeding, playoffs, and DUPR submissions in one place.',
  keywords: ['pickleball', 'tournament', 'scoring', 'DUPR', 'court management'],
  authors: [{ name: 'Court IQ' }],
  creator: 'Court IQ',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://courtiq.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://courtiq.app',
    title: 'Court IQ',
    description: 'Score it live. Run it smart.',
    siteName: 'Court IQ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Court IQ',
    description: 'Score it live. Run it smart.',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#a8d634',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: 'hsl(222 47% 13%)',
              border: '1px solid hsl(222 47% 20%)',
              color: 'hsl(210 40% 98%)',
            },
          }}
        />
      </body>
    </html>
  )
}
