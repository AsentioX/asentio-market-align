import { usePrefs } from '../lib/usePrefs';
import { ROLE_LABELS, type Role } from '../data/schedule';

const ALL_ROLES: Role[] = ['all', 'driver', 'safety_officer', 'crew', 'strategy', 'media', 'adviser', 'volunteer', 'parent', 'judge'];
const LEAD_TIMES = [5, 10, 15, 30, 60];

const Settings = () => {
  const { prefs, update } = usePrefs();

  const toggleRole = (r: Role) => {
    const has = prefs.roles.includes(r);
    let next: Role[];
    if (r === 'all') {
      next = has ? [] : ['all'];
    } else {
      const withoutAll = prefs.roles.filter(x => x !== 'all');
      next = has ? withoutAll.filter(x => x !== r) : [...withoutAll, r];
      if (next.length === 0) next = ['all'];
    }
    update({ roles: next });
  };

  return (
    <div className="pt-[env(safe-area-inset-top)]">
      <div className="px-5 pt-8 pb-4">
        <div className="text-white/50 text-xs font-bold uppercase tracking-widest">Preferences</div>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Settings</h1>
      </div>

      <div className="px-4 space-y-6">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4">
          <h2 className="text-white font-bold text-sm">My Role</h2>
          <p className="text-xs text-white/50 mt-0.5">Only events relevant to your role appear. Events marked "All Participants" always show.</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {ALL_ROLES.map(r => {
              const on = prefs.roles.includes(r);
              return (
                <button
                  key={r}
                  onClick={() => toggleRole(r)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                    on
                      ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-black shadow-[0_6px_20px_-6px_rgba(251,146,60,0.5)]'
                      : 'bg-white/5 text-white/70 border border-white/10'
                  }`}
                >
                  {ROLE_LABELS[r]}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4">
          <h2 className="text-white font-bold text-sm">Default Reminder</h2>
          <p className="text-xs text-white/50 mt-0.5">Lead time before every event.</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {LEAD_TIMES.map(m => {
              const on = prefs.reminderMinutes === m;
              return (
                <button
                  key={m}
                  onClick={() => update({ reminderMinutes: m })}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                    on ? 'bg-white text-black' : 'bg-white/5 text-white/70 border border-white/10'
                  }`}
                >
                  {m} min
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4">
          <h2 className="text-white font-bold text-sm">About</h2>
          <p className="text-xs text-white/50 mt-1">
            Race Companion is a mission timeline for the 2026 Solar Car Challenge. All schedule data is stored on-device — works offline.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Settings;
