// Core hook that ties state engine + music engine + wearable data together

import { useState, useEffect, useRef, useCallback } from 'react';
import { UserMode, BioInputs, computeState, StateSnapshot, getTimeOfDay } from './stateEngine';
import { MusicParams, NowPlaying, computeMusicParams, selectTrack, SelectionFlavor, getTrackDB } from './musicEngine';
import { getAudioEngine } from './audioEngine';
import { getGenerativeEngine } from './generativeEngine';
import { getYouTubeEngine } from './youtubeEngine';
import {
  YouTubeSeed,
  YouTubeTrack,
  selectYouTubeTrack,
  previousYouTubeTrack,
  lookupSeedSong,
  resetYouTubeCache,
} from './youtubeSelector';
import { supabase } from '@/integrations/supabase/client';

export type MusicSource = 'recorded' | 'generative' | 'youtube';

export interface SessionStats {
  startedAt: Date | null;
  durationSec: number;
  avgAlignment: number;
  tracksPlayed: number;
  likes: number;
  skips: number;
  alignmentHistory: { t: number; v: number }[];
}

export function useMyDJ() {
  const [mode, setMode] = useState<UserMode>('calm');
  const [intensity, setIntensity] = useState(50);
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicSource, setMusicSourceState] = useState<MusicSource>('recorded');
  const [bio, setBioInternal] = useState<BioInputs>({ heartRate: 72, hrv: 55, cadence: 0, sleepScore: 78, stress: 30 });
  const [manualBioOverride, setManualBioOverride] = useState(false);
  const [state, setState] = useState<StateSnapshot>({ current: 'resting', target: 'calm', alignment: 0.5, strategy: 'counterbalance' });
  const [musicParams, setMusicParams] = useState<MusicParams>({ bpm: 70, energy: 20, rhythmDensity: 15, vocalPresence: 10, harmonicTension: 10, intensity: 50 });
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [stats, setStats] = useState<SessionStats>({ startedAt: null, durationSec: 0, avgAlignment: 0, tracksPlayed: 0, likes: 0, skips: 0, alignmentHistory: [] });
  const [ytSeed, setYtSeed] = useState<YouTubeSeed | null>(null);
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState<string | null>(null);
  const prevPhysioState = useRef<string>('resting');
  const alignmentSumRef = useRef(0);
  const alignmentCountRef = useRef(0);
  const elapsedRef = useRef(0);
  const audioEngine = useRef(getAudioEngine());
  const generativeEngine = useRef(getGenerativeEngine());
  const youtubeEngine = useRef(getYouTubeEngine());
  const modeRef = useRef(mode);
  const musicSourceRef = useRef(musicSource);
  const [intentFlavor, setIntentFlavor] = useState<SelectionFlavor | null>(null);
  const intentFlavorRef = useRef<SelectionFlavor | null>(null);
  const trackHistoryRef = useRef<string[]>([]); // urls of previously played recorded tracks
  const ytHistoryRef = useRef<YouTubeTrack[]>([]);
  const ytSeedRef = useRef<YouTubeSeed | null>(null);
  const nowPlayingRef = useRef<NowPlaying | null>(null);
  const lastTrackChangeRef = useRef<number>(0);
  const MIN_TRACK_DWELL_MS = 45_000; // don't auto-swap tracks more often than this

  // Keep refs in sync
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { musicSourceRef.current = musicSource; }, [musicSource]);
  useEffect(() => { intentFlavorRef.current = intentFlavor; }, [intentFlavor]);
  useEffect(() => { nowPlayingRef.current = nowPlaying; }, [nowPlaying]);
  useEffect(() => { ytSeedRef.current = ytSeed; }, [ytSeed]);

  // Sync volume to all engines
  useEffect(() => {
    audioEngine.current.setVolume(volume);
    generativeEngine.current.setVolume(volume);
    youtubeEngine.current.setVolume(volume);
  }, [volume]);

  // Helper: load + show a YouTube track
  const playYouTube = useCallback(async (track: YouTubeTrack, params: MusicParams) => {
    elapsedRef.current = 0;
    setNowPlaying({
      title: track.title,
      artist: track.channel,
      genre: 'YouTube',
      duration: 0,
      elapsed: 0,
      params,
      url: `https://youtu.be/${track.videoId}`,
    });
    await youtubeEngine.current.loadAndPlay(track.videoId);
  }, []);

  // Stop all engines (used on source switch / stop)
  const stopAllEngines = useCallback(() => {
    audioEngine.current.stop();
    generativeEngine.current.stop();
    youtubeEngine.current.stop();
  }, []);

  // Switch music source (stop current, start new if playing)
  const setMusicSource = useCallback((source: MusicSource) => {
    const wasPlaying = isPlaying;
    if (wasPlaying) stopAllEngines();
    if (source !== 'youtube') resetYouTubeCache();

    setMusicSourceState(source);
    musicSourceRef.current = source;

    if (!wasPlaying) return;

    if (source === 'generative') {
      generativeEngine.current.setParams(musicParams);
      generativeEngine.current.start();
      setNowPlaying({
        title: 'Generative Soundscape',
        artist: 'My DJ Engine',
        genre: 'Adaptive',
        duration: 0,
        elapsed: 0,
        params: musicParams,
        url: '',
      });
    } else if (source === 'recorded') {
      const params = computeMusicParams(computeState(bio, modeRef.current), bio, modeRef.current, intensity);
      const track = selectTrack(params, modeRef.current, intentFlavorRef.current ?? undefined);
      elapsedRef.current = 0;
      setNowPlaying({
        title: track.title, artist: track.artist, genre: track.genre,
        duration: track.duration, elapsed: 0, params, url: track.url,
      });
      audioEngine.current.start();
      audioEngine.current.loadAndPlay(track.url);
    } else if (source === 'youtube') {
      const params = computeMusicParams(computeState(bio, modeRef.current), bio, modeRef.current, intensity);
      youtubeEngine.current.start();
      setYtLoading(true);
      selectYouTubeTrack(params, modeRef.current, intentFlavorRef.current, ytSeedRef.current, true)
        .then(track => {
          if (track) {
            ytHistoryRef.current = [];
            playYouTube(track, params);
          } else {
            setYtError('No videos found');
          }
        })
        .catch(e => setYtError(e.message ?? 'YouTube error'))
        .finally(() => setYtLoading(false));
    }
  }, [isPlaying, musicParams, bio, intensity, stopAllEngines, playYouTube]);

  // Track end callbacks for recorded + youtube
  useEffect(() => {
    audioEngine.current.setOnTrackEnd(() => {
      if (musicSourceRef.current !== 'recorded') return;
      const params = computeMusicParams(computeState(bio, modeRef.current), bio, modeRef.current, intensity);
      const track = selectTrack(params, modeRef.current, intentFlavorRef.current ?? undefined);
      elapsedRef.current = 0;
      setNowPlaying({
        title: track.title, artist: track.artist, genre: track.genre,
        duration: track.duration, elapsed: 0, params, url: track.url,
      });
      setStats(s => ({ ...s, tracksPlayed: s.tracksPlayed + 1 }));
      audioEngine.current.loadAndPlay(track.url);
    });

    youtubeEngine.current.setOnTrackEnd(() => {
      if (musicSourceRef.current !== 'youtube') return;
      const params = computeMusicParams(computeState(bio, modeRef.current), bio, modeRef.current, intensity);
      selectYouTubeTrack(params, modeRef.current, intentFlavorRef.current, ytSeedRef.current)
        .then(track => {
          if (track) {
            const cur = nowPlayingRef.current;
            if (cur?.url) {
              const vid = cur.url.split('/').pop();
              if (vid) ytHistoryRef.current.push({ videoId: vid, title: cur.title, channel: cur.artist });
              if (ytHistoryRef.current.length > 30) ytHistoryRef.current.shift();
            }
            playYouTube(track, params);
            setStats(s => ({ ...s, tracksPlayed: s.tracksPlayed + 1 }));
          }
        });
    });
  }, [bio, intensity, playYouTube]);

  // Manual setBio that flags override to stop auto-simulation
  const setBio = useCallback((updater: BioInputs | ((prev: BioInputs) => BioInputs)) => {
    setManualBioOverride(true);
    setBioInternal(updater as any);
  }, []);

  // Simulate bio data changes (disabled when user manually adjusts)
  useEffect(() => {
    if (!isPlaying || manualBioOverride) return;
    const interval = setInterval(() => {
      setBioInternal(prev => {
        let hrDelta = Math.floor(Math.random() * 5) - 2;
        let hrvDelta = Math.floor(Math.random() * 5) - 2;
        let stressDelta = Math.floor(Math.random() * 5) - 2;

        if (mode === 'calm' || mode === 'recovery') {
          hrDelta -= 1; hrvDelta += 1; stressDelta -= 2;
        } else if (mode === 'energize' || mode === 'endurance') {
          hrDelta += 2; stressDelta -= 1;
        } else if (mode === 'focus') {
          hrvDelta += 1; stressDelta -= 1;
        }

        return {
          heartRate: Math.max(55, Math.min(185, prev.heartRate + hrDelta)),
          hrv: Math.max(10, Math.min(100, prev.hrv + hrvDelta)),
          cadence: mode === 'endurance' ? Math.max(0, Math.min(200, prev.cadence + Math.floor(Math.random() * 5) - 1)) : prev.cadence,
          sleepScore: prev.sleepScore,
          stress: Math.max(0, Math.min(100, prev.stress + stressDelta)),
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlaying, mode, manualBioOverride]);

  const playTrack = useCallback((params: MusicParams, currentMode: UserMode) => {
    if (musicSourceRef.current === 'generative') {
      generativeEngine.current.setParams(params);
      setNowPlaying({
        title: 'Generative Soundscape', artist: 'My DJ Engine', genre: 'Adaptive',
        duration: 0, elapsed: elapsedRef.current, params, url: '',
      });
    } else if (musicSourceRef.current === 'recorded') {
      const track = selectTrack(params, currentMode, intentFlavorRef.current ?? undefined);
      elapsedRef.current = 0;
      const current = nowPlayingRef.current;
      if (current?.url) trackHistoryRef.current.push(current.url);
      if (trackHistoryRef.current.length > 30) trackHistoryRef.current.shift();
      setNowPlaying({
        title: track.title, artist: track.artist, genre: track.genre,
        duration: track.duration, elapsed: 0, params, url: track.url,
      });
      audioEngine.current.loadAndPlay(track.url);
    } else if (musicSourceRef.current === 'youtube') {
      setYtLoading(true);
      selectYouTubeTrack(params, currentMode, intentFlavorRef.current, ytSeedRef.current)
        .then(track => {
          if (track) {
            const cur = nowPlayingRef.current;
            if (cur?.url) {
              const vid = cur.url.split('/').pop();
              if (vid) ytHistoryRef.current.push({ videoId: vid, title: cur.title, channel: cur.artist });
            }
            playYouTube(track, params);
          }
        })
        .catch(e => setYtError(e.message ?? 'YouTube error'))
        .finally(() => setYtLoading(false));
    }
  }, [playYouTube]);

  // Recompute state + music params whenever bio/mode/intensity changes
  useEffect(() => {
    const newState = computeState(bio, mode);
    setState(newState);
    const newParams = computeMusicParams(newState, bio, mode, intensity);
    setMusicParams(newParams);

    if (isPlaying) {
      if (musicSource === 'generative') {
        generativeEngine.current.setParams(newParams);
        setNowPlaying(np => np ? { ...np, params: newParams } : null);
      }

      if (newState.current !== prevPhysioState.current) {
        prevPhysioState.current = newState.current;
        if (musicSource === 'recorded' || musicSource === 'youtube') {
          playTrack(newParams, mode);
          setStats(s => ({ ...s, tracksPlayed: s.tracksPlayed + 1 }));
        }
      }

      alignmentSumRef.current += newState.alignment;
      alignmentCountRef.current += 1;
      setStats(s => ({
        ...s,
        avgAlignment: alignmentSumRef.current / alignmentCountRef.current,
        alignmentHistory: [...s.alignmentHistory.slice(-59), { t: Date.now(), v: newState.alignment }],
      }));
    }
  }, [bio, mode, intensity, isPlaying, musicSource, playTrack]);

  // Elapsed time ticker
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      elapsedRef.current += 1;
      setNowPlaying(np => {
        if (!np) return null;
        return { ...np, elapsed: elapsedRef.current };
      });
      setStats(s => ({ ...s, durationSec: s.durationSec + 1 }));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const startSession = useCallback(() => {
    alignmentSumRef.current = 0;
    alignmentCountRef.current = 0;
    elapsedRef.current = 0;
    setStats({ startedAt: new Date(), durationSec: 0, avgAlignment: 0, tracksPlayed: 1, likes: 0, skips: 0, alignmentHistory: [] });

    if (musicSourceRef.current === 'generative') {
      generativeEngine.current.setParams(musicParams);
      generativeEngine.current.setVolume(volume);
      generativeEngine.current.start();
      setNowPlaying({
        title: 'Generative Soundscape', artist: 'My DJ Engine', genre: 'Adaptive',
        duration: 0, elapsed: 0, params: musicParams, url: '',
      });
    } else if (musicSourceRef.current === 'recorded') {
      audioEngine.current.setParams(musicParams);
      audioEngine.current.start();
      playTrack(musicParams, mode);
    } else if (musicSourceRef.current === 'youtube') {
      youtubeEngine.current.start();
      setYtLoading(true);
      selectYouTubeTrack(musicParams, mode, intentFlavorRef.current, ytSeedRef.current, true)
        .then(track => {
          if (track) playYouTube(track, musicParams);
          else setYtError('No videos found');
        })
        .catch(e => setYtError(e.message ?? 'YouTube error'))
        .finally(() => setYtLoading(false));
    }
    setIsPlaying(true);
  }, [musicParams, mode, volume, playTrack, playYouTube]);

  const stopSession = useCallback(() => {
    setIsPlaying(false);
    setNowPlaying(null);
    elapsedRef.current = 0;
    stopAllEngines();
  }, [stopAllEngines]);

  const skip = useCallback(() => {
    setStats(s => ({ ...s, skips: s.skips + 1, tracksPlayed: s.tracksPlayed + 1 }));
    if (musicSourceRef.current === 'recorded' || musicSourceRef.current === 'youtube') {
      playTrack(musicParams, mode);
    }
  }, [musicParams, mode, playTrack]);

  const previous = useCallback(() => {
    if (musicSourceRef.current === 'recorded') {
      const prevUrl = trackHistoryRef.current.pop();
      if (!prevUrl) return;
      const track = getTrackDB().find(t => t.url === prevUrl);
      if (!track) return;
      elapsedRef.current = 0;
      setNowPlaying({
        title: track.title, artist: track.artist, genre: track.genre,
        duration: track.duration, elapsed: 0, params: musicParams, url: track.url,
      });
      audioEngine.current.loadAndPlay(track.url);
    } else if (musicSourceRef.current === 'youtube') {
      const prev = previousYouTubeTrack() ?? ytHistoryRef.current.pop() ?? null;
      if (prev) playYouTube(prev, musicParams);
    }
  }, [musicParams, playYouTube]);

  const submitFeedback = useCallback(async (feedbackType: 'thumbs_up' | 'thumbs_down') => {
    if (!nowPlaying) return;
    try {
      await supabase.from('mydj_track_feedback').insert({
        track_title: nowPlaying.title,
        track_artist: nowPlaying.artist,
        track_genre: nowPlaying.genre,
        track_url: nowPlaying.url || 'generative',
        music_bpm: musicParams.bpm,
        music_energy: musicParams.energy,
        music_rhythm_density: musicParams.rhythmDensity,
        music_vocal_presence: musicParams.vocalPresence,
        music_harmonic_tension: musicParams.harmonicTension,
        music_intensity: musicParams.intensity,
        bio_heart_rate: bio.heartRate,
        bio_hrv: bio.hrv,
        bio_stress: bio.stress,
        bio_cadence: bio.cadence,
        bio_sleep_score: bio.sleepScore,
        bio_physio_state: state.current,
        mode,
        alignment_score: state.alignment,
        strategy: state.strategy,
        feedback: feedbackType,
      } as any);
    } catch (err) {
      console.warn('Failed to submit feedback:', err);
    }
  }, [nowPlaying, musicParams, bio, state, mode]);

  const like = useCallback(() => {
    setStats(s => ({ ...s, likes: s.likes + 1 }));
    submitFeedback('thumbs_up');
  }, [submitFeedback]);

  const dislike = useCallback(() => {
    setStats(s => ({ ...s, skips: s.skips + 1, tracksPlayed: s.tracksPlayed + 1 }));
    submitFeedback('thumbs_down');
    if (musicSourceRef.current === 'recorded' || musicSourceRef.current === 'youtube') {
      playTrack(musicParams, mode);
    }
  }, [submitFeedback, musicParams, mode, playTrack]);

  // YouTube seed lookup
  const setYoutubeSeed = useCallback(async (query: string) => {
    if (!query.trim()) {
      setYtSeed(null);
      resetYouTubeCache();
      return;
    }
    setYtError(null);
    setYtLoading(true);
    try {
      const seed = await lookupSeedSong(query);
      if (!seed) { setYtError('Could not find that song'); return; }
      setYtSeed(seed);
      // Persist for the user
      try {
        const { data: u } = await supabase.auth.getUser();
        if (u?.user) {
          await supabase.from('mydj_yt_seeds').insert({
            user_id: u.user.id, mode, query,
            video_id: seed.videoId, video_title: seed.title, video_channel: seed.channel,
          } as any);
        }
      } catch {/* non-blocking */}
      // Immediately play the seed if YouTube source is active and playing
      if (musicSourceRef.current === 'youtube' && isPlaying) {
        const cur = nowPlayingRef.current;
        if (cur?.url) {
          const vid = cur.url.split('/').pop();
          if (vid) ytHistoryRef.current.push({ videoId: vid, title: cur.title, channel: cur.artist });
        }
        await playYouTube(seed, musicParams);
      }
    } catch (e: any) {
      setYtError(e?.message ?? 'Search failed');
    } finally {
      setYtLoading(false);
    }
  }, [mode, isPlaying, musicParams, playYouTube]);

  const clearYoutubeSeed = useCallback(() => {
    setYtSeed(null);
    resetYouTubeCache();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioEngine.current.stop();
      generativeEngine.current.dispose();
      youtubeEngine.current.dispose();
    };
  }, []);

  return {
    mode, setMode, intensity, setIntensity,
    volume, setVolume,
    isPlaying, startSession, stopSession,
    bio, setBio, state, musicParams, nowPlaying,
    stats, skip, previous, like, dislike, timeOfDay: getTimeOfDay(),
    musicSource, setMusicSource,
    intentFlavor, setIntentFlavor,
    ytSeed, setYoutubeSeed, clearYoutubeSeed, ytLoading, ytError,
  };
}
