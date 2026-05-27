import { Activity, Flag, Gauge, Route, Timer, Trash2 } from 'lucide-react';
import type { Piece } from './usePieceDetector';

interface Props {
  currentPiece: Piece | null;
  pieces: Piece[];
  onClear: () => void;
  /** True while the session is active — so we know whether to invite the rower
   *  to "turn around and pick it up" or just show history. */
  sessionActive: boolean;
}

const formatDur = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
};

const formatPace = (secPer500: number | null) => {
  if (!secPer500 || secPer500 <= 0) return '—';
  const m = Math.floor(secPer500 / 60);
  const s = Math.round(secPer500 % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

export function PiecesWidget({ currentPiece, pieces, onClear, sessionActive }: Props) {
  const empty = !currentPiece && pieces.length === 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-[hsl(0_0%_100%)] p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-600">
          <Flag className="w-4 h-4" />
          Workout pieces
          {pieces.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-semibold normal-case tracking-normal">
              {pieces.length}
            </span>
          )}
        </div>
        {pieces.length > 0 && (
          <button
            onClick={onClear}
            className="text-[11px] text-slate-500 hover:text-rose-600 inline-flex items-center gap-1 transition"
            title="Clear pieces"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {empty && (
        <p className="text-[12px] text-slate-500 leading-snug">
          {sessionActive
            ? 'Turn the boat around and pick up the pace — a piece will start automatically and log distance, stroke rate, and pace.'
            : 'Start a row to auto-detect pieces.'}
        </p>
      )}

      {currentPiece && (
        <div className="rounded-lg border border-cyan-400/60 bg-cyan-50/40 px-3 py-2 mb-2 animate-in fade-in slide-in-from-top-1 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="relative inline-flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-cyan-500 animate-ping opacity-75" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-cyan-600" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-800">
                Piece in progress
              </span>
            </div>
            <div className="text-[11px] font-mono text-cyan-900">
              {formatDur(Date.now() - currentPiece.startedAt)}
            </div>
          </div>
          <PieceStatsRow piece={currentPiece} />
        </div>
      )}

      {pieces.length > 0 && (
        <ul className="space-y-1.5">
          {pieces.map((p, i) => (
            <li
              key={p.id}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold text-slate-700">
                  Piece {i + 1}
                  <span className="ml-2 font-mono text-slate-500 font-normal">
                    {formatDur((p.endedAt ?? Date.now()) - p.startedAt)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {new Date(p.startedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
              <PieceStatsRow piece={p} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function PieceStatsRow({ piece }: { piece: Piece }) {
  return (
    <div className="grid grid-cols-3 gap-2 mt-1.5">
      <Stat
        icon={<Route className="w-3 h-3" />}
        label="Distance"
        value={`${Math.round(piece.distanceMeters)} m`}
      />
      <Stat
        icon={<Activity className="w-3 h-3" />}
        label="Stroke rate"
        value={piece.avgSpm !== null ? `${piece.avgSpm} spm` : '—'}
      />
      <Stat
        icon={<Gauge className="w-3 h-3" />}
        label="Pace / 500m"
        value={formatPace(piece.avgPaceSecPer500)}
        mono
      />
    </div>
  );
}

function Stat({ icon, label, value, mono = false }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-slate-500">
        {icon}
        {label}
      </div>
      <div className={`text-[13px] font-semibold text-slate-900 leading-tight mt-0.5 ${mono ? 'font-mono' : ''}`}>
        {value}
      </div>
    </div>
  );
}
