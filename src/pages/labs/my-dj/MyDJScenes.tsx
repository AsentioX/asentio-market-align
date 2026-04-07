import { useState } from 'react';
import { MapPin, Plus, Play, Pause, SkipBack, ChevronRight, Pencil, Trash2, Music2, Brain, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface Location {
  id: string;
  name: string;
  locationType: string;
  detectionMethod: string;
  isActive: boolean;
  icon: string;
}

interface AudioScene {
  id: string;
  locationId: string;
  name: string;
  preferredGenre: string | null;
  preferredArtist: string | null;
  entryBehavior: string;
  exitBehavior: string;
  reentryBehavior: string;
  fadeInSeconds: number | null;
  fadeOutSeconds: number | null;
  priority: number;
  isActive: boolean;
}

interface MemoryAssociation {
  id: string;
  locationId: string | null;
  title: string;
  note: string | null;
  memoryType: string;
  emotionalIntent: string;
  strengthScore: number;
}

// Mock data
const MOCK_LOCATIONS: Location[] = [
  { id: '1', name: 'Kitchen', locationType: 'room', detectionMethod: 'wifi_signature', isActive: true, icon: '🍳' },
  { id: '2', name: 'Home Office', locationType: 'room', detectionMethod: 'wifi_signature', isActive: true, icon: '💻' },
  { id: '3', name: 'Bedroom', locationType: 'room', detectionMethod: 'wifi_signature', isActive: true, icon: '🛏️' },
  { id: '4', name: 'Garage Gym', locationType: 'gym_zone', detectionMethod: 'beacon', isActive: true, icon: '🏋️' },
  { id: '5', name: 'Running Trail', locationType: 'outdoor_route', detectionMethod: 'geofence', isActive: false, icon: '🏃' },
];

const MOCK_SCENES: AudioScene[] = [
  { id: 's1', locationId: '1', name: 'Cooking Salsa', preferredGenre: 'Salsa', preferredArtist: null, entryBehavior: 'resume', exitBehavior: 'pause', reentryBehavior: 'resume', fadeInSeconds: 3, fadeOutSeconds: 5, priority: 100, isActive: true },
  { id: 's2', locationId: '2', name: 'Deep Focus', preferredGenre: 'Lo-fi', preferredArtist: null, entryBehavior: 'play', exitBehavior: 'pause', reentryBehavior: 'resume', fadeInSeconds: 5, fadeOutSeconds: 3, priority: 100, isActive: true },
  { id: 's3', locationId: '3', name: 'Wind Down', preferredGenre: 'Ambient', preferredArtist: null, entryBehavior: 'play', exitBehavior: 'fade_out', reentryBehavior: 'restart_track', fadeInSeconds: 8, fadeOutSeconds: 10, priority: 100, isActive: true },
  { id: 's4', locationId: '4', name: 'Workout Mix', preferredGenre: 'Electronic', preferredArtist: null, entryBehavior: 'shuffle', exitBehavior: 'pause', reentryBehavior: 'resume', fadeInSeconds: 2, fadeOutSeconds: 3, priority: 100, isActive: true },
];

const MOCK_MEMORIES: MemoryAssociation[] = [
  { id: 'm1', locationId: '1', title: 'Family cooking & dancing', note: 'Sunday mornings with the family, salsa music and pancakes', memoryType: 'family', emotionalIntent: 'joy', strengthScore: 90 },
  { id: 'm2', locationId: '5', title: 'College training runs', note: 'Early morning runs through campus — nostalgic workout energy', memoryType: 'nostalgia', emotionalIntent: 'motivation', strengthScore: 75 },
  { id: 'm3', locationId: '3', title: 'Evening ritual', note: 'Winding down with ambient sounds and soft piano', memoryType: 'ritual', emotionalIntent: 'calm', strengthScore: 85 },
];

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
  const [view, setView] = useState<ScenesView>('locations');
  const [locations] = useState<Location[]>(MOCK_LOCATIONS);
  const [scenes] = useState<AudioScene[]>(MOCK_SCENES);
  const [memories] = useState<MemoryAssociation[]>(MOCK_MEMORIES);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [activeLocationId, setActiveLocationId] = useState<string | null>('1'); // Simulated: user is in kitchen

  // New location form
  const [newLocName, setNewLocName] = useState('');
  const [newLocType, setNewLocType] = useState('room');
  const [newLocDetection, setNewLocDetection] = useState('manual');
  const [newLocIcon, setNewLocIcon] = useState('📍');

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

  const activeLocation = locations.find(l => l.id === activeLocationId);
  const activeScene = activeLocationId ? scenes.find(s => s.locationId === activeLocationId && s.isActive) : null;

  if (view === 'add-location') {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">New Location</h2>
          <button onClick={() => setView('locations')} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
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
                <button key={lt.value} onClick={() => { setNewLocType(lt.value); setNewLocIcon(lt.icon); }}
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

        <button onClick={() => setView('locations')}
          className="w-full rounded-xl p-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold text-sm">
          Save Location
        </button>
      </div>
    );
  }

  if (view === 'add-scene' && selectedLocation) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">New Audio Scene</h2>
          <button onClick={() => setView('location-detail')} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-xs text-white/40">for {selectedLocation.icon} {selectedLocation.name}</p>

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

        <button onClick={() => setView('location-detail')}
          className="w-full rounded-xl p-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold text-sm">
          Save Scene
        </button>
      </div>
    );
  }

  if (view === 'add-memory') {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">New Memory</h2>
          <button onClick={() => setView('memories')} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
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
                  {l.icon} {l.name}
                </button>
              ))}
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

        <button onClick={() => setView('memories')}
          className="w-full rounded-xl p-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold text-sm">
          Save Memory
        </button>
      </div>
    );
  }

  if (view === 'location-detail' && selectedLocation) {
    const locationScenes = scenes.filter(s => s.locationId === selectedLocation.id);
    const locationMemories = memories.filter(m => m.locationId === selectedLocation.id);

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => { setView('locations'); setSelectedLocation(null); }} className="text-white/40 hover:text-white text-xs">← Back</button>
          <div className="flex gap-2">
            <button className="text-white/30 hover:text-white"><Pencil className="w-4 h-4" /></button>
            <button className="text-white/30 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Location Header */}
        <div className="bg-white/5 rounded-2xl p-5 text-center">
          <span className="text-4xl">{selectedLocation.icon}</span>
          <h2 className="text-xl font-bold text-white mt-2">{selectedLocation.name}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-[10px] text-white/30 capitalize px-2 py-0.5 bg-white/5 rounded-full">{selectedLocation.locationType.replace('_', ' ')}</span>
            <span className="text-[10px] text-white/30 capitalize px-2 py-0.5 bg-white/5 rounded-full">{selectedLocation.detectionMethod.replace('_', ' ')}</span>
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
            <button onClick={() => setView('add-scene')} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
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
                    <Switch checked={scene.isActive} />
                  </div>
                  {scene.preferredGenre && <p className="text-xs text-violet-400 mb-2">♫ {scene.preferredGenre}</p>}
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-[9px] text-white/30">Entry</p>
                      <p className="text-xs text-emerald-400 capitalize">{scene.entryBehavior}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-[9px] text-white/30">Exit</p>
                      <p className="text-xs text-amber-400 capitalize">{scene.exitBehavior.replace('_', ' ')}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-[9px] text-white/30">Re-enter</p>
                      <p className="text-xs text-sky-400 capitalize">{scene.reentryBehavior.replace('_', ' ')}</p>
                    </div>
                  </div>
                  {(scene.fadeInSeconds || scene.fadeOutSeconds) && (
                    <p className="text-[10px] text-white/20 mt-2">
                      Fade: {scene.fadeInSeconds}s in · {scene.fadeOutSeconds}s out
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
                    <div>
                      <p className="text-sm font-medium text-white">{mem.title}</p>
                      {mem.note && <p className="text-xs text-white/40 mt-0.5">{mem.note}</p>}
                      <div className="flex gap-1.5 mt-2">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-[10px] text-amber-400 capitalize">{mem.emotionalIntent}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-white/40 capitalize">{mem.memoryType}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === 'memories') {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Memories</h2>
            <p className="text-xs text-white/40">Music tied to meaning</p>
          </div>
          <button onClick={() => setView('add-memory')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 text-xs hover:bg-violet-500/30 transition-colors">
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>

        {/* Sub-nav */}
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
              const loc = locations.find(l => l.id === mem.locationId);
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
                        {loc && <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-white/40">{loc.icon} {loc.name}</span>}
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-[10px] text-amber-400 capitalize">{mem.emotionalIntent}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-white/30 capitalize">{mem.memoryType}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        <span className="text-[10px] text-white/40">{mem.strengthScore}%</span>
                      </div>
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

  // Default: Locations list view
  return (
    <div className="space-y-5">
      {/* Active Scene Banner */}
      {activeLocation && activeScene && (
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <span className="text-xl">{activeLocation.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs text-emerald-400 font-medium">Active Scene</p>
              </div>
              <p className="text-sm font-semibold text-white">{activeScene.name}</p>
              <p className="text-xs text-white/40">{activeLocation.name} · {activeScene.preferredGenre || 'Adaptive'}</p>
            </div>
            <div className="flex items-center gap-2 text-white/30">
              <Music2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Audio Scenes</h2>
          <p className="text-xs text-white/40">Music that lives in your spaces</p>
        </div>
        <button onClick={() => setView('add-location')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 text-xs hover:bg-violet-500/30 transition-colors">
          <Plus className="w-3.5 h-3.5" /> New Place
        </button>
      </div>

      {/* Sub-nav */}
      <div className="flex gap-2">
        <button className="px-3 py-1 rounded-full text-xs bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30">Locations</button>
        <button onClick={() => setView('memories')} className="px-3 py-1 rounded-full text-xs bg-white/5 text-white/50 hover:bg-white/10">Memories</button>
      </div>

      {/* Location Cards */}
      <div className="space-y-2">
        {locations.map(loc => {
          const locScene = scenes.find(s => s.locationId === loc.id && s.isActive);
          const locMemories = memories.filter(m => m.locationId === loc.id);
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
                <span className="text-xl">{loc.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">{loc.name}</p>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {locScene && <span className="text-xs text-violet-400">♫ {locScene.preferredGenre || locScene.name}</span>}
                  {locMemories.length > 0 && <span className="text-[10px] text-amber-400/60">🧠 {locMemories.length}</span>}
                  {!locScene && !locMemories.length && <span className="text-xs text-white/20">No scene configured</span>}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MyDJScenes;
