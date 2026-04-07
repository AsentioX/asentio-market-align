import { useState } from 'react';
import { Music2, Heart, SkipForward, Clock, Search } from 'lucide-react';
import { getTrackDB } from './musicEngine';

const MyDJLibrary = () => {
  const [filter, setFilter] = useState('');
  const tracks = getTrackDB();
  const filtered = tracks.filter(t =>
    t.title.toLowerCase().includes(filter.toLowerCase()) ||
    t.artist.toLowerCase().includes(filter.toLowerCase()) ||
    t.genre.toLowerCase().includes(filter.toLowerCase())
  );

  // Simulated preferences
  const liked = ['Neural Flow', 'Cloud Nine', 'Mind Garden'];
  const skipped = ['Grind State'];

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Music Library</h2>
        <p className="text-xs text-white/40">Tracks adapted to your state</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search tracks, artists, genres..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/40"
        />
      </div>

      {/* Genre Tags */}
      <div className="flex gap-1.5 flex-wrap">
        {['All', 'Ambient', 'Lo-fi', 'Electronic', 'Classical', 'Nature'].map((g) => (
          <button
            key={g}
            onClick={() => setFilter(g === 'All' ? '' : g)}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              (g === 'All' && !filter) || filter.toLowerCase() === g.toLowerCase()
                ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Track List */}
      <div className="space-y-1">
        {filtered.map((track) => {
          const isLiked = liked.includes(track.title);
          const isSkipped = skipped.includes(track.title);
          return (
            <div
              key={track.title}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                isSkipped ? 'opacity-40' : 'hover:bg-white/5'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center flex-shrink-0">
                <Music2 className="w-4 h-4 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{track.title}</p>
                <p className="text-xs text-white/40 truncate">{track.artist} • {track.genre}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isLiked && <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />}
                {isSkipped && <SkipForward className="w-3.5 h-3.5 text-white/30" />}
                <div className="flex items-center gap-1 text-white/30">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px]">{formatDuration(track.duration)}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <div className="w-1 h-6 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-full bg-violet-400 rounded-full" style={{ height: `${(track.baseBpm / 180) * 100}%`, marginTop: 'auto' }} />
                </div>
                <div className="w-1 h-6 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-full bg-amber-400 rounded-full" style={{ height: `${track.baseEnergy}%`, marginTop: 'auto' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-white/30 text-sm">No matching tracks</div>
      )}
    </div>
  );
};

export default MyDJLibrary;
