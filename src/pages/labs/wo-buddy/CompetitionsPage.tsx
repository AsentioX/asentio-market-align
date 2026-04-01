import { useState } from 'react';
import { Trophy, Users, Clock, ChevronUp } from 'lucide-react';
import { mockCompetitions, mockLeaderboard, Competition } from './mockData';

const CompetitionsPage = () => {
  const [competitions, setCompetitions] = useState<Competition[]>(mockCompetitions);
  const [activeLeaderboard, setActiveLeaderboard] = useState<string | null>('1');

  const toggleJoin = (id: string) => {
    setCompetitions(prev => prev.map(c => c.id === id ? { ...c, joined: !c.joined } : c));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Competitions</h2>

      {/* Active */}
      <div className="space-y-3">
        {competitions.map((comp) => (
          <div key={comp.id} className="bg-white/[0.03] rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className={`w-4 h-4 ${comp.type === 'daily' ? 'text-orange-400' : 'text-emerald-400'}`} />
                  <div>
                    <h3 className="text-sm font-semibold">{comp.title}</h3>
                    <p className="text-[10px] text-white/40">{comp.description}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  comp.type === 'daily' ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'
                }`}>{comp.type === 'daily' ? 'Daily' : 'Weekly'}</span>
              </div>

              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${comp.type === 'daily' ? 'bg-orange-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min((comp.progress / comp.target) * 100, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-white/30">
                <span>{comp.progress} / {comp.target}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{comp.timeRemaining}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{comp.participants}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleJoin(comp.id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                    comp.joined
                      ? 'bg-white/5 text-white/40 border border-white/5'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {comp.joined ? 'Joined ✓' : 'Join Challenge'}
                </button>
                <button
                  onClick={() => setActiveLeaderboard(activeLeaderboard === comp.id ? null : comp.id)}
                  className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white/60 border border-white/5"
                >
                  <ChevronUp className={`w-4 h-4 transition-transform ${activeLeaderboard === comp.id ? '' : 'rotate-180'}`} />
                </button>
              </div>
            </div>

            {/* Leaderboard */}
            {activeLeaderboard === comp.id && (
              <div className="border-t border-white/5 p-4 space-y-1.5">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Leaderboard</p>
                {mockLeaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      entry.isCurrentUser ? 'bg-emerald-500/10 border border-emerald-500/20' : ''
                    }`}
                  >
                    <span className={`w-6 text-center text-xs font-bold ${
                      entry.rank <= 3 ? 'text-amber-400' : 'text-white/30'
                    }`}>
                      {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                      {entry.avatar}
                    </div>
                    <span className={`flex-1 text-sm ${entry.isCurrentUser ? 'text-emerald-400 font-semibold' : 'text-white/70'}`}>
                      {entry.name} {entry.isCurrentUser && '(You)'}
                    </span>
                    <span className="text-sm font-mono text-white/50">{entry.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetitionsPage;
