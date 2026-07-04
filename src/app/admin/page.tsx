'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TournamentData, TournamentMatch, Pool } from '@/lib/tournament-data'
import { calculatePoolStandings } from '@/lib/pool-standings'
import { Trophy, LogOut, Check, AlertCircle, Edit2, MapPin, Clock } from 'lucide-react'
import { CourtManagement } from '@/components/admin/CourtManagement'
import { BracketGenerator } from '@/components/admin/BracketGenerator'

type TabType = 'overview' | 'courts' | 'matches'

export default function AdminPage() {
  const [tournaments, setTournaments] = useState<TournamentData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [editingMatch, setEditingMatch] = useState<string | null>(null)
  const [editingPool, setEditingPool] = useState<string | null>(null)
  const [editingTeam, setEditingTeam] = useState<{ matchId: string; team: 'team1' | 'team2' } | null>(null)
  const [editValues, setEditValues] = useState({ team1Score: 0, team2Score: 0, status: '', courtNumber: 0 })
  const [poolName, setPoolName] = useState('')
  const [teamName, setTeamName] = useState('')
  const [addingTeamToPool, setAddingTeamToPool] = useState<string | null>(null)
  const [newTeamName, setNewTeamName] = useState('')
  const [addingPoolToCategory, setAddingPoolToCategory] = useState<string | null>(null)
  const [newPoolName, setNewPoolName] = useState('')
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchTournaments()
    const interval = setInterval(fetchTournaments, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchTournaments = async () => {
    try {
      const res = await fetch('/api/scores', { cache: 'no-store' })
      const data = await res.json()
      setTournaments(data.tournaments)
    } catch (error) {
      console.error('Failed to fetch:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Collect all matches for court management
  const allMatches: TournamentMatch[] = []
  tournaments.forEach(t => {
    t.categories.forEach(c => {
      c.pools.forEach(p => {
        allMatches.push(...p.matches)
      })
      allMatches.push(...c.playoffMatches)
    })
  })

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
        const data = await res.json()
        setSaveMessage({ type: 'error', text: data.error || 'Failed to update match' })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Error saving match' })
    }
  }

  const handleEditPool = (pool: Pool) => {
    setEditingPool(pool.id)
    setPoolName(pool.name)
  }

  const handleSavePool = async (poolId: string) => {
    try {
      const res = await fetch('/api/scores/pool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId,
          updates: { name: poolName },
        }),
      })

      if (res.ok) {
        setSaveMessage({ type: 'success', text: 'Pool name updated successfully!' })
        setEditingPool(null)
        fetchTournaments()
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        const data = await res.json()
        setSaveMessage({ type: 'error', text: data.error || 'Failed to update pool' })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Error saving pool' })
    }
  }

  const handleEditTeam = (matchId: string, team: 'team1' | 'team2', currentName: string) => {
    setEditingTeam({ matchId, team })
    setTeamName(currentName)
  }

  const handleSaveTeam = async () => {
    if (!editingTeam) return

    try {
      const res = await fetch('/api/scores/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: editingTeam.matchId,
          team: editingTeam.team,
          newName: teamName,
        }),
      })

      if (res.ok) {
        setSaveMessage({ type: 'success', text: 'Team name updated successfully!' })
        setEditingTeam(null)
        fetchTournaments()
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        const data = await res.json()
        setSaveMessage({ type: 'error', text: data.error || 'Failed to update team name' })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Error saving team name' })
    }
  }

  const handleAddTeam = async (poolId: string) => {
    if (!newTeamName.trim()) {
      setSaveMessage({ type: 'error', text: 'Team name cannot be empty' })
      setTimeout(() => setSaveMessage(null), 3000)
      return
    }

    try {
      const res = await fetch('/api/scores/add-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId,
          teamName: newTeamName.trim(),
        }),
      })

      if (res.ok) {
        setSaveMessage({ type: 'success', text: 'Team added successfully!' })
        setAddingTeamToPool(null)
        setNewTeamName('')
        fetchTournaments()
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        const data = await res.json()
        setSaveMessage({ type: 'error', text: data.error || 'Failed to add team' })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Error adding team' })
    }
  }

  const handleAddPool = async (categoryId: string) => {
    if (!newPoolName.trim()) {
      setSaveMessage({ type: 'error', text: 'Pool name cannot be empty' })
      setTimeout(() => setSaveMessage(null), 3000)
      return
    }

    try {
      const res = await fetch('/api/pools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, poolName: newPoolName.trim() })
      })

      if (res.ok) {
        setSaveMessage({ type: 'success', text: `Pool "${newPoolName}" added successfully!` })
        setAddingPoolToCategory(null)
        setNewPoolName('')
        fetchTournaments()
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        const error = await res.json()
        setSaveMessage({ type: 'error', text: error.error || 'Failed to add pool' })
        setTimeout(() => setSaveMessage(null), 3000)
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to add pool' })
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1117] via-[#1A1D2E] to-[#0F1117] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#A8D634]/30 border-t-[#A8D634] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1117] via-[#1A1D2E] to-[#0F1117] text-white">
      {/* Header */}
      <header className="border-b border-white/8 px-6 py-4 sticky top-0 z-40 backdrop-blur-xl bg-[#1A1D2E]/90">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              Court <span className="text-gradient">IQ</span>
              <span className="ml-3 text-sm font-medium text-white/40">Admin</span>
            </h1>
            <p className="text-xs text-white/40 mt-1">Tournament Management Dashboard</p>
          </div>
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

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto flex gap-2 mt-6">
          {[
            { id: 'overview' as TabType, label: 'Overview & Matches' },
            { id: 'courts' as TabType, label: 'Court Management' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#A8D634] text-black'
                  : 'bg-slate-800/30 text-white/60 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Save Message */}
      {saveMessage && (
        <div className="max-w-7xl mx-auto px-6">
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
            saveMessage.type === 'success'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {saveMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {saveMessage.text}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Court Management Tab */}
        {activeTab === 'courts' && (
          <CourtManagement matches={allMatches} onRefresh={fetchTournaments} />
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
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
                </div>
              </div>

              {/* Categories */}
              {tournament.categories.map((category) => (
                <div key={category.id} className="mb-12">
                  {/* Category Header with Add Pool Button */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[#A8D634]">{category.name}</h3>
                    <button
                      onClick={() => {
                        setAddingPoolToCategory(category.id)
                        setNewPoolName('')
                      }}
                      className="px-4 py-2 bg-[#A8D634]/20 text-[#A8D634] border border-[#A8D634]/30 rounded hover:bg-[#A8D634]/30 text-sm font-medium transition-colors"
                    >
                      + Add Pool
                    </button>
                  </div>

                  {/* Bracket Generator */}
                  <div className="mb-6">
                    <BracketGenerator
                      categoryId={category.id}
                      categoryName={category.name}
                    />
                  </div>

                  {/* Add Pool Form */}
                  {addingPoolToCategory === category.id && (
                    <div className="mb-6 p-4 bg-[#1A1D2E] border border-[#A8D634]/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={newPoolName}
                          onChange={(e) => setNewPoolName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddPool(category.id)
                            if (e.key === 'Escape') setAddingPoolToCategory(null)
                          }}
                          placeholder="Enter pool name (e.g., Pool C)"
                          className="flex-1 px-4 py-2 bg-[#0F1117] border border-white/10 rounded text-white placeholder:text-white/40"
                          autoFocus
                        />
                        <button
                          onClick={() => handleAddPool(category.id)}
                          className="px-4 py-2 bg-[#A8D634] text-[#1A1D2E] rounded hover:bg-[#96C12B] font-medium transition-colors"
                        >
                          Create Pool
                        </button>
                        <button
                          onClick={() => {
                            setAddingPoolToCategory(null)
                            setNewPoolName('')
                          }}
                          className="px-4 py-2 bg-white/5 text-white/60 border border-white/10 rounded hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Pools */}
                  <div className="space-y-6 mb-8">
                    {category.pools.map((pool) => {
                      const standings = calculatePoolStandings(pool)
                      return (
                        <div key={pool.id}>
                          {/* Pool Header with Edit */}
                          <div className="flex items-center gap-3 mb-3">
                            {editingPool === pool.id ? (
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="text"
                                  value={poolName}
                                  onChange={(e) => setPoolName(e.target.value)}
                                  className="px-3 py-1.5 bg-[#1A1D2E] border border-white/10 rounded text-sm font-semibold text-white"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSavePool(pool.id)}
                                  className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded hover:bg-green-500/30 text-xs font-medium"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingPool(null)}
                                  className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 text-xs font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                                  {pool.name}
                                </h4>
                                <button
                                  onClick={() => handleEditPool(pool)}
                                  className="px-2 py-1 bg-[#A8D634]/20 text-[#A8D634] border border-[#A8D634]/30 rounded hover:bg-[#A8D634]/30 text-xs font-medium flex items-center gap-1"
                                >
                                  <Edit2 className="w-3 h-3" /> Edit Name
                                </button>
                              </>
                            )}
                          </div>

                          {/* Add Team Button */}
                          {addingTeamToPool === pool.id ? (
                            <div className="mb-4 p-3 bg-[#0F1117] border border-white/8 rounded-lg">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={newTeamName}
                                  onChange={(e) => setNewTeamName(e.target.value)}
                                  className="flex-1 px-3 py-2 bg-[#1A1D2E] border border-white/10 rounded text-sm text-white"
                                  placeholder="Enter team name..."
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleAddTeam(pool.id)}
                                  className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded hover:bg-green-500/30 text-xs font-medium"
                                >
                                  Add
                                </button>
                                <button
                                  onClick={() => {
                                    setAddingTeamToPool(null)
                                    setNewTeamName('')
                                  }}
                                  className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 text-xs font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setAddingTeamToPool(pool.id)}
                              className="mb-4 px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/30 text-xs font-medium"
                            >
                              + Add Team to Pool
                            </button>
                          )}

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
                                      editingTeam={editingTeam}
                                      teamName={teamName}
                                      onEdit={() => handleEditMatch(match)}
                                      onSave={() => handleSaveMatch(match.id)}
                                      onCancel={() => setEditingMatch(null)}
                                      onEditValuesChange={setEditValues}
                                      onEditTeam={(team: 'team1' | 'team2', name: string) => handleEditTeam(match.id, team, name)}
                                      onSaveTeam={handleSaveTeam}
                                      onCancelTeam={() => setEditingTeam(null)}
                                      onTeamNameChange={setTeamName}
                                    />
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )
                    })}
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
          </>
        )}
      </main>
    </div>
  )
}

// Match row component for pool matches
function MatchRow({
  match,
  isEditing,
  editValues,
  editingTeam,
  teamName,
  onEdit,
  onSave,
  onCancel,
  onEditValuesChange,
  onEditTeam,
  onSaveTeam,
  onCancelTeam,
  onTeamNameChange,
}: {
  match: TournamentMatch
  isEditing: boolean
  editValues: { team1Score: number; team2Score: number; status: string; courtNumber: number }
  editingTeam: { matchId: string; team: 'team1' | 'team2' } | null
  teamName: string
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onEditValuesChange: (values: { team1Score: number; team2Score: number; status: string; courtNumber: number }) => void
  onEditTeam: (team: 'team1' | 'team2', name: string) => void
  onSaveTeam: () => void
  onCancelTeam: () => void
  onTeamNameChange: (name: string) => void
}) {
  const isEditingTeam1 = editingTeam?.matchId === match.id && editingTeam?.team === 'team1'
  const isEditingTeam2 = editingTeam?.matchId === match.id && editingTeam?.team === 'team2'

  if (isEditing) {
    return (
      <tr className="bg-[#1E2030]">
        <td className="px-4 py-3 font-medium">{match.team1}</td>
        <td className="px-4 py-3 text-white/70">{match.team2}</td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <input
              type="number"
              value={editValues.team1Score}
              onChange={(e) => onEditValuesChange({ ...editValues, team1Score: Number(e.target.value) })}
              className="w-16 px-2 py-1 bg-[#1A1D2E] border border-white/10 rounded text-center"
            />
            <span>–</span>
            <input
              type="number"
              value={editValues.team2Score}
              onChange={(e) => onEditValuesChange({ ...editValues, team2Score: Number(e.target.value) })}
              className="w-16 px-2 py-1 bg-[#1A1D2E] border border-white/10 rounded text-center"
            />
          </div>
        </td>
        <td className="px-4 py-3">
          <input
            type="number"
            value={editValues.courtNumber}
            onChange={(e) => onEditValuesChange({ ...editValues, courtNumber: Number(e.target.value) })}
            className="w-20 px-2 py-1 bg-[#1A1D2E] border border-white/10 rounded text-center"
            placeholder="Court"
          />
        </td>
        <td className="px-4 py-3">
          <select
            value={editValues.status}
            onChange={(e) => onEditValuesChange({ ...editValues, status: e.target.value })}
            className="px-3 py-1 bg-[#1A1D2E] border border-white/10 rounded text-sm"
          >
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="CONFIRMED">Confirmed</option>
          </select>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={onSave}
              className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded hover:bg-green-500/30 text-xs font-medium"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="group hover:bg-[#1E2030] transition-colors">
      <td className="px-4 py-3">
        {isEditingTeam1 ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={teamName}
              onChange={(e) => onTeamNameChange(e.target.value)}
              className="flex-1 px-2 py-1 bg-[#1A1D2E] border border-white/10 rounded text-sm"
              autoFocus
            />
            <button
              onClick={onSaveTeam}
              className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs"
            >
              ✓
            </button>
            <button
              onClick={onCancelTeam}
              className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-medium">{match.team1}</span>
            <button
              onClick={() => onEditTeam('team1', match.team1)}
              className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 bg-white/5 hover:bg-white/10 rounded text-xs text-white/50"
              title="Edit team name"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        {isEditingTeam2 ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={teamName}
              onChange={(e) => onTeamNameChange(e.target.value)}
              className="flex-1 px-2 py-1 bg-[#1A1D2E] border border-white/10 rounded text-sm"
              autoFocus
            />
            <button
              onClick={onSaveTeam}
              className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs"
            >
              ✓
            </button>
            <button
              onClick={onCancelTeam}
              className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-white/70">{match.team2}</span>
            <button
              onClick={() => onEditTeam('team2', match.team2)}
              className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 bg-white/5 hover:bg-white/10 rounded text-xs text-white/50"
              title="Edit team name"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-center font-mono font-bold">
        {match.finalScore ? `${match.finalScore.team1} – ${match.finalScore.team2}` : '—'}
      </td>
      <td className="px-4 py-3 text-center text-white/50">
        {match.courtNumber ? `Court ${match.courtNumber}` : '—'}
      </td>
      <td className="px-4 py-3 text-center">
        <StatusBadge status={match.status} />
      </td>
      <td className="px-4 py-3 text-center">
        <button
          onClick={onEdit}
          className="px-3 py-1 bg-[#A8D634]/20 text-[#A8D634] border border-[#A8D634]/30 rounded hover:bg-[#A8D634]/30 text-xs font-medium"
        >
          Edit
        </button>
      </td>
    </tr>
  )
}

// Playoff match row component
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
  onEditValuesChange: (values: { team1Score: number; team2Score: number; status: string; courtNumber: number }) => void
}) {
  if (isEditing) {
    return (
      <tr className="bg-[#1E2030]">
        <td className="px-4 py-3 text-white/60 capitalize font-medium">
          {match.stage.replace(/_/g, ' ')}
        </td>
        <td className="px-4 py-3 font-medium">{match.team1}</td>
        <td className="px-4 py-3 text-white/70">{match.team2}</td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <input
              type="number"
              value={editValues.team1Score}
              onChange={(e) => onEditValuesChange({ ...editValues, team1Score: Number(e.target.value) })}
              className="w-16 px-2 py-1 bg-[#1A1D2E] border border-white/10 rounded text-center"
            />
            <span>–</span>
            <input
              type="number"
              value={editValues.team2Score}
              onChange={(e) => onEditValuesChange({ ...editValues, team2Score: Number(e.target.value) })}
              className="w-16 px-2 py-1 bg-[#1A1D2E] border border-white/10 rounded text-center"
            />
          </div>
        </td>
        <td className="px-4 py-3">
          <select
            value={editValues.status}
            onChange={(e) => onEditValuesChange({ ...editValues, status: e.target.value })}
            className="px-3 py-1 bg-[#1A1D2E] border border-white/10 rounded text-sm"
          >
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="CONFIRMED">Confirmed</option>
          </select>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={onSave}
              className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded hover:bg-green-500/30 text-xs font-medium"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="hover:bg-[#1E2030] transition-colors">
      <td className="px-4 py-3 text-white/60 capitalize font-medium">
        {match.stage.replace(/_/g, ' ')}
      </td>
      <td className="px-4 py-3 font-medium">{match.team1}</td>
      <td className="px-4 py-3 text-white/70">{match.team2}</td>
      <td className="px-4 py-3 text-center font-mono font-bold">
        {match.finalScore ? `${match.finalScore.team1} – ${match.finalScore.team2}` : '—'}
      </td>
      <td className="px-4 py-3 text-center">
        <StatusBadge status={match.status} />
      </td>
      <td className="px-4 py-3 text-center">
        <button
          onClick={onEdit}
          className="px-3 py-1 bg-[#A8D634]/20 text-[#A8D634] border border-[#A8D634]/30 rounded hover:bg-[#A8D634]/30 text-xs font-medium"
        >
          Edit
        </button>
      </td>
    </tr>
  )
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CONFIRMED: 'bg-green-500/20 text-green-400 border-green-500/30',
    IN_PROGRESS: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    SCHEDULED: 'bg-white/10 text-white/50 border-white/10',
  }

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full border font-medium ${
        styles[status] ?? 'bg-white/10 text-white/50 border-white/10'
      }`}
    >
      {status}
    </span>
  )
}
