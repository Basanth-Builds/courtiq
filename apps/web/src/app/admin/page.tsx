import { TOURNAMENTS } from '@/lib/tournament-data'
import AdminLogout from './logout'

export const metadata = { title: 'Admin' }

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#1A1D2E] text-white">
      {/* Header */}
      <header className="border-b border-white/8 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-black tracking-tight">
          Court <span className="text-[#A8D634]">IQ</span>
          <span className="ml-2 text-sm font-medium text-white/40">Admin</span>
        </h1>
        <AdminLogout />
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-12">
        {TOURNAMENTS.map((tournament) => (
          <section key={tournament.id}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">{tournament.name}</h2>
              <p className="text-sm text-white/50 mt-1">
                {tournament.venue} · {tournament.date}
              </p>
              <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-[#A8D634]/20 text-[#A8D634] border border-[#A8D634]/30 font-medium">
                {tournament.status}
              </span>
            </div>

            {tournament.categories.map((category) => (
              <div key={category.id} className="mb-10">
                <h3 className="text-lg font-semibold text-[#A8D634] mb-4">{category.name}</h3>

                {/* Pools */}
                {category.pools.map((pool) => (
                  <div key={pool.id} className="mb-6">
                    <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                      {pool.name}
                    </h4>
                    <div className="rounded-xl overflow-hidden border border-white/8">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-[#242638] text-white/50 text-xs uppercase tracking-wider">
                            <th className="text-left px-4 py-3">Team 1</th>
                            <th className="text-left px-4 py-3">Team 2</th>
                            <th className="text-center px-4 py-3">Score</th>
                            <th className="text-center px-4 py-3">Court</th>
                            <th className="text-center px-4 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pool.matches.map((match, i) => (
                            <tr
                              key={match.id}
                              className={i % 2 === 0 ? 'bg-[#1E2030]' : 'bg-[#1A1D2E]'}
                            >
                              <td className="px-4 py-3 font-medium">{match.team1}</td>
                              <td className="px-4 py-3 text-white/70">{match.team2}</td>
                              <td className="px-4 py-3 text-center font-mono">
                                {match.finalScore
                                  ? `${match.finalScore.team1} – ${match.finalScore.team2}`
                                  : '—'}
                              </td>
                              <td className="px-4 py-3 text-center text-white/50">
                                {match.courtNumber ?? '—'}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <StatusBadge status={match.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                {/* Playoffs */}
                {category.playoffMatches.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                      Playoffs
                    </h4>
                    <div className="rounded-xl overflow-hidden border border-white/8">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-[#242638] text-white/50 text-xs uppercase tracking-wider">
                            <th className="text-left px-4 py-3">Stage</th>
                            <th className="text-left px-4 py-3">Team 1</th>
                            <th className="text-left px-4 py-3">Team 2</th>
                            <th className="text-center px-4 py-3">Score</th>
                            <th className="text-center px-4 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {category.playoffMatches.map((match, i) => (
                            <tr
                              key={match.id}
                              className={i % 2 === 0 ? 'bg-[#1E2030]' : 'bg-[#1A1D2E]'}
                            >
                              <td className="px-4 py-3 text-white/50 capitalize">
                                {match.stage.replace('_', ' ')}
                              </td>
                              <td className="px-4 py-3 font-medium">{match.team1}</td>
                              <td className="px-4 py-3 text-white/70">{match.team2}</td>
                              <td className="px-4 py-3 text-center font-mono">
                                {match.finalScore
                                  ? `${match.finalScore.team1} – ${match.finalScore.team2}`
                                  : '—'}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <StatusBadge status={match.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>
        ))}
      </main>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CONFIRMED: 'bg-[#A8D634]/20 text-[#A8D634] border-[#A8D634]/30',
    IN_PROGRESS: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30',
    SCHEDULED: 'bg-white/10 text-white/50 border-white/10',
  }
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full border font-medium ${styles[status] ?? 'bg-white/10 text-white/50'}`}
    >
      {status}
    </span>
  )
}
