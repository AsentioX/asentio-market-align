import { useState } from 'react';
import { MapPin, Plus, Play, Pause, SkipBack, ChevronRight, Pencil, Trash2, Music2, Brain, X, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/hooks/useAuth';
import {
  useLocations, useCreateLocation, useDeleteLocation,
  useAudioScenes, useCreateScene, useToggleScene,
  useMemories, useCreateMemory, useDeleteMemory,
  DJLocation, DJAudioScene, DJMemoryAssociation,
} from '@/hooks/useMyDJScenes';

const LOCATION_ICON_MAP: Record<string, string> = {
  room: '🏠', home_zone: '🏡', gym_zone: '🏋️', outdoor_route: '🌳', workplace: '🏢', venue: '🎭',
};

const LOCATION_TYPES = [
  { value: 'room', label: 'Room', icon: '🏠' },
  { value: 'home_zone', label: 'Home Zone', icon: '🏡' },
  { value: 'gym_zone', label: 'Gym', icon: '🏋️' },
  { value: 'outdoor_route', label: 'Outdoor', icon: '🌳' },
  { value: 'workplace', label: 'Workplace', icon: '🏢' },
  { value: 'venue', label: 'Venue', icon: '🎭' },
];

const DETECTION_METHODS = [
  { value: 'manual', label: 'Manual' },
  { value: 'geofence', label: 'GPS Geofence' },
  { value: 'wifi_signature', label: 'Wi-Fi' },
  { value: 'beacon', label: 'Bluetooth Beacon' },
];

const ENTRY_BEHAVIORS = [
  { value: 'play', label: 'Play', icon: '▶️' },
  { value: 'resume', label: 'Resume', icon: '⏯️' },
  { value: 'shuffle', label: 'Shuffle', icon: '🔀' },
  { value: 'none', label: 'Do Nothing', icon: '⏸️' },
];

const EXIT_BEHAVIORS = [
  { value: 'pause', label: 'Pause', icon: '⏸️' },
  { value: 'stop', label: 'Stop', icon: '⏹️' },
  { value: 'fade_out', label: 'Fade Out', icon: '🔉' },
  { value: 'continue', label: 'Continue', icon: '▶️' },
];

const REENTRY_BEHAVIORS = [
  { value: 'resume', label: 'Resume', icon: '⏯️' },
  { value: 'restart_track', label: 'Restart Track', icon: '🔄' },
  { value: 'restart_playlist', label: 'Restart Playlist', icon: '🔁' },
];

const MEMORY_TYPES = ['nostalgia', 'ritual', 'family', 'celebration', 'focus', 'training', 'travel'];
const EMOTIONAL_INTENTS = ['comfort', 'joy', 'energy', 'calm', 'reflection', 'motivation'];

type ScenesView = 'locations' | 'location-detail' | 'add-location' | 'add-scene' | 'memories' | 'add-memory';

const MyDJScenes = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const { data: locations = [], isLoading: locLoading } = useLocations(userId);
  const { data: scenes = [], isLoading: scnLoading } = useAudioScenes(userId);
  const { data: memories = [], isLoading: memLoading } = useMemories(userId);

  const createLocation = useCreateLocation();
  const deleteLocation = useDeleteLocation();
  const createScene = useCreateScene();
  const toggleScene = useToggleScene();
  const createMemory = useCreateMemory();
  const deleteMemory = useDeleteMemory();

  const [view, setView] = useState<ScenesView>('locations');
  const [selectedLocation, setSelectedLocation] = useState<DJLocation | null>(null);
  const [activeLocationId] = useState<string | null>(null);

  // New location form
  const [newLocName, setNewLocName] = useState('');
  const [newLocType, setNewLocType] = useState('room');
  const [newLocDetection, setNewLocDetection] = useState('manual');

  // New scene form
  const [newSceneName, setNewSceneName] = useState('');
  const [newSceneGenre, setNewSceneGenre] = useState('');
  const [newSceneEntry, setNewSceneEntry] = useState('play');
  const [newSceneExit, setNewSceneExit] = useState('pause');
  const [newSceneReentry, setNewSceneReentry] = useState('resume');
  const [newSceneFadeIn, setNewSceneFadeIn] = useState(3);
  const [newSceneFadeOut, setNewSceneFadeOut] = useState(5);

  // New memory form
  const [newMemTitle, setNewMemTitle] = useState('');
  const [newMemNote, setNewMemNote] = useState('');
  const [newMemType, setNewMemType] = useState('ritual');
  const [newMemIntent, setNewMemIntent] = useState('comfort');
  const [newMemLocationId, setNewMemLocationId] = useState<string>('');
  const [newMemStrength, setNewMemStrength] = useState(50);

  const isLoading = locLoading || scnLoading || memLoading;

  const activeLocation = locations.find(l => l.id === activeLocationId);
  const activeScene = activeLocationId ? scenes.find(s => s.location_id === activeLocationId && s.is_active) : null;

  const getLocIcon = (loc: DJLocation) => LOCATION_ICON_MAP[loc.location_type] || '📍';

  const resetLocForm = () => { setNewLocName(''); setNewLocType('room'); setNewLocDetection('manual'); };
  const resetSceneForm = () => { setNewSceneName(''); setNewSceneGenre(''); setNewSceneEntry('play'); setNewSceneExit('pause'); setNewSceneReentry('resume'); setNewSceneFadeIn(3); setNewSceneFadeOut(5); };
  const resetMemForm = () => { setNewMemTitle(''); setNewMemNote(''); setNewMemType('ritual'); setNewMemIntent('comfort'); setNewMemLocationId(''); setNewMemStrength(50); };

  const handleSaveLocation = () => {
    if (!userId || !newLocName.trim()) return;
    createLocation.mutate({ user_id: userId, name: newLocName.trim(), location_type: newLocType, detection_method: newLocDetection }, {
      onSuccess: () => { resetLocForm(); setView('locations'); },
    });
  };

  const handleSaveScene = () => {
    if (!userId || !selectedLocation || !newSceneName.trim()) return;
    createScene.mutate({
      user_id: userId,
      location_id: selectedLocation.id,
      name: newSceneName.trim(),
      preferred_genre: newSceneGenre.trim() || null,
      entry_behavior: newSceneEntry,
      exit_behavior: newSceneExit,
      reentry_behavior: newSceneReentry,
      fade_in_seconds: newSceneFadeIn || null,
      fade_out_seconds: newSceneFadeOut || null,
    }, {
      onSuccess: () => { resetSceneForm(); setView('location-detail'); },
    });
  };

  const handleSaveMemory = () => {
    if (!userId || !newMemTitle.trim()) return;
    createMemory.mutate({
      user_id: userId,
      title: newMemTitle.trim(),
      note: newMemNote.trim() || null,
      location_id: newMemLocationId || null,
      memory_type: newMemType,
      emotional_intent: newMemIntent,
      strength_score: newMemStrength,
    }, {
      onSuccess: () => { resetMemForm(); setView('memories'); },
    });
  };

  if (!userId) {
    return (
      <div className="bg-white/5 rounded-xl p-8 text-center">
        <MapPin className="w-8 h-8 text-white/10 mx-auto mb-2" />
        <p className="text-sm text-white/30">Sign in to create Audio Scenes</p>
        <p className="text-xs text-white/20 mt-1">Locations, scenes, and memories are saved to your account</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
      </div>
    );
  }

  // ─── Add Location ───
  if (view === 'add-location') {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">New Location</h2>
          <button onClick={() => { resetLocForm(); setView('locations'); }} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="bg-white/5 rounded-xl p-4 space-y-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Name</label>
            <input value={newLocName} onChange={e => setNewLocName(e.target.value)} placeholder="e.g. Kitchen, Office" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/40" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-2 block">Type</label>
            <div className="grid grid-cols-3 gap-1.5">
              {LOCATION_TYPES.map(lt => (
                <button key={lt.value} onClick={() => setNewLocType(lt.value)}
                  className={`p-2 rounded-lg text-center transition-all ${newLocType === lt.value ? 'bg-violet-500/20 ring-1 ring-violet-500/30' : 'bg-white/5 hover:bg-white/10'}`}>
                  <span className="text-lg">{lt.icon}</span>
                  <p className="text-[10px] text-white/50 mt-0.5">{lt.label}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-2 block">Detection Method</label>
            <div className="grid grid-cols-2 gap-1.5">
              {DETECTION_METHODS.map(dm => (
                <button key={dm.value} onClick={() => setNewLocDetection(dm.value)}
                  className={`p-2.5 rounded-lg text-xs text-center transition-all ${newLocDetection === dm.value ? 'bg-violet-500/20 ring-1 ring-violet-500/30 text-violet-300' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                  {dm.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={handleSaveLocation} disabled={createLocation.isPending || !newLocName.trim()}
          className="w-full rounded-xl p-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
          {createLocation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Location
        </button>
      </div>
    );
  }

  // ─── Add Scene ───
  if (view === 'add-scene' && selectedLocation) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">New Audio Scene</h2>
          <button onClick={() => { resetSceneForm(); setView('location-detail'); }} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-xs text-white/40">for {getLocIcon(selectedLocation)} {selectedLocation.name}</p>
        <div className="bg-white/5 rounded-xl p-4 space-y-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Scene Name</label>
            <input value={newSceneName} onChange={e => setNewSceneName(e.target.value)} placeholder="e.g. Cooking Vibes" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/40" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Genre / Style</label>
            <input value={newSceneGenre} onChange={e => setNewSceneGenre(e.target.value)} placeholder="e.g. Salsa, Lo-fi, Ambient" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/40" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-2 block">On Entry</label>
            <div className="grid grid-cols-4 gap-1">
              {ENTRY_BEHAVIORS.map(b => (
                <button key={b.value} onClick={() => setNewSceneEntry(b.value)}
                  className={`p-2 rounded-lg text-center transition-all ${newSceneEntry === b.value ? 'bg-emerald-500/20 ring-1 ring-emerald-500/30' : 'bg-white/5 hover:bg-white/10'}`}>
                  <span className="text-sm">{b.icon}</span>
                  <p className="text-[9px] text-white/50 mt-0.5">{b.label}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-2 block">On Exit</label>
            <div className="grid grid-cols-4 gap-1">
              {EXIT_BEHAVIORS.map(b => (
                <button key={b.value} onClick={() => setNewSceneExit(b.value)}
                  className={`p-2 rounded-lg text-center transition-all ${newSceneExit === b.value ? 'bg-amber-500/20 ring-1 ring-amber-500/30' : 'bg-white/5 hover:bg-white/10'}`}>
                  <span className="text-sm">{b.icon}</span>
                  <p className="text-[9px] text-white/50 mt-0.5">{b.label}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-2 block">On Re-entry</label>
            <div className="grid grid-cols-3 gap-1">
              {REENTRY_BEHAVIORS.map(b => (
                <button key={b.value} onClick={() => setNewSceneReentry(b.value)}
                  className={`p-2 rounded-lg text-center transition-all ${newSceneReentry === b.value ? 'bg-sky-500/20 ring-1 ring-sky-500/30' : 'bg-white/5 hover:bg-white/10'}`}>
                  <span className="text-sm">{b.icon}</span>
                  <p className="text-[9px] text-white/50 mt-0.5">{b.label}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/50 mb-2 block">Fade In ({newSceneFadeIn}s)</label>
              <Slider value={[newSceneFadeIn]} onValueChange={([v]) => setNewSceneFadeIn(v)} min={0} max={15} step={1} />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-2 block">Fade Out ({newSceneFadeOut}s)</label>
              <Slider value={[newSceneFadeOut]} onValueChange={([v]) => setNewSceneFadeOut(v)} min={0} max={15} step={1} />
            </div>
          </div>
        </div>
        <button onClick={handleSaveScene} disabled={createScene.isPending || !newSceneName.trim()}
          className="w-full rounded-xl p-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
          {createScene.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Scene
        </button>
      </div>
    );
  }

  // ─── Add Memory ───
  if (view === 'add-memory') {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">New Memory</h2>
          <button onClick={() => { resetMemForm(); setView('memories'); }} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="bg-white/5 rounded-xl p-4 space-y-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Title</label>
            <input value={newMemTitle} onChange={e => setNewMemTitle(e.target.value)} placeholder="e.g. Family cooking nights" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/40" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Note</label>
            <textarea value={newMemNote} onChange={e => setNewMemNote(e.target.value)} placeholder="Why does this matter to you?" rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/40 resize-none" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Linked Location</label>
            <div className="flex gap-1.5 flex-wrap">
              {locations.map(l => (
                <button key={l.id} onClick={() => setNewMemLocationId(l.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${newMemLocationId === l.id ? 'bg-violet-500/20 ring-1 ring-violet-500/30 text-violet-300' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                  {getLocIcon(l)} {l.name}
                </button>
              ))}
              {locations.length === 0 && <span className="text-xs text-white/20">Create a location first</span>}
            </div>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-2 block">Memory Type</label>
            <div className="flex gap-1.5 flex-wrap">
              {MEMORY_TYPES.map(t => (
                <button key={t} onClick={() => setNewMemType(t)}
                  className={`px-3 py-1 rounded-full text-xs capitalize transition-all ${newMemType === t ? 'bg-violet-500/20 ring-1 ring-violet-500/30 text-violet-300' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-2 block">Emotional Intent</label>
            <div className="flex gap-1.5 flex-wrap">
              {EMOTIONAL_INTENTS.map(e => (
                <button key={e} onClick={() => setNewMemIntent(e)}
                  className={`px-3 py-1 rounded-full text-xs capitalize transition-all ${newMemIntent === e ? 'bg-amber-500/20 ring-1 ring-amber-500/30 text-amber-300' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-2 block">Memory Strength ({newMemStrength}%)</label>
            <Slider value={[newMemStrength]} onValueChange={([v]) => setNewMemStrength(v)} min={0} max={100} step={5} />
          </div>
        </div>
        <button onClick={handleSaveMemory} disabled={createMemory.isPending || !newMemTitle.trim()}
          className="w-full rounded-xl p-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
          {createMemory.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Memory
        </button>
      </div>
    );
  }

  // ─── Location Detail ───
  if (view === 'location-detail' && selectedLocation) {
    const locationScenes = scenes.filter(s => s.location_id === selectedLocation.id);
    const locationMemories = memories.filter(m => m.location_id === selectedLocation.id);

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => { setView('locations'); setSelectedLocation(null); }} className="text-white/40 hover:text-white text-xs">← Back</button>
          <button onClick={() => deleteLocation.mutate(selectedLocation.id, { onSuccess: () => { setSelectedLocation(null); setView('locations'); } })}
            className="text-white/30 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
        </div>

        <div className="bg-white/5 rounded-2xl p-5 text-center">
          <span className="text-4xl">{getLocIcon(selectedLocation)}</span>
          <h2 className="text-xl font-bold text-white mt-2">{selectedLocation.name}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-[10px] text-white/30 capitalize px-2 py-0.5 bg-white/5 rounded-full">{selectedLocation.location_type.replace('_', ' ')}</span>
            <span className="text-[10px] text-white/30 capitalize px-2 py-0.5 bg-white/5 rounded-full">{selectedLocation.detection_method.replace('_', ' ')}</span>
          </div>
          {activeLocationId === selectedLocation.id && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-medium">You're here now</span>
            </div>
          )}
        </div>

        {/* Audio Scenes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-white/50 uppercase tracking-wider">Audio Scenes</p>
            <button onClick={() => { resetSceneForm(); setView('add-scene'); }} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          {locationScenes.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-6 text-center text-white/30 text-sm">
              No scenes yet — create one to give this place a soundtrack
            </div>
          ) : (
            <div className="space-y-2">
              {locationScenes.map(scene => (
                <div key={scene.id} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-white">{scene.name}</p>
                    <Switch checked={scene.is_active} onCheckedChange={(val) => toggleScene.mutate({ id: scene.id, is_active: val })} />
                  </div>
                  {scene.preferred_genre && <p className="text-xs text-violet-400 mb-2">♫ {scene.preferred_genre}</p>}
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-[9px] text-white/30">Entry</p>
                      <p className="text-xs text-emerald-400 capitalize">{scene.entry_behavior}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-[9px] text-white/30">Exit</p>
                      <p className="text-xs text-amber-400 capitalize">{scene.exit_behavior.replace('_', ' ')}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-[9px] text-white/30">Re-enter</p>
                      <p className="text-xs text-sky-400 capitalize">{scene.reentry_behavior.replace('_', ' ')}</p>
                    </div>
                  </div>
                  {(scene.fade_in_seconds || scene.fade_out_seconds) && (
                    <p className="text-[10px] text-white/20 mt-2">
                      Fade: {scene.fade_in_seconds}s in · {scene.fade_out_seconds}s out
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Linked Memories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-white/50 uppercase tracking-wider">Memories</p>
            <button onClick={() => { setNewMemLocationId(selectedLocation.id); setView('add-memory'); }} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          {locationMemories.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-4 text-center text-white/20 text-xs">
              No memories linked to this place
            </div>
          ) : (
            <div className="space-y-2">
              {locationMemories.map(mem => (
                <div key={mem.id} className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{mem.title}</p>
                      {mem.note && <p className="text-xs text-white/40 mt-0.5">{mem.note}</p>}
                      <div className="flex gap-1.5 mt-2">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-[10px] text-amber-400 capitalize">{mem.emotional_intent}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-white/40 capitalize">{mem.memory_type}</span>
                      </div>
                    </div>
                    <button onClick={() => deleteMemory.mutate(mem.id)} className="text-white/20 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Memories List ───
  if (view === 'memories') {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Memories</h2>
            <p className="text-xs text-white/40">Music tied to meaning</p>
          </div>
          <button onClick={() => { resetMemForm(); setView('add-memory'); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 text-xs hover:bg-violet-500/30 transition-colors">
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setView('locations')} className="px-3 py-1 rounded-full text-xs bg-white/5 text-white/50 hover:bg-white/10">Locations</button>
          <button className="px-3 py-1 rounded-full text-xs bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30">Memories</button>
        </div>

        {memories.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-8 text-center">
            <Brain className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-sm text-white/30">No memories yet</p>
            <p className="text-xs text-white/20 mt-1">Link music to places, routines, and feelings</p>
          </div>
        ) : (
          <div className="space-y-2">
            {memories.map(mem => {
              const loc = locations.find(l => l.id === mem.location_id);
              return (
                <div key={mem.id} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{mem.title}</p>
                      {mem.note && <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{mem.note}</p>}
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {loc && <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-white/40">{getLocIcon(loc)} {loc.name}</span>}
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-[10px] text-amber-400 capitalize">{mem.emotional_intent}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-white/30 capitalize">{mem.memory_type}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        <span className="text-[10px] text-white/40">{mem.strength_score}%</span>
                      </div>
                      <button onClick={() => deleteMemory.mutate(mem.id)} className="text-white/15 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ─── Default: Locations List ───
  return (
    <div className="space-y-5">
      {activeLocation && activeScene && (
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <span className="text-xl">{getLocIcon(activeLocation)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs text-emerald-400 font-medium">Active Scene</p>
              </div>
              <p className="text-sm font-semibold text-white">{activeScene.name}</p>
              <p className="text-xs text-white/40">{activeLocation.name} · {activeScene.preferred_genre || 'Adaptive'}</p>
            </div>
            <Music2 className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Audio Scenes</h2>
          <p className="text-xs text-white/40">Music that lives in your spaces</p>
        </div>
        <button onClick={() => { resetLocForm(); setView('add-location'); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 text-xs hover:bg-violet-500/30 transition-colors">
          <Plus className="w-3.5 h-3.5" /> New Place
        </button>
      </div>

      <div className="flex gap-2">
        <button className="px-3 py-1 rounded-full text-xs bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30">Locations</button>
        <button onClick={() => setView('memories')} className="px-3 py-1 rounded-full text-xs bg-white/5 text-white/50 hover:bg-white/10">Memories</button>
      </div>

      {locations.length === 0 ? (
        <div className="bg-white/5 rounded-xl p-8 text-center">
          <MapPin className="w-8 h-8 text-white/10 mx-auto mb-2" />
          <p className="text-sm text-white/30">No locations yet</p>
          <p className="text-xs text-white/20 mt-1">Add a place to start building audio scenes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {locations.map(loc => {
            const locScene = scenes.find(s => s.location_id === loc.id && s.is_active);
            const locMemories = memories.filter(m => m.location_id === loc.id);
            const isActive = activeLocationId === loc.id;

            return (
              <button
                key={loc.id}
                onClick={() => { setSelectedLocation(loc); setView('location-detail'); }}
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all text-left ${
                  isActive ? 'bg-emerald-500/5 ring-1 ring-emerald-500/20' : 'bg-white/5 hover:bg-white/[0.07]'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isActive ? 'bg-emerald-500/20' : 'bg-white/5'
                }`}>
                  <span className="text-xl">{getLocIcon(loc)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{loc.name}</p>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {locScene && <span className="text-xs text-violet-400">♫ {locScene.preferred_genre || locScene.name}</span>}
                    {locMemories.length > 0 && <span className="text-[10px] text-amber-400/60">🧠 {locMemories.length}</span>}
                    {!locScene && !locMemories.length && <span className="text-xs text-white/20">No scene configured</span>}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyDJScenes;
