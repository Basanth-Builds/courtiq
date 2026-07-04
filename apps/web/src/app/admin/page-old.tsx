'use client'

import { useEffect, useState } from 'react'
import { TournamentData, TournamentMatch } from '@/lib/tournament-data'
import { Trophy, LogOut, Check, X, AlertCircle } from 'lucide-react'

type AdminState = 'login' | 'authenticated'

export default function AdminPage() {
  const [state, setState] = useState<AdminState>('login')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [tournaments, setTournaments] = useState<TournamentData[]>([])
  const [loading, setLoading] = useState(false)
  const [editingMatch, setEditingMatch] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ team1Score: 0, team2Score: 0, status: '', courtNumber: 0 })
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (state === 'authenticated') {
      fetchTournaments()
      const interval = setInterval(fetchTournaments, 3000)
      return () => clearInterval(interval)
    }
  }, [state])

  const fetchTournaments = async () => {
    try {
      const res = await fetch('/api/scores', { cache: 'no-store' })
      const data = await res.json()
      setTournaments(data.tournaments)
    } catch (error) {
      console.error('Failed to fetch:', error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setPasswordError('')

    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        setState('authenticated')
        setPassword('')
        fetchTournaments()
      } else {
        setPasswordError('Invalid password')
      }
    } catch (error) {
      setPasswordError('Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setState('login')
    setPassword('')
    setTournaments([])
  }

  const handleEditMatch = (match: TournamentMatch) => {
    setEditingMatch(match.id)
    setEditValues({
      team1Score: match.finalScore?.team1 || 0,
      team2Score: match.finalScore?.team2 || 0,
      status: match.status,
      courtNumber: match.courtNumber || 0,
    })
  }

  const handleSaveMatch = async (matchId: string) => {
    try {
      const res = await fetch('/api/scores/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          password,
          updates: {
            score: { team1: editValues.team1Score, team2: editValues.team2Score },
            status: editValues.status,
            courtNumber: editValues.courtNumber || undefined,
          },
        }),
      })

      if (res.ok) {
        setSaveMessage({ type: 'success', text: 'Match updated successfully!' })
        setEditingMatch(null)
        fetchTournaments()
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to update match' })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Error saving match' })
    }
  }

  if (state === 'login') {
    return (
      <div className="min-h-screen bg-[#1A1D2E] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight mb-2">
              Court <span className="text-[#A8D634]">IQ</span>
            </h1>
            <p className="text-white/60">Admin Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setPasswordError('')
                }}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 rounded-lg bg-[#242638] border border-white/10 text-white placeholder-white/30 focus:border-[#A8D634] focus:outline-none"
              />
              {passwordError && <p className="text-red-400 text-sm mt-2 flex items-center gap-1"><X className="w-3 h-3" /> {passwordError}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg bg-[#A8D634] text-[#1A1D2E] font-bold hover:bg-[#c4e86a] transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Enter Admin Panel'}
            </button>
          </form>

          <p className="text-center text-xs text-white/30 mt-6">Default password: admin123</p>
        </div>
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
            <span className="ml-3 text-sm font-medium text-white/40">Admin</span>
          </h1>
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-xs px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
            >
              ← View Spectator Page
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
            >
              <LogOut className="w-3 h-3" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Save Message */}
      {saveMessage && (
        <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${
          saveMessage.type === 'success'
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {saveMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {saveMessage.text}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-10">
        {tournaments.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 mx-auto text-white/20 mb-4" />
            <p className="text-white/60">Loading tournaments...</p>
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
                </div>
              </div>

              {/* Categories */}
              {tournament.categories.map((category) => (
                <div key={category.id} className="mb-12">
                  <h3 className="text-xl font-bold text-[#A8D634] mb-6">{category.name}</h3>

                  {/* Pools */}
                  <div className="space-y-6 mb-8">
                    {category.pools.map((pool) => (
                      <div key={pool.id}>
                        <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                          {pool.name}
                        </h4>
                        <div className="rounded-xl overflow-hidden border border-white/8 bg-[#0F1117]">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-[#242638] text-white/50 text-xs uppercase tracking-wider border-b border-white/8">
                                  <th className="text-left px-4 py-3">Team 1</th>
                                  <th className="text-left px-4 py-3">Team 2</th>
                                  <th className="text-center px-4 py-3">Score</th>
                                  <th className="text-center px-4 py-3">Court</th>
                                  <th className="text-center px-4 py-3">Status</th>
                                  <th className="text-center px-4 py-3">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/8">
                                {pool.matches.map((match) => (
                                  <MatchRow
                                    key={match.id}
                                    match={match}
                                    isEditing={editingMatch === match.id}
                                    editValues={editValues}
                                    onEdit={() => handleEditMatch(match)}
                                    onSave={() => handleSaveMatch(match.id)}
                                    onCancel={() => setEditingMatch(null)}
                                    onEditValuesChange={setEditValues}
                                  />
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Playoffs */}
                  {category.playoffMatches.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                        Playoffs
                      </h4>
                      <div className="rounded-xl overflow-hidden border border-white/8 bg-[#0F1117]">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-[#242638] text-white/50 text-xs uppercase tracking-wider border-b border-white/8">
                                <th className="text-left px-4 py-3">Stage</th>
                                <th className="text-left px-4 py-3">Team 1</th>
                                <th className="text-left px-4 py-3">Team 2</th>
                                <th className="text-center px-4 py-3">Score</th>
                                <th className="text-center px-4 py-3">Status</th>
                                <th className="text-center px-4 py-3">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/8">
                              {category.playoffMatches.map((match) => (
                                <PlayoffMatchRow
                                  key={match.id}
                                  match={match}
                                  isEditing={editingMatch === match.id}
                                  editValues={editValues}
                                  onEdit={() => handleEditMatch(match)}
                                  onSave={() => handleSaveMatch(match.id)}
                                  onCancel={() => setEditingMatch(null)}
                                  onEditValuesChange={setEditValues}
                                />
                              ))}
                            </tbody>
                          </table>
                        </div>
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

function MatchRow({
  match,
  isEditing,
  editValues,
  onEdit,
  onSave,
  onCancel,
  onEditValuesChange,
}: {
  match: TournamentMatch
  isEditing: boolean
  editValues: { team1Score: number; team2Score: number; status: string; courtNumber: number }
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onEditValuesChange: (values: any) => void
}) {
  if (isEditing) {
    return (
      <tr className="bg-[#1E2030] border-l-2 border-[#A8D634]">
        <td colSpan={6} className="px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Team 1 Score</label>
              <input
                type="number"
                value={editValues.team1Score}
                onChange={(e) => onEditValuesChange({ ...editValues, team1Score: Number(e.target.value) })}
                className="w-full px-2 py-1 bg-[#0F1117] border border-white/20 rounded text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Team 2 Score</label>
              <input
                type="number"
                value={editValues.team2Score}
                onChange={(e) => onEditValuesChange({ ...editValues, team2Score: Number(e.target.value) })}
                className="w-full px-2 py-1 bg-[#0F1117] border border-white/20 rounded text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Court #</label>
              <input
                type="number"
                value={editValues.courtNumber}
                onChange={(e) => onEditValuesChange({ ...editValues, courtNumber: Number(e.target.value) })}
                className="w-full px-2 py-1 bg-[#0F1117] border border-white/20 rounded text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Status</label>
              <select
                value={editValues.status}
                onChange={(e) => onEditValuesChange({ ...editValues, status: e.target.value })}
                className="w-full px-2 py-1 bg-[#0F1117] border border-white/20 rounded text-white"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CONFIRMED">Confirmed</option>
              </select>
            </div>
            <div className="flex gap-2 md:col-span-2 items-end">
              <button
                onClick={onSave}
                className="flex-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" /> Save
              </button>
              <button
                onClick={onCancel}
                className="flex-1 px-3 py-1 bg-red-600 hover:bg-red-700 rounded flex items-center justify-center gap-1"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="hover:bg-[#1E2030] transition-colors">
      <td className="px-4 py-3 font-medium">{match.team1}</td>
      <td className="px-4 py-3 text-white/70">{match.team2}</td>
      <td className="px-4 py-3 text-center font-mono font-bold">
        {match.finalScore ? `${match.finalScore.team1} – ${match.finalScore.team2}` : '—'}
      </td>
      <td className="px-4 py-3 text-center text-white/50">{match.courtNumber ? `Court ${match.courtNumber}` : '—'}</td>
      <td className="px-4 py-3 text-center"><StatusBadge status={match.status} /></td>
      <td className="px-4 py-3 text-center">
        <button
          onClick={onEdit}
          className="px-3 py-1 bg-[#A8D634]/20 text-[#A8D634] rounded hover:bg-[#A8D634]/30 transition-colors text-xs font-medium"
        >
          Edit
        </button>
      </td>
    </tr>
  )
}

function PlayoffMatchRow({
  match,
  isEditing,
  editValues,
  onEdit,
  onSave,
  onCancel,
  onEditValuesChange,
}: {
  match: TournamentMatch
  isEditing: boolean
  editValues: { team1Score: number; team2Score: number; status: string; courtNumber: number }
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onEditValuesChange: (values: any) => void
}) {
  if (isEditing) {
    return (
      <tr className="bg-[#1E2030] border-l-2 border-[#A8D634]">
        <td colSpan={6} className="px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Team 1 Score</label>
              <input
                type="number"
                value={editValues.team1Score}
                onChange={(e) => onEditValuesChange({ ...editValues, team1Score: Number(e.target.value) })}
                className="w-full px-2 py-1 bg-[#0F1117] border border-white/20 rounded text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Team 2 Score</label>
              <input
                type="number"
                value={editValues.team2Score}
                onChange={(e) => onEditValuesChange({ ...editValues, team2Score: Number(e.target.value) })}
                className="w-full px-2 py-1 bg-[#0F1117] border border-white/20 rounded text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Status</label>
              <select
                value={editValues.status}
                onChange={(e) => onEditValuesChange({ ...editValues, status: e.target.value })}
                className="w-full px-2 py-1 bg-[#0F1117] border border-white/20 rounded text-white"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CONFIRMED">Confirmed</option>
              </select>
            </div>
            <div className="flex gap-2 md:col-span-3 items-end">
              <button
                onClick={onSave}
                className="flex-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" /> Save
              </button>
              <button
                onClick={onCancel}
                className="flex-1 px-3 py-1 bg-red-600 hover:bg-red-700 rounded flex items-center justify-center gap-1"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="hover:bg-[#1E2030] transition-colors">
      <td className="px-4 py-3 text-white/60 capitalize font-medium">{match.stage.replace(/_/g, ' ')}</td>
      <td className="px-4 py-3 font-medium">{match.team1}</td>
      <td className="px-4 py-3 text-white/70">{match.team2}</td>
      <td className="px-4 py-3 text-center font-mono font-bold">
        {match.finalScore ? `${match.finalScore.team1} – ${match.finalScore.team2}` : '—'}
      </td>
      <td className="px-4 py-3 text-center"><StatusBadge status={match.status} /></td>
      <td className="px-4 py-3 text-center">
        <button
          onClick={onEdit}
          className="px-3 py-1 bg-[#A8D634]/20 text-[#A8D634] rounded hover:bg-[#A8D634]/30 transition-colors text-xs font-medium"
        >
          Edit
        </button>
      </td>
    </tr>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CONFIRMED: 'bg-green-500/20 text-green-400 border-green-500/30',
    IN_PROGRESS: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    SCHEDULED: 'bg-white/10 text-white/50 border-white/10',
  }

  return (
    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${styles[status] ?? 'bg-white/10 text-white/50 border-white/10'}`}>
      {status}
    </span>
  )
}
