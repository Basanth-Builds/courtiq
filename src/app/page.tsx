'use client'

import { useEffect, useState } from 'react'
import { TournamentData } from '@/lib/tournament-data'
import { calculatePoolStandings } from '@/lib/pool-standings'
import { Trophy, Award, Clock, Search, Filter, ChevronDown, TrendingUp } from 'lucide-react'
import { BracketVisualizer } from '@/components/bracket/BracketVisualizer'

export default function SpectatorPage() {
  const [tournaments, setTournaments] = useState<TournamentData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [expandedPools, setExpandedPools] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/scores', { cache: 'no-store' })
        const data = await res.json()
        setTournaments(data.tournaments)
        
        // Auto-select first category on load
        if (data.tournaments.length > 0 && !activeCategory) {
          setActiveCategory(data.tournaments[0].categories[0]?.id || '')
          // Expand all pools by default
          const allPoolIds = new Set<string>()
          data.tournaments[0].categories.forEach((cat: any) => {
            cat.pools.forEach((pool: any) => {
              allPoolIds.add(pool.id)
            })
          })
          setExpandedPools(allPoolIds)
        }
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
  }, [activeCategory])

  const togglePool = (poolId: string) => {
    setExpandedPools(prev => {
      const next = new Set(prev)
      if (next.has(poolId)) {
        next.delete(poolId)
      } else {
        next.add(poolId)
      }
      return next
    })
  }

  const filterMatches = (matches: any[]) => {
    let filtered = matches
    
    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(m => m.status === statusFilter)
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(m => 
        m.team1.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.team2.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return filtered
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1117] via-[#1A1D2E] to-[#0F1117] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#A8D634]/30 border-t-[#A8D634] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading live scores...</p>
        </div>
      </div>
    )
  }

  const tournament = tournaments[0]
  const activeCateg = tournament?.categories.find(c => c.id === activeCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1117] via-[#1A1D2E] to-[#0F1117] text-white">
      {/* Header */}
      <header className="border-b border-white/8 px-4 md:px-6 py-4 sticky top-0 z-50 bg-[#1A1D2E]/95 backdrop-blur-xl shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4 md:mb-0">
            <h1 className="text-xl md:text-2xl font-black tracking-tight">
              Court <span className="text-[#A8D634]">IQ</span>
              <span className="ml-2 md:ml-3 text-xs md:text-sm font-medium text-white/40">Live</span>
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-white/50">Live Updates</span>
            </div>
          </div>
          
          {/* Tournament Info */}
          {tournament && (
            <div className="mt-3 md:mt-4 pb-3 md:pb-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-xs md:text-sm text-white/60">
              <h2 className="text-base md:text-lg font-bold text-white">{tournament.name}</h2>
              <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                <span>{tournament.venue}</span>
                <span className="hidden md:inline">•</span>
                <span>{tournament.date}</span>
                <span
                  className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${
                    tournament.status === 'ACTIVE'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-white/10 text-white/50'
                  }`}
                >
                  {tournament.status}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        {!tournament ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 mx-auto text-white/20 mb-4" />
            <p className="text-white/60">No tournaments found</p>
          </div>
        ) : (
          <>
            {/* Category Tabs */}
            <div className="mb-6 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 pb-2 min-w-max md:min-w-0">
                {tournament.categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold text-sm md:text-base transition-all whitespace-nowrap ${
                      activeCategory === category.id
                        ? 'bg-[#A8D634] text-black shadow-lg shadow-[#A8D634]/20'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <Trophy className="w-4 h-4 inline mr-2" />
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="mb-6 flex flex-col md:flex-row gap-3 md:gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#A8D634]/50 focus:bg-white/10 transition-all placeholder:text-white/30"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2.5 md:py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#A8D634]/50 appearance-none cursor-pointer min-w-[160px]"
                >
                  <option value="ALL">All Matches</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="CONFIRMED">Completed</option>
                  <option value="SCHEDULED">Upcoming</option>
                </select>
              </div>
            </div>

            {/* Active Category Content */}
            {activeCateg && (
              <div className="space-y-4 md:space-y-6">
                {activeCateg.pools.map((pool) => {
                  const standings = calculatePoolStandings(pool)
                  const filteredMatches = filterMatches(pool.matches)
                  const isExpanded = expandedPools.has(pool.id)
                  const liveMatches = pool.matches.filter(m => m.status === 'IN_PROGRESS').length
                  
                  return (
                    <div key={pool.id} className="rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#1A1D2E]/80 to-[#0F1117]/80 backdrop-blur-sm">
                      {/* Pool Header - Collapsible */}
                      <button
                        onClick={() => togglePool(pool.id)}
                        className="w-full px-4 md:px-6 py-3 md:py-4 bg-[#1A1D2E]/60 border-b border-white/8 flex items-center justify-between hover:bg-[#1A1D2E]/80 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <h4 className="text-base md:text-lg font-bold text-white group-hover:text-[#A8D634] transition-colors">
                            {pool.name}
                          </h4>
                          {liveMatches > 0 && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full border border-yellow-500/30 flex items-center gap-1">
                              <Clock className="w-3 h-3 animate-pulse" />
                              {liveMatches} Live
                            </span>
                          )}
                        </div>
                        <ChevronDown 
                          className={`w-5 h-5 text-white/50 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                          {/* Standings - Compact Card View */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <TrendingUp className="w-4 h-4 text-[#A8D634]" />
                              <h5 className="text-sm font-bold text-white/80 uppercase tracking-wide">Standings</h5>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {standings.standings.map((standing, index) => (
                                <div
                                  key={standing.teamName}
                                  className="bg-white/5 rounded-xl p-3 md:p-4 border border-white/10 hover:border-[#A8D634]/30 hover:bg-white/10 transition-all"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-6 h-6 md:w-7 md:h-7 rounded-lg flex items-center justify-center font-bold text-xs md:text-sm ${
                                        index === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                        index === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30' :
                                        index === 2 ? 'bg-amber-700/20 text-amber-500 border border-amber-700/30' :
                                        'bg-white/10 text-white/50'
                                      }`}>
                                        {index + 1}
                                      </div>
                                      <div>
                                        <div className="font-bold text-sm md:text-base text-white">{standing.teamName}</div>
                                        <div className="text-xs text-white/50">{standing.wins}W - {standing.losses}L</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-white/10">
                                    <div>
                                      <span className="text-white/50">Points:</span>
                                      <span className="ml-1 text-green-400 font-bold">{standing.pointsFor}</span>
                                      <span className="text-white/30 mx-1">-</span>
                                      <span className="text-red-400 font-bold">{standing.pointsAgainst}</span>
                                    </div>
                                    <div className={`font-mono font-bold ${
                                      standing.pointDifferential > 0 ? 'text-green-400' :
                                      standing.pointDifferential < 0 ? 'text-red-400' : 'text-white/50'
                                    }`}>
                                      {standing.pointDifferential > 0 ? '+' : ''}{standing.pointDifferential}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Matches - Compact Card View */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-[#A8D634]" />
                                <h5 className="text-sm font-bold text-white/80 uppercase tracking-wide">Matches</h5>
                              </div>
                              <span className="text-xs text-white/40">{filteredMatches.length} matches</span>
                            </div>
                            
                            {filteredMatches.length === 0 ? (
                              <div className="text-center py-8 text-white/40 text-sm">
                                No matches found
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {filteredMatches.map((match) => (
                                  <div
                                    key={match.id}
                                    className={`rounded-xl p-3 md:p-4 border transition-all ${
                                      match.status === 'IN_PROGRESS'
                                        ? 'bg-yellow-500/5 border-yellow-500/30 shadow-lg shadow-yellow-500/10'
                                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                      <StatusBadge status={match.status} />
                                      {match.courtNumber && (
                                        <span className="text-xs text-white/40">Court {match.courtNumber}</span>
                                      )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                      {/* Team 1 */}
                                      <div className="flex items-center justify-between">
                                        <span className="font-semibold text-sm md:text-base">{match.team1}</span>
                                        {match.finalScore && (
                                          <span className={`text-lg md:text-xl font-bold font-mono ${
                                            match.finalScore.team1 > match.finalScore.team2 ? 'text-green-400' : 'text-white/50'
                                          }`}>
                                            {match.finalScore.team1}
                                          </span>
                                        )}
                                      </div>
                                      
                                      <div className="h-px bg-white/10"></div>
                                      
                                      {/* Team 2 */}
                                      <div className="flex items-center justify-between">
                                        <span className="font-semibold text-sm md:text-base text-white/80">{match.team2}</span>
                                        {match.finalScore && (
                                          <span className={`text-lg md:text-xl font-bold font-mono ${
                                            match.finalScore.team2 > match.finalScore.team1 ? 'text-green-400' : 'text-white/50'
                                          }`}>
                                            {match.finalScore.team2}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Playoffs Section - Bracket Visualizer */}
                {activeCateg.playoffMatches.length > 0 && (
                  <div className="mt-8 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#1A1D2E]/80 to-[#0F1117]/80 backdrop-blur-sm">
                    <div className="px-4 md:px-6 py-3 md:py-4 bg-[#1A1D2E]/60 border-b border-white/8">
                      <h4 className="text-base md:text-lg font-bold text-[#A8D634] flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Playoffs Bracket
                      </h4>
                    </div>
                    <div className="p-4 md:p-6">
                      <BracketDisplay categoryId={activeCategory} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
      
      {/* Add custom scrollbar styles */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CONFIRMED: 'bg-green-500/20 text-green-400 border-green-500/30',
    IN_PROGRESS: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    SCHEDULED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full border font-medium inline-flex items-center gap-1 ${
        styles[status] ?? 'bg-white/10 text-white/50 border-white/10'
      }`}
    >
      {status === 'IN_PROGRESS' && <Clock className="w-3 h-3 animate-pulse" />}
      {status.replace(/_/g, ' ')}
    </span>
  )
}

// Bracket Display Component
function BracketDisplay({ categoryId }: { categoryId: string }) {
  const [bracket, setBracket] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBracket = async () => {
      try {
        const res = await fetch(`/api/brackets?categoryId=${categoryId}`)
        const data = await res.json()
        setBracket(data.bracket)
      } catch (error) {
        console.error('Failed to load bracket:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBracket()
  }, [categoryId])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-[#A8D634]/30 border-t-[#A8D634] rounded-full animate-spin mx-auto" />
        <p className="text-white/40 text-sm mt-2">Loading bracket...</p>
      </div>
    )
  }

  if (!bracket || !bracket.columns || bracket.columns.length === 0) {
    return (
      <div className="text-center py-8 text-white/40">
        <Trophy className="w-12 h-12 mx-auto mb-2 opacity-20" />
        <p>No bracket generated yet</p>
      </div>
    )
  }

  return <BracketVisualizer columns={bracket.columns} thirdPlace={bracket.thirdPlace} />
}
