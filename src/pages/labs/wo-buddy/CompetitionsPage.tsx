import { useState } from 'react';
import { Trophy, Users, Clock, ChevronUp, Timer, Share2 } from 'lucide-react';
import { mockCompetitions, mockLeaderboard, mockAchievements, Competition } from './mockData';
import { shareContent, buildAchievementShareText } from './shareUtils';
import compWarrior from '@/assets/wo-buddy/comp-warrior.jpg';
import compBurn from '@/assets/wo-buddy/comp-burn.jpg';
import compStrength from '@/assets/wo-buddy/comp-strength.jpg';
import compCardio from '@/assets/wo-buddy/comp-cardio.jpg';

const competitionImages: Record<string, string> = {
  '1': compWarrior,
  '2': compBurn,
  '3': compStrength,
  '4': compCardio,
};

const CompetitionsPage = () => {
  const [competitions, setCompetitions] = useState<Competition[]>(mockCompetitions);
  const [activeLeaderboard, setActiveLeaderboard] = useState<string | null>('1');

  const toggleJoin = (id: string) => {
    setCompetitions(prev => prev.map(c => c.id === id ? { ...c, joined: !c.joined } : c));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Competitions</h2>

      <div className="space-y-4">
        {competitions.map((comp) => {
          const image = competitionImages[comp.id] || competitionImages['1'];
          const pct = Math.round((comp.progress / comp.target) * 100);

          return (
            <div key={comp.id} className="rounded-2xl border border-stone-200/70 overflow-hidden shadow-lg shadow-black/10">
              {/* Visual header with image */}
              <div className="relative h-36">
                <img src={image} alt={comp.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" width={640} height={640} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#faf8f5] via-stone-900/20 to-transparent" />
                <div className="absolute top-3 right-3 bg-stone-900/15 backdrop-blur-md rounded-full px-2.5 py-1 text-[10px] font-medium flex items-center gap-1 border border-stone-200/70">
                  <Timer className="w-3 h-3" /> {comp.timeRemaining}
                </div>
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium backdrop-blur-md border border-stone-200/70 ${
                    comp.type === 'daily' ? 'bg-orange-500/30 text-orange-300' : 'bg-emerald-500/30 text-emerald-300'
                  }`}>{comp.type === 'daily' ? 'Daily' : 'Weekly'}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-base font-bold drop-shadow-lg">{comp.title}</h3>
                  <p className="text-[11px] text-stone-700 mt-0.5">{comp.description}</p>
                </div>
              </div>

              {/* Stats + actions */}
              <div className="bg-transparent p-4 space-y-3">
                <div className="h-2 bg-stone-900/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all shadow-[0_0_8px_rgba(52,211,153,0.3)] ${comp.type === 'daily' ? 'bg-gradient-to-r from-orange-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-700">
                  <span className="font-medium text-stone-800">{comp.progress} / {comp.target}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{comp.participants} players</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleJoin(comp.id)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      comp.joined
                        ? 'bg-stone-900/5 text-stone-700 border border-stone-200/70'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                    }`}
                  >
                    {comp.joined ? 'Joined ✓' : 'Join Challenge'}
                  </button>
                  <button
                    onClick={() => setActiveLeaderboard(activeLeaderboard === comp.id ? null : comp.id)}
                    className="p-2.5 rounded-xl bg-stone-900/5 text-stone-700 hover:text-stone-800 border border-stone-200/70 transition-colors"
                  >
                    <ChevronUp className={`w-4 h-4 transition-transform ${activeLeaderboard === comp.id ? '' : 'rotate-180'}`} />
                  </button>
                </div>
              </div>

              {/* Leaderboard */}
              {activeLeaderboard === comp.id && (
                <div className="border-t border-stone-200/70 p-4 space-y-1.5 bg-transparent">
                  <p className="text-[10px] text-stone-600 uppercase tracking-wider mb-2">Leaderboard</p>
                  {mockLeaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                        entry.isCurrentUser ? 'bg-emerald-500/10 border border-emerald-500/20' : 'hover:bg-transparent'
                      }`}
                    >
                      <span className={`w-6 text-center text-xs font-bold ${
                        entry.rank <= 3 ? 'text-amber-400' : 'text-stone-600'
                      }`}>
                        {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                      </span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        entry.isCurrentUser ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' : 'bg-stone-900/10'
                      }`}>
                        {entry.avatar}
                      </div>
                      <span className={`flex-1 text-sm ${entry.isCurrentUser ? 'text-emerald-400 font-semibold' : 'text-stone-700'}`}>
                        {entry.name} {entry.isCurrentUser && '(You)'}
                      </span>
                      <span className="text-sm font-mono text-stone-700">{entry.score.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-700">Achievements</h3>
          <span className="text-[10px] text-stone-600">{mockAchievements.filter(a => a.unlocked).length}/{mockAchievements.length} unlocked</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {mockAchievements.map((ach) => (
            <div
              key={ach.id}
              className={`rounded-2xl p-3.5 border text-center transition-all ${
                ach.unlocked
                  ? 'bg-gradient-to-b from-stone-900/[0.06] to-stone-900/[0.03] border-stone-200/70 hover:border-stone-900/15'
                  : 'bg-transparent border-stone-200/70 opacity-40 grayscale'
              }`}
            >
              <span className="text-3xl block mb-1.5">{ach.icon}</span>
              <p className="text-[10px] font-medium leading-tight">{ach.title}</p>
              {ach.unlocked && ach.date && <p className="text-[9px] text-stone-600 mt-0.5">{ach.date}</p>}
              {ach.unlocked && (
                <button
                  onClick={(e) => { e.stopPropagation(); shareContent(buildAchievementShareText(ach.title, ach.icon)); }}
                  className="mt-1.5 text-stone-600 hover:text-emerald-400 transition-colors"
                >
                  <Share2 className="w-3 h-3 mx-auto" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompetitionsPage;
