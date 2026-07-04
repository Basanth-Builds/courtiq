import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTournamentBySlug, TOURNAMENTS, type TournamentMatch } from '@/lib/tournament-data'

export function generateStaticParams() {
  return TOURNAMENTS.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tournament = getTournamentBySlug(slug)
  return { title: tournament?.name ?? 'Tournament' }
}

export default async function TournamentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tournament = getTournamentBySlug(slug)
  if (!tournament) notFound()

  return (
    <div className="min-h-screen bg-[#1A1D2E] text-white">
      {/* Header */}
      <header className="border-b border-white/8 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-black tracking-tight">
          Court <span className="text-[#A8D634]">IQ</span>
        </span>
        <Link href="/" className="text-sm text-white/40 hover:text-white transition-colors">
          ← Home
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Tournament info */}
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight">{tournament.name}</h1>
          <p className="text-white/50 mt-2">{tournament.venue}</p>
          <p className="text-white/50 text-sm">{tournament.date}</p>
          <span className="inline-block mt-3 text-xs px-2 py-0.5 rounded-full bg-[#A8D634]/20 text-[#A8D634] border border-[#A8D634]/30 font-medium">
            {tournament.status}
          </span>
        </div>

        {/* Categories */}
        {tournament.categories.map((category) => (
          <section key={category.id} className="mb-14">
            <h2 className="text-xl font-bold text-[#A8D634] mb-6 pb-2 border-b border-white/8">
              {category.name}
            </h2>

            {/* Pool play */}
            {category.pools.map((pool) => (
              <div key={pool.id} className="mb-8">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                  {pool.name}
                </h3>
                <MatchTable matches={pool.matches} showStage={false} />
              </div>
            ))}

            {/* Playoffs */}
            {category.playoffMatches.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                  Playoffs
                </h3>
                <MatchTable matches={category.playoffMatches} showStage />
              </div>
            )}
          </section>
        ))}
      </main>
    </div>
  )
}

function MatchTable({
  matches,
  showStage,
}: {
  matches: TournamentMatch[]
  showStage: boolean
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-white/8">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#242638] text-white/50 text-xs uppercase tracking-wider">
            {showStage && <th className="text-left px-4 py-3">Stage</th>}
            <th className="text-left px-4 py-3">Team 1</th>
            <th className="text-left px-4 py-3">Team 2</th>
            <th className="text-center px-4 py-3">Final Score</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match, i) => {
            const winner =
              match.finalScore
                ? match.finalScore.team1 > match.finalScore.team2
                  ? 1
                  : 2
                : 0

            return (
              <tr key={match.id} className={i % 2 === 0 ? 'bg-[#1E2030]' : 'bg-[#1A1D2E]'}>
                {showStage && (
                  <td className="px-4 py-3 text-white/50 capitalize text-xs">
                    {match.stage.replace('_', ' ')}
                  </td>
                )}
                <td className={`px-4 py-3 ${winner === 1 ? 'font-bold text-white' : 'text-white/70'}`}>
                  {match.team1}
                  {winner === 1 && (
                    <span className="ml-2 text-[10px] text-[#A8D634] font-semibold">WIN</span>
                  )}
                </td>
                <td className={`px-4 py-3 ${winner === 2 ? 'font-bold text-white' : 'text-white/70'}`}>
                  {match.team2}
                  {winner === 2 && (
                    <span className="ml-2 text-[10px] text-[#A8D634] font-semibold">WIN</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center font-mono">
                  {match.finalScore
                    ? `${match.finalScore.team1} – ${match.finalScore.team2}`
                    : <span className="text-white/30">—</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
