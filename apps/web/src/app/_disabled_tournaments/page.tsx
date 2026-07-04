import Link from 'next/link'
import { TOURNAMENTS } from '@/lib/tournament-data'

export const metadata = { title: 'Tournaments' }

export default function TournamentsPage() {
  return (
    <div className="min-h-screen bg-[#1A1D2E] text-white">
      <header className="border-b border-white/8 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-black tracking-tight">
          Court <span className="text-[#A8D634]">IQ</span>
        </span>
        <Link href="/" className="text-sm text-white/40 hover:text-white transition-colors">
          ← Home
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-8">Tournaments</h1>

        <div className="flex flex-col gap-4">
          {TOURNAMENTS.map((t) => (
            <Link
              key={t.id}
              href={`/tournaments/${t.slug}`}
              className="block rounded-xl bg-[#242638] border border-white/8 px-6 py-5 hover:border-[#A8D634]/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold text-lg">{t.name}</h2>
                  <p className="text-sm text-white/50 mt-1">{t.venue}</p>
                  <p className="text-sm text-white/40">{t.date}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#A8D634]/20 text-[#A8D634] border border-[#A8D634]/30 font-medium whitespace-nowrap">
                  {t.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
