import { useState, useMemo } from 'react';
import { Search, Filter, ChevronRight, Lightbulb, X, Target, ArrowLeft, Plus, Sparkles } from 'lucide-react';
import { EXERCISE_LIBRARY, CATEGORY_CONFIG, type ExerciseCategory, type ExerciseDefinition } from './exerciseLibrary';
import { useWOBuddyGoals } from '@/hooks/useWOBuddyGoals';
import AddExerciseWizard from './AddExerciseWizard';
import { toast } from 'sonner';

interface ExerciseLibraryPageProps {
  onSelectExercise?: (exercise: ExerciseDefinition) => void;
  onBack?: () => void;
}

const ExerciseLibraryPage = ({ onSelectExercise, onBack }: ExerciseLibraryPageProps) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ExerciseCategory | 'all'>('all');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDefinition | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const { goals } = useWOBuddyGoals();

  const categories = Object.entries(CATEGORY_CONFIG) as [ExerciseCategory, typeof CATEGORY_CONFIG[ExerciseCategory]][];

  const filtered = useMemo(() => {
    return EXERCISE_LIBRARY.filter(e => {
      const matchesSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.category.includes(search.toLowerCase()) || e.purposeTags.some(t => t.includes(search.toLowerCase()));
      const matchesCategory = activeCategory === 'all' || e.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const connectedGoals = (exercise: ExerciseDefinition) => {
    return goals.filter(g => g.drivers.some(d => exercise.linkedDrivers.includes(d)));
  };

  // ── Detail Modal ──
  if (selectedExercise) {
    const ex = selectedExercise;
    const cat = CATEGORY_CONFIG[ex.category];
    const linked = connectedGoals(ex);

    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedExercise(null)} className="w-9 h-9 rounded-xl bg-stone-900/5 flex items-center justify-center text-stone-900/40 hover:text-stone-900/60">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-stone-900">{ex.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${cat.bg} ${cat.color} font-medium`}>{cat.label}</span>
              <span className="text-[10px] text-stone-900/30">{ex.subcategory}</span>
            </div>
          </div>
          <span className="text-3xl">{ex.icon}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-stone-900/50 leading-relaxed">{ex.description}</p>

        {/* Why This Matters */}
        <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 rounded-xl border border-amber-500/15 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-400">Why This Matters</span>
          </div>
          <p className="text-xs text-stone-900/60 leading-relaxed">{ex.whyItMatters}</p>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <span className="text-[9px] text-stone-900/30 uppercase tracking-wider">Short-Term</span>
              <p className="text-[11px] text-stone-900/50 mt-0.5 leading-relaxed">{ex.shortTermBenefit}</p>
            </div>
            <div>
              <span className="text-[9px] text-stone-900/30 uppercase tracking-wider">Long-Term</span>
              <p className="text-[11px] text-stone-900/50 mt-0.5 leading-relaxed">{ex.longTermBenefit}</p>
            </div>
          </div>
        </div>

        {/* Performance Drivers */}
        <div>
          <span className="text-[10px] text-stone-900/30 uppercase tracking-wider">Performance Drivers</span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {ex.linkedDrivers.map(d => (
              <span key={d} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900/5 text-[11px] text-stone-900/50 border border-stone-900/10">
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* Purpose Tags */}
        <div>
          <span className="text-[10px] text-stone-900/30 uppercase tracking-wider">Purpose Tags</span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {ex.purposeTags.map(t => (
              <span key={t} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-[11px] text-emerald-400/70 border border-emerald-500/10">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Linked Outcomes */}
        <div>
          <span className="text-[10px] text-stone-900/30 uppercase tracking-wider">Linked Outcomes</span>
          <div className="space-y-1 mt-2">
            {ex.linkedOutcomes.map(o => (
              <div key={o} className="flex items-center gap-2 text-xs text-stone-900/40">
                <span className="w-1 h-1 rounded-full bg-blue-400/60" />
                {o}
              </div>
            ))}
          </div>
        </div>

        {/* Default Metrics */}
        <div>
          <span className="text-[10px] text-stone-900/30 uppercase tracking-wider">Tracking Metrics</span>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {ex.defaultMetrics.map(m => (
              <div key={m.key} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-900/[0.04] border border-stone-900/10">
                <span className="text-xs text-stone-900/60">{m.label}</span>
                {m.unit && <span className="text-[10px] text-stone-900/25 ml-auto">{m.unit}</span>}
                {m.required && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />}
              </div>
            ))}
            {ex.optionalMetrics.map(m => (
              <div key={m.key} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-900/[0.03] border border-stone-900/[0.08]">
                <span className="text-xs text-stone-900/40">{m.label}</span>
                {m.unit && <span className="text-[10px] text-stone-900/20 ml-auto">{m.unit}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Connected Goals */}
        {linked.length > 0 && (
          <div>
            <span className="text-[10px] text-stone-900/30 uppercase tracking-wider">Connected to Your Goals</span>
            <div className="space-y-1.5 mt-2">
              {linked.map(g => (
                <div key={g.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <Target className="w-3.5 h-3.5 text-emerald-400/60" />
                  <span className="text-xs text-emerald-400/80">{g.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Log button */}
        {onSelectExercise && (
          <button
            onClick={() => onSelectExercise(ex)}
            className="w-full py-3.5 rounded-xl bg-emerald-500 text-stone-900 font-semibold text-sm active:bg-emerald-600 transition-colors"
          >
            Log {ex.name}
          </button>
        )}
      </div>
    );
  }

  // ── Add Exercise Wizard (full custom-exercise builder) ──
  if (showWizard) {
    return (
      <AddExerciseWizard
        goals={goals.map(g => ({ id: g.id, name: g.name, status: g.status }))}
        onBack={() => setShowWizard(false)}
        onSave={(ex) => {
          toast.success(`${ex.name} added`, {
            description: 'Available next time you build a workout.',
          });
          setShowWizard(false);
        }}
      />
    );
  }

  // ── Library List ──
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="w-9 h-9 rounded-xl bg-stone-900/5 flex items-center justify-center text-stone-900/40 hover:text-stone-900/60">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-stone-900">Exercise Library</h2>
          <p className="text-xs text-stone-900/40">{EXERCISE_LIBRARY.length} exercises across {categories.length} categories</p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-900/30" />
        <input
          type="text"
          placeholder="Search exercises, categories, purposes…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-stone-900/[0.05] border border-stone-900/10 rounded-xl pl-10 pr-4 py-3 text-sm text-stone-900 placeholder:text-stone-900/30 focus:outline-none focus:border-emerald-500/30"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-900/30">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
            activeCategory === 'all'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-stone-900/5 text-stone-900/40 border border-stone-900/10'
          }`}
        >
          All ({EXERCISE_LIBRARY.length})
        </button>
        {categories.map(([key, cfg]) => {
          const count = EXERCISE_LIBRARY.filter(e => e.category === key).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                activeCategory === key
                  ? `${cfg.bg} ${cfg.color} border ${cfg.border}`
                  : 'bg-stone-900/5 text-stone-900/40 border border-stone-900/10'
              }`}
            >
              {cfg.icon} {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Exercise grid */}
      <div className="space-y-2">
        {filtered.map(ex => {
          const cat = CATEGORY_CONFIG[ex.category];
          const linked = connectedGoals(ex);
          return (
            <button
              key={ex.id}
              onClick={() => setSelectedExercise(ex)}
              className={`w-full text-left bg-gradient-to-r ${ex.color} rounded-xl border ${cat.border} p-3.5 flex items-center gap-3 active:scale-[0.99] transition-transform`}
            >
              <div className="w-11 h-11 rounded-xl bg-stone-900/5 flex items-center justify-center text-xl flex-shrink-0">
                {ex.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-stone-900 truncate">{ex.name}</p>
                  {linked.length > 0 && (
                    <span className="flex items-center gap-0.5 text-[9px] text-emerald-400/70">
                      <Target className="w-2.5 h-2.5" /> {linked.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] ${cat.color}`}>{cat.label}</span>
                  <span className="text-[10px] text-stone-900/20">•</span>
                  <span className="text-[10px] text-stone-900/30">{ex.subcategory}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {ex.linkedDrivers.slice(0, 3).map(d => (
                    <span key={d} className="text-[9px] px-1.5 py-0.5 rounded bg-stone-900/5 text-stone-900/35">{d}</span>
                  ))}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-900/20 flex-shrink-0" />
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-stone-900/30">No exercises found</p>
          <p className="text-xs text-stone-900/20 mt-1">Try a different search or category</p>
        </div>
      )}
    </div>
  );
};

export default ExerciseLibraryPage;
