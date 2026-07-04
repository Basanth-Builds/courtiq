'use client'

import { useState } from 'react'
import { TournamentMatch, Pool } from '@/lib/tournament-data'
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react'

interface QuickActionsProps {
  match: TournamentMatch
  onUpdate: () => void
}

export function QuickMatchEntry({ match, onUpdate }: QuickActionsProps) {
  const [editing, setEditing] = useState(false)
  const [team1Score, setTeam1Score] = useState(match.finalScore?.team1 || 0)
  const [team2Score, setTeam2Score] = useState(match.finalScore?.team2 || 0)
  const [status, setStatus] = useState(match.status)

  const handleSave = async () => {
    try {
      const res = await fetch('/api/scores/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: match.id,
          updates: {
            score: { team1: team1Score, team2: team2Score },
            status
          }
        })
      })

      if (res.ok) {
        setEditing(false)
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to save match:', error)
    }
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
      >
        <Edit2 className="w-4 h-4" />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
      <input
        type="number"
        min="0"
        value={team1Score}
        onChange={(e) => setTeam1Score(Number(e.target.value))}
        className="w-16 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-center text-sm"
      />
      <span className="text-white/50">-</span>
      <input
        type="number"
        min="0"
        value={team2Score}
        onChange={(e) => setTeam2Score(Number(e.target.value))}
        className="w-16 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-center text-sm"
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as any)}
        className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sm"
      >
        <option value="SCHEDULED">Scheduled</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="CONFIRMED">Confirmed</option>
      </select>
      <button
        onClick={handleSave}
        className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400"
      >
        <Save className="w-4 h-4" />
      </button>
      <button
        onClick={() => setEditing(false)}
        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

interface BulkOperationsProps {
  categoryId: string
  onUpdate: () => void
}

export function BulkOperations({ categoryId, onUpdate }: BulkOperationsProps) {
  const [showAddPool, setShowAddPool] = useState(false)
  const [newPoolName, setNewPoolName] = useState('')

  const handleAddPool = async () => {
    if (!newPoolName.trim()) return

    try {
      const res = await fetch('/api/pools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, poolName: newPoolName.trim() })
      })

      if (res.ok) {
        setNewPoolName('')
        setShowAddPool(false)
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to add pool:', error)
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowAddPool(!showAddPool)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#A8D634] text-black font-medium hover:bg-[#C4E85A] transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Pool
      </button>

      {showAddPool && (
        <div className="flex items-center gap-2 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <input
            type="text"
            placeholder="Pool name..."
            value={newPoolName}
            onChange={(e) => setNewPoolName(e.target.value)}
            className="flex-1 px-3 py-2 rounded bg-slate-800 border border-slate-700"
          />
          <button
            onClick={handleAddPool}
            className="px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 font-medium"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setShowAddPool(false)
              setNewPoolName('')
            }}
            className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
