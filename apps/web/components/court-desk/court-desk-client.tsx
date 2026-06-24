'use client'

import { useState } from 'react'
import { Zap, Plus, Minus, Check, RotateCcw } from 'lucide-react'

export function CourtDeskClient() {
  const [score1, setScore1] = useState(0)
  const [score2, setScore2] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => setSubmitted(true)
  const handleReset = () => { setScore1(0); setScore2(0); setSubmitted(false) }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center pt-20">
        <div className="w-20 h-20 rounded-full bg-[#a8d634]/10 border-2 border-[#a8d634] flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-[#a8d634]" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Score Submitted!</h2>
        <p className="text-white/50 mb-2">Result sent to referee for final confirmation.</p>
        <div className="text-4xl font-black text-white my-6">
          <span className="text-[#a8d634]">{score1}</span>
          <span className="text-white/20 mx-3">—</span>
          <span>{score2}</span>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <RotateCcw className="w-4 h-4" /> New Match
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Zap className="w-5 h-5 text-[#a8d634]" />
        <h1 className="text-2xl font-black text-white">Court Desk</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[#a8d634]/20 text-[#a8d634] font-bold border border-[#a8d634]/30 animate-pulse">LIVE</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Team 1', score: score1, setScore: setScore1, color: '#a8d634' },
          { label: 'Team 2', score: score2, setScore: setScore2, color: 'white' },
        ].map((team) => (
          <div key={team.label} className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: team.color }}>{team.label}</div>
            <div className="text-6xl font-black mb-6" style={{ color: team.color }}>{team.score}</div>
            <div className="flex gap-2">
              <button
                onClick={() => team.setScore(Math.max(0, team.score - 1))}
                className="flex-1 py-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all text-white font-black text-xl active:scale-95"
              >
                <Minus className="w-5 h-5 mx-auto" />
              </button>
              <button
                onClick={() => team.setScore(team.score + 1)}
                className="flex-1 py-4 rounded-xl hover:opacity-90 transition-all font-black text-xl active:scale-95"
                style={{ backgroundColor: team.color === '#a8d634' ? '#a8d634' : 'rgba(255,255,255,0.2)', color: team.color === '#a8d634' ? '#1a1d2e' : 'white' }}
              >
                <Plus className="w-5 h-5 mx-auto" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={score1 === 0 && score2 === 0}
        className="w-full py-5 rounded-2xl bg-[#a8d634] text-[#1a1d2e] font-black text-xl hover:bg-[#c4e86a] transition-all glow-green disabled:opacity-30 disabled:cursor-not-allowed active:scale-99"
      >
        Submit Score to Referee
      </button>
    </div>
  )
}
