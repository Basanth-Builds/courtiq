'use client'

import { useState } from 'react'
import { Trophy, Loader2 } from 'lucide-react'

interface BracketGeneratorProps {
  categoryId: string
  categoryName: string
}

export function BracketGenerator({ categoryId, categoryName }: BracketGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [teamCount, setTeamCount] = useState<4 | 8 | 16>(8)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setMessage(null)

    try {
      const response = await fetch('/api/brackets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, teamCount })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Bracket generated successfully!' })
        
        // Reload page after 1.5 seconds to show new bracket
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to generate bracket' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-xl border border-yellow-500/30">
      <div className="flex items-start gap-3">
        <Trophy className="w-5 h-5 text-yellow-500 mt-1" />
        
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-white mb-2">Generate Playoff Bracket</h4>
          <p className="text-xs text-white/60 mb-3">
            Create single-elimination bracket from pool standings
          </p>

          <div className="flex items-center gap-3 mb-3">
            <label className="text-xs text-white/70">Team Count:</label>
            <div className="flex gap-2">
              {([4, 8, 16] as const).map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setTeamCount(count)}
                  disabled={isGenerating}
                  className={`px-3 py-1 text-xs rounded-lg transition-all ${
                    teamCount === count
                      ? 'bg-yellow-500 text-black font-semibold'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {count} teams
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Trophy className="w-4 h-4" />
                Generate Bracket
              </>
            )}
          </button>

          {message && (
            <div
              className={`mt-3 p-2 rounded-lg text-xs ${
                message.type === 'success'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
