import { useState } from 'react';
import { Watch, Smartphone, Radio, Bell, Moon, Volume2, Wifi } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const MyDJSettings = () => {
  const [autoPlay, setAutoPlay] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [sleepTimer, setSleepTimer] = useState(false);
  const [crossfade, setCrossfade] = useState(true);
  const [connectedSource, setConnectedSource] = useState<string | null>('apple-music');

  const sources = [
    { id: 'spotify', name: 'Spotify', icon: '🟢', connected: false },
    { id: 'apple-music', name: 'Apple Music', icon: '🍎', connected: true },
    { id: 'youtube-music', name: 'YouTube Music', icon: '▶️', connected: false },
  ];

  const wearables = [
    { name: 'Apple Watch Series 10', type: 'watch', connected: true, icon: Watch },
    { name: 'iPhone 16 Pro', type: 'phone', connected: true, icon: Smartphone },
    { name: 'Oura Ring Gen 4', type: 'ring', connected: false, icon: Radio },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Settings</h2>
        <p className="text-xs text-white/40">Configure your DJ experience</p>
      </div>

      {/* Music Source */}
      <div className="bg-white/5 rounded-xl p-4">
        <p className="text-xs text-white/50 uppercase tracking-wider mb-3">Music Source</p>
        <div className="space-y-2">
          {sources.map((s) => (
            <button
              key={s.id}
              onClick={() => setConnectedSource(s.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                connectedSource === s.id
                  ? 'bg-violet-500/10 ring-1 ring-violet-500/30'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="text-xl">{s.icon}</span>
              <div className="text-left flex-1">
                <p className="text-sm font-medium text-white">{s.name}</p>
                <p className="text-[10px] text-white/40">
                  {connectedSource === s.id ? 'Connected' : 'Tap to connect'}
                </p>
              </div>
              {connectedSource === s.id && (
                <Wifi className="w-4 h-4 text-violet-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Wearable Devices */}
      <div className="bg-white/5 rounded-xl p-4">
        <p className="text-xs text-white/50 uppercase tracking-wider mb-3">Wearable Devices</p>
        <div className="space-y-2">
          {wearables.map((w) => {
            const Icon = w.icon;
            return (
              <div key={w.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <Icon className={`w-5 h-5 ${w.connected ? 'text-violet-400' : 'text-white/30'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{w.name}</p>
                  <p className={`text-[10px] ${w.connected ? 'text-emerald-400' : 'text-white/30'}`}>
                    {w.connected ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white/5 rounded-xl p-4 space-y-4">
        <p className="text-xs text-white/50 uppercase tracking-wider">Preferences</p>
        {[
          { icon: Volume2, label: 'Auto-play on mode change', state: autoPlay, toggle: setAutoPlay },
          { icon: Bell, label: 'Session reminders', state: notifications, toggle: setNotifications },
          { icon: Moon, label: 'Sleep timer', state: sleepTimer, toggle: setSleepTimer },
          { icon: Radio, label: 'Crossfade tracks', state: crossfade, toggle: setCrossfade },
        ].map(({ icon: Icon, label, state, toggle }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4 text-white/40" />
              <span className="text-sm text-white/70">{label}</span>
            </div>
            <Switch checked={state} onCheckedChange={toggle} />
          </div>
        ))}
      </div>

      {/* Version */}
      <div className="text-center text-[10px] text-white/20 pt-4">
        My DJ v0.1.0 — Asentio Labs
      </div>
    </div>
  );
};

export default MyDJSettings;
