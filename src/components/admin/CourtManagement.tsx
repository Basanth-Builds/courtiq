'use client'

import { useState, useEffect } from 'react'
import { TournamentMatch } from '@/lib/tournament-data'
import { MapPin, Clock, AlertCircle, CheckCircle, Play } from 'lucide-react'

interface CourtAssignment {
  courtNumber: number
  match: TournamentMatch | null
  status: 'available' | 'in_use' | 'maintenance'
}

interface CourtManagementProps {
  matches: TournamentMatch[]
  onRefresh: () => void
}

export function CourtManagement({ matches, onRefresh }: CourtManagementProps) {
  const [courts, setCourts] = useState<CourtAssignment[]>([])
  const [selectedCourt, setSelectedCourt] = useState<number | null>(null)

  useEffect(() => {
    // Initialize courts (assuming 4 courts for now)
    const courtCount = 4
    const courtAssignments: CourtAssignment[] = []
    
    for (let i = 1; i <= courtCount; i++) {
      const match = matches.find(m => m.courtNumber === i && m.status === 'IN_PROGRESS')
      courtAssignments.push({
        courtNumber: i,
        match: match || null,
        status: match ? 'in_use' : 'available'
      })
    }
    
    setCourts(courtAssignments)
  }, [matches])

  const handleAssignCourt = async (matchId: string, courtNumber: number) => {
    try {
      const res = await fetch('/api/courts/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, courtNumber })
      })

      if (res.ok) {
        onRefresh()
        setSelectedCourt(null)
      }
    } catch (error) {
      console.error('Failed to assign court:', error)
    }
  }

  const unassignedMatches = matches.filter(m => !m.courtNumber && m.status !== 'CONFIRMED')
  const activeMatches = matches.filter(m => m.status === 'IN_PROGRESS')

  return (
    <div className="space-y-6">
      {/* Court Status Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {courts.map(court => (
          <div
            key={court.courtNumber}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
              court.status === 'in_use'
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-slate-800/50 border-slate-700/30'
            } ${
              selectedCourt === court.courtNumber
                ? 'ring-2 ring-[#A8D634]'
                : ''
            }`}
            onClick={() => setSelectedCourt(court.courtNumber)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#A8D634]" />
                <h3 className="font-bold">Court {court.courtNumber}</h3>
              </div>
              {court.status === 'in_use' ? (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400">Live</span>
                </div>
              ) : (
                <CheckCircle className="w-4 h-4 text-slate-500" />
              )}
            </div>

            {court.match ? (
              <div className="space-y-2">
                <div className="text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">{court.match.team1}</span>
                    <span className="font-bold text-[#A8D634]">
                      {court.match.finalScore?.team1 || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">{court.match.team2}</span>
                    <span className="font-bold text-[#A8D634]">
                      {court.match.finalScore?.team2 || 0}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-white/50">
                  <Clock className="w-3 h-3" />
                  <span>In Progress</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-white/40">Available</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Active Matches */}
      {activeMatches.length > 0 && (
        <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-green-500" />
            Active Matches ({activeMatches.length})
          </h3>
          <div className="space-y-3">
            {activeMatches.map(match => (
              <div
                key={match.id}
                className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/20"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium">{match.team1} vs {match.team2}</div>
                  <div className="text-xs text-white/50">Court {match.courtNumber}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#A8D634]">
                    {match.finalScore?.team1 || 0} - {match.finalScore?.team2 || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unassigned Matches */}
      {unassignedMatches.length > 0 && (
        <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            Unassigned Matches ({unassignedMatches.length})
          </h3>
          <div className="space-y-3">
            {unassignedMatches.map(match => (
              <div
                key={match.id}
                className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/20"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium">{match.team1} vs {match.team2}</div>
                  <div className="text-xs text-white/50">{match.stage} Stage</div>
                </div>
                {selectedCourt ? (
                  <button
                    onClick={() => handleAssignCourt(match.id, selectedCourt)}
                    className="px-4 py-2 text-sm rounded-lg bg-[#A8D634] text-black font-medium hover:bg-[#C4E85A] transition-colors"
                  >
                    Assign to Court {selectedCourt}
                  </button>
                ) : (
                  <span className="text-xs text-white/40">Select a court first</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
