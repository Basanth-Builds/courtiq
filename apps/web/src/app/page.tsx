'use client'

import { useEffect, useState } from 'react'
import { TournamentData } from '@/lib/tournament-data'
import { calculatePoolStandings } from '@/lib/pool-standings'
import { Trophy, Award, Clock } from 'lucide-react'

export default function SpectatorPage() {
  const [tournaments, setTournaments] = useState<TournamentData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/scores', { cache: 'no-store' })
        const data = await res.json()
        setTournaments(data.tournaments)
      } catch (error) {
        console.error('Failed to fetch scores:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // Poll for updates every 2 seconds
    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1D2E] text-white flex items-center justify-center">
        <p>Loading scores...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A1D2E] text-white">
      {/* Header */}
      <header className="border-b border-white/8 px-6 py-4 sticky top-0 z-40 bg-[#1A1D2E]/95 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight">
            Court <span className="text-[#A8D634]">IQ</span>
            <span className="ml-3 text-sm font-medium text-white/40">Live Scores</span>
          </h1>
          {/* Admin button hidden from public spectators */}
          {/* <a
            href="/admin"
            className="text-xs px-3 py-1.5 rounded-full bg-[#A8D634]/20 text-[#A8D634] border border-[#A8D634]/30 hover:bg-[#A8D634]/30 transition-colors"
          >
            Admin Dashboard →
          </a> */}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {tournaments.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 mx-auto text-white/20 mb-4" />
            <p className="text-white/60">No tournaments found</p>
          </div>
        ) : (
          tournaments.map((tournament) => (
            <div key={tournament.id} className="mb-16">
              {/* Tournament Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">{tournament.name}</h2>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span>{tournament.venue}</span>
                  <span>•</span>
                  <span>{tournament.date}</span>
                  <span
                    className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${
                      tournament.status === 'ACTIVE'
                        ? 'bg-green-500/20 text-green-400'
                        : tournament.status === 'COMPLETED'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {tournament.status}
                  </span>
                </div>
              </div>

              {/* Categories */}
              {tournament.categories.map((category) => (
                <div key={category.id} className="mb-12">
                  <h3 className="text-xl font-bold text-[#A8D634] mb-6 flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    {category.name}
                  </h3>

                  {/* Pools */}
                  <div className="space-y-6 mb-8">
                    {category.pools.map((pool) => {
                      const standings = calculatePoolStandings(pool)
                      return (
                        <div key={pool.id}>
                          <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                            {pool.name}
                          </h4>

                          {/* Pool Standings */}
                          <div className="rounded-xl overflow-hidden border border-white/8 bg-[#0F1117] mb-4">
                            <div className="px-4 py-2 bg-[#1A1D2E] border-b border-white/8">
                              <h5 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                                Standings
                              </h5>
                            </div>
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-[#242638] text-white/50 text-xs uppercase tracking-wider border-b border-white/8">
                                  <th className="text-left px-4 py-2">Rank</th>
                                  <th className="text-left px-4 py-2">Team</th>
                                  <th className="text-center px-4 py-2">W</th>
                                  <th className="text-center px-4 py-2">L</th>
                                  <th className="text-center px-4 py-2">PF</th>
                                  <th className="text-center px-4 py-2">PA</th>
                                  <th className="text-center px-4 py-2">Diff</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/8">
                                {standings.standings.map((standing, index) => (
                                  <tr key={standing.teamName} className="hover:bg-[#1E2030] transition-colors">
                                    <td className="px-4 py-2 text-white/50 font-mono">{index + 1}</td>
                                    <td className="px-4 py-2 font-medium">{standing.teamName}</td>
                                    <td className="px-4 py-2 text-center font-bold text-green-400">
                                      {standing.wins}
                                    </td>
                                    <td className="px-4 py-2 text-center text-red-400">{standing.losses}</td>
                                    <td className="px-4 py-2 text-center text-white/70">{standing.pointsFor}</td>
                                    <td className="px-4 py-2 text-center text-white/70">
                                      {standing.pointsAgainst}
                                    </td>
                                    <td
                                      className={`px-4 py-2 text-center font-mono font-bold ${
                                        standing.pointDifferential > 0
                                          ? 'text-green-400'
                                          : standing.pointDifferential < 0
                                            ? 'text-red-400'
                                            : 'text-white/50'
                                      }`}
                                    >
                                      {standing.pointDifferential > 0 ? '+' : ''}
                                      {standing.pointDifferential}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Matches */}
                          <div className="rounded-xl overflow-hidden border border-white/8 bg-[#0F1117]">
                            <div className="px-4 py-2 bg-[#1A1D2E] border-b border-white/8">
                              <h5 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                                Matches
                              </h5>
                            </div>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-[#242638] text-white/50 text-xs uppercase tracking-wider border-b border-white/8">
                                <th className="text-left px-4 py-3">Team 1</th>
                                <th className="text-left px-4 py-3">Team 2</th>
                                <th className="text-center px-4 py-3">Score</th>
                                <th className="text-center px-4 py-3">Court</th>
                                <th className="text-center px-4 py-3">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/8">
                              {pool.matches.map((match) => (
                                <tr key={match.id} className="hover:bg-[#1E2030] transition-colors">
                                  <td className="px-4 py-3 font-medium">{match.team1}</td>
                                  <td className="px-4 py-3 text-white/70">{match.team2}</td>
                                  <td className="px-4 py-3 text-center font-mono font-bold">
                                    {match.finalScore
                                      ? `${match.finalScore.team1} – ${match.finalScore.team2}`
                                      : '—'}
                                  </td>
                                  <td className="px-4 py-3 text-center text-white/50">
                                    {match.courtNumber ? `Court ${match.courtNumber}` : '—'}
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
                    )
                    })}
                  </div>

                  {/* Playoffs */}
                  {category.playoffMatches.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4" /> Playoffs
                      </h4>
                      <div className="rounded-xl overflow-hidden border border-white/8 bg-[#0F1117]">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-[#242638] text-white/50 text-xs uppercase tracking-wider border-b border-white/8">
                              <th className="text-left px-4 py-3">Stage</th>
                              <th className="text-left px-4 py-3">Team 1</th>
                              <th className="text-left px-4 py-3">Team 2</th>
                              <th className="text-center px-4 py-3">Score</th>
                              <th className="text-center px-4 py-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/8">
                            {category.playoffMatches.map((match) => (
                              <tr key={match.id} className="hover:bg-[#1E2030] transition-colors">
                                <td className="px-4 py-3 text-white/60 capitalize font-medium">
                                  {match.stage.replace(/_/g, ' ')}
                                </td>
                                <td className="px-4 py-3 font-medium">{match.team1}</td>
                                <td className="px-4 py-3 text-white/70">{match.team2}</td>
                                <td className="px-4 py-3 text-center font-mono font-bold">
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
            </div>
          ))
        )}
      </main>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CONFIRMED: 'bg-green-500/20 text-green-400 border-green-500/30',
    IN_PROGRESS: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    SCHEDULED: 'bg-white/10 text-white/50 border-white/10',
  }

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full border font-medium inline-flex items-center gap-1 ${
        styles[status] ?? 'bg-white/10 text-white/50 border-white/10'
      }`}
    >
      {status === 'IN_PROGRESS' && <Clock className="w-3 h-3" />}
      {status}
    </span>
  )
}
