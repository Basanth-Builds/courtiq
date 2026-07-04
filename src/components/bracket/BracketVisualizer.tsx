'use client'

import { Trophy, Medal } from 'lucide-react'

interface BracketMatch {
  id: string
  team1: string
  team2: string
  score1?: number
  score2?: number
  status: string
}

interface BracketColumn {
  name: string
  matches: BracketMatch[]
}

interface BracketVisualizerProps {
  columns: BracketColumn[]
  thirdPlace?: BracketMatch
}

export function BracketVisualizer({ columns, thirdPlace }: BracketVisualizerProps) {
  return (
    <div className="space-y-8">
      {/* Bracket Columns */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-8 min-w-fit">
          {columns.map((column, colIdx) => (
            <div key={colIdx} className="flex flex-col justify-around min-w-[280px]">
              {/* Round Header */}
              <div className="mb-6 text-center">
                <h3 className="text-lg font-bold text-[#A8D634] uppercase tracking-wider">
                  {column.name}
                </h3>
                <div className="h-1 w-16 mx-auto mt-2 bg-gradient-to-r from-transparent via-[#A8D634] to-transparent" />
              </div>

              {/* Matches in this round */}
              <div className="space-y-6">
                {column.matches.map((match, matchIdx) => (
                  <div
                    key={match.id}
                    className="relative"
                    style={{
                      marginTop: colIdx > 0 ? `${matchIdx * 120}px` : '0'
                    }}
                  >
                    <BracketMatchCard match={match} />
                    
                    {/* Connector line to next round */}
                    {colIdx < columns.length - 1 && (
                      <div className="absolute left-full top-1/2 w-8 h-0.5 bg-gradient-to-r from-slate-700 to-transparent" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Third Place Match */}
      {thirdPlace && (
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Medal className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold text-amber-600 uppercase tracking-wider">
                  Third Place Match
                </h3>
                <Medal className="w-5 h-5 text-amber-600" />
              </div>
              <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
            </div>
            <BracketMatchCard match={thirdPlace} isThirdPlace />
          </div>
        </div>
      )}
    </div>
  )
}

interface BracketMatchCardProps {
  match: BracketMatch
  isThirdPlace?: boolean
}

function BracketMatchCard({ match, isThirdPlace }: BracketMatchCardProps) {
  const isComplete = match.status === 'CONFIRMED'
  const isLive = match.status === 'IN_PROGRESS'
  const isTBD = match.team1.includes('TBD') || match.team1.includes('Winner')

  const winner = 
    isComplete && match.score1 !== undefined && match.score2 !== undefined
      ? match.score1 > match.score2 ? 'team1' : 'team2'
      : null

  return (
    <div className={`
      relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 
      rounded-xl border-2 transition-all
      ${isLive ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/20' : 'border-slate-700/30'}
      ${isThirdPlace ? 'border-amber-600/50' : ''}
      ${isTBD ? 'opacity-60' : ''}
    `}>
      {/* Live Indicator */}
      {isLive && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Live</span>
        </div>
      )}

      {/* Match Content */}
      <div className="p-4 space-y-2">
        {/* Team 1 */}
        <div className={`
          flex items-center justify-between p-3 rounded-lg transition-all
          ${winner === 'team1' ? 'bg-[#A8D634]/20 border-2 border-[#A8D634]/50' : 'bg-slate-800/50'}
          ${isTBD ? 'italic text-white/40' : ''}
        `}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {winner === 'team1' && (
              <Trophy className="w-4 h-4 text-[#A8D634] flex-shrink-0" />
            )}
            <span className={`truncate text-sm font-medium ${winner === 'team1' ? 'text-[#A8D634] font-bold' : ''}`}>
              {match.team1}
            </span>
          </div>
          {match.score1 !== undefined && (
            <span className={`text-xl font-bold ml-2 ${winner === 'team1' ? 'text-[#A8D634]' : 'text-white/60'}`}>
              {match.score1}
            </span>
          )}
        </div>

        {/* Team 2 */}
        <div className={`
          flex items-center justify-between p-3 rounded-lg transition-all
          ${winner === 'team2' ? 'bg-[#A8D634]/20 border-2 border-[#A8D634]/50' : 'bg-slate-800/50'}
          ${isTBD ? 'italic text-white/40' : ''}
        `}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {winner === 'team2' && (
              <Trophy className="w-4 h-4 text-[#A8D634] flex-shrink-0" />
            )}
            <span className={`truncate text-sm font-medium ${winner === 'team2' ? 'text-[#A8D634] font-bold' : ''}`}>
              {match.team2}
            </span>
          </div>
          {match.score2 !== undefined && (
            <span className={`text-xl font-bold ml-2 ${winner === 'team2' ? 'text-[#A8D634]' : 'text-white/60'}`}>
              {match.score2}
            </span>
          )}
        </div>
      </div>

      {/* Status Badge */}
      {!isComplete && !isLive && !isTBD && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-xs text-white/50">
          Scheduled
        </div>
      )}
    </div>
  )
}
