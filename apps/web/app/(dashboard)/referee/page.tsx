import { Shield, Check, X, Clock } from 'lucide-react'

export const metadata = { title: 'Referee Console' }

export default function RefereePage() {
  const pending = [
    { id: '1', court: 'Court 1', team1: 'Rahul / Priya', team2: 'Arjun / Neha', score: '11-7', time: '14:32', status: 'pending' },
    { id: '2', court: 'Court 3', team1: 'Vikram / Anita', team2: 'Rohit / Sneha', score: '11-9', time: '14:18', status: 'pending' },
    { id: '3', court: 'Court 2', team1: 'Aditya / Maya', team2: 'Kiran / Divya', score: '11-4', time: '13:55', status: 'pending' },
  ]

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Shield className="w-6 h-6 text-[#a8d634]" /> Referee Console
        </h1>
        <p className="text-white/50 text-sm mt-1">Review and confirm match results before DUPR submission.</p>
      </div>

      <div className="space-y-4">
        {pending.map((match) => (
          <div key={match.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#a8d634]/20 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#a8d634]">{match.court}</span>
              <span className="flex items-center gap-1.5 text-xs text-white/40">
                <Clock className="w-3 h-3" /> {match.time}
              </span>
            </div>
            <div className="flex items-center justify-between mb-6">
              <div className="text-center">
                <div className="font-bold text-white">{match.team1}</div>
                <div className="text-3xl font-black text-[#a8d634] mt-1">{match.score.split('-')[0]}</div>
              </div>
              <div className="text-white/20 font-black text-xl">VS</div>
              <div className="text-center">
                <div className="font-bold text-white">{match.team2}</div>
                <div className="text-3xl font-black text-white/60 mt-1">{match.score.split('-')[1]}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#a8d634] text-[#1a1d2e] font-bold hover:bg-[#c4e86a] transition-all">
                <Check className="w-4 h-4" /> Confirm & Submit
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all">
                <X className="w-4 h-4" /> Dispute
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
