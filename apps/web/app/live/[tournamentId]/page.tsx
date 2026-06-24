import { Wifi, Trophy } from 'lucide-react'

export const metadata = { title: 'Live Scores' }

export default function LivePage({ params }: { params: { tournamentId: string } }) {
  const courts = [
    { id: 1, name: 'Court 1', team1: 'Rahul / Priya', team2: 'Arjun / Neha', score: '7-5', status: 'live', round: 'Pool A' },
    { id: 2, name: 'Court 2', team1: 'Aditya / Maya', team2: 'Kiran / Divya', score: '11-4', status: 'finished', round: 'Pool B' },
    { id: 3, name: 'Court 3', team1: 'Vikram / Anita', team2: 'Rohit / Sneha', score: '3-3', status: 'live', round: 'Pool A' },
    { id: 4, name: 'Court 4', team1: 'Sanjay / Rita', team2: 'Dev / Pooja', score: '0-0', status: 'upcoming', round: 'Pool C' },
  ]

  return (
    <div className="min-h-screen bg-court-pattern p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white">
            Court <span className="text-gradient">IQ</span>
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2 text-[#a8d634] text-sm font-medium">
            <Wifi className="w-4 h-4" /> Live Scores
          </div>
          <p className="text-white/40 text-sm mt-1">Tournament #{params.tournamentId}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {courts.map((court) => (
            <div
              key={court.id}
              className={`p-6 rounded-2xl border ${
                court.status === 'live'
                  ? 'bg-[#a8d634]/5 border-[#a8d634]/30'
                  : court.status === 'finished'
                  ? 'bg-white/3 border-white/10 opacity-70'
                  : 'bg-white/3 border-white/5 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#a8d634]">{court.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40">{court.round}</span>
                  {court.status === 'live' && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#a8d634]/20 text-[#a8d634] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#a8d634] animate-pulse" /> LIVE
                    </span>
                  )}
                  {court.status === 'finished' && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                      <Trophy className="w-3 h-3" /> Final
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">{court.team1}</div>
                  <div className="text-4xl font-black text-[#a8d634] mt-1">{court.score.split('-')[0]}</div>
                </div>
                <div className="text-white/15 font-black">—</div>
                <div className="text-right">
                  <div className="font-bold text-white text-sm">{court.team2}</div>
                  <div className="text-4xl font-black text-white/60 mt-1">{court.score.split('-')[1]}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
