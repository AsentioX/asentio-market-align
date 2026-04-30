// Core hook that ties state engine + music engine + wearable data together

import { useState, useEffect, useRef, useCallback } from 'react';
import { UserMode, BioInputs, computeState, StateSnapshot, getTimeOfDay } from './stateEngine';
import { MusicParams, NowPlaying, computeMusicParams, selectTrack, SelectionFlavor } from './musicEngine';
import { getAudioEngine } from './audioEngine';
import { getGenerativeEngine } from './generativeEngine';
import { supabase } from '@/integrations/supabase/client';

export type MusicSource = 'recorded' | 'generative';

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
  const prevPhysioState = useRef<string>('resting');
  const alignmentSumRef = useRef(0);
  const alignmentCountRef = useRef(0);
  const elapsedRef = useRef(0);
  const audioEngine = useRef(getAudioEngine());
  const generativeEngine = useRef(getGenerativeEngine());
  const modeRef = useRef(mode);
  const musicSourceRef = useRef(musicSource);
  const [intentFlavor, setIntentFlavor] = useState<SelectionFlavor | null>(null);
  const intentFlavorRef = useRef<SelectionFlavor | null>(null);
  const trackHistoryRef = useRef<string[]>([]); // urls of previously played recorded tracks

  // Keep refs in sync
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { musicSourceRef.current = musicSource; }, [musicSource]);
  useEffect(() => { intentFlavorRef.current = intentFlavor; }, [intentFlavor]);

  // Sync volume to both engines
  useEffect(() => {
    audioEngine.current.setVolume(volume);
    generativeEngine.current.setVolume(volume);
  }, [volume]);

  // Switch music source (stop current, start new if playing)
  const setMusicSource = useCallback((source: MusicSource) => {
    const wasPlaying = isPlaying;
    if (wasPlaying) {
      if (musicSourceRef.current === 'recorded') {
        audioEngine.current.stop();
      } else {
        generativeEngine.current.stop();
      }
    }
    setMusicSourceState(source);
    musicSourceRef.current = source;

    if (wasPlaying) {
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
      } else {
        const params = computeMusicParams(
          computeState(bio, modeRef.current),
          bio,
          modeRef.current,
          intensity
        );
        const track = selectTrack(params, modeRef.current, intentFlavorRef.current ?? undefined);
        elapsedRef.current = 0;
        setNowPlaying({
          title: track.title,
          artist: track.artist,
          genre: track.genre,
          duration: track.duration,
          elapsed: 0,
          params,
          url: track.url,
        });
        audioEngine.current.start();
        audioEngine.current.loadAndPlay(track.url);
      }
    }
  }, [isPlaying, musicParams, bio, intensity]);

  // Set up track end callback (recorded only)
  useEffect(() => {
    audioEngine.current.setOnTrackEnd(() => {
      if (musicSourceRef.current !== 'recorded') return;
      const params = computeMusicParams(
        computeState(bio, modeRef.current),
        bio,
        modeRef.current,
        intensity
      );
      const track = selectTrack(params, modeRef.current, intentFlavorRef.current ?? undefined);
      elapsedRef.current = 0;
      setNowPlaying({
        title: track.title,
        artist: track.artist,
        genre: track.genre,
        duration: track.duration,
        elapsed: 0,
        params,
        url: track.url,
      });
      setStats(s => ({ ...s, tracksPlayed: s.tracksPlayed + 1 }));
      audioEngine.current.loadAndPlay(track.url);
    });
  }, [bio, intensity]);

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
        title: 'Generative Soundscape',
        artist: 'My DJ Engine',
        genre: 'Adaptive',
        duration: 0,
        elapsed: elapsedRef.current,
        params,
        url: '',
      });
    } else {
      const track = selectTrack(params, currentMode, intentFlavorRef.current ?? undefined);
      elapsedRef.current = 0;
      // push current track to history before swapping
      const current = nowPlayingRef.current;
      if (current?.url) trackHistoryRef.current.push(current.url);
      // cap history to last 30
      if (trackHistoryRef.current.length > 30) trackHistoryRef.current.shift();
      setNowPlaying({
        title: track.title,
        artist: track.artist,
        genre: track.genre,
        duration: track.duration,
        elapsed: 0,
        params,
        url: track.url,
      });
      audioEngine.current.loadAndPlay(track.url);
    }
  }, []);

  // Recompute state + music params whenever bio/mode/intensity changes
  useEffect(() => {
    const newState = computeState(bio, mode);
    setState(newState);
    const newParams = computeMusicParams(newState, bio, mode, intensity);
    setMusicParams(newParams);

    if (isPlaying) {
      if (musicSource === 'generative') {
        // Always update generative engine params smoothly
        generativeEngine.current.setParams(newParams);
        setNowPlaying(np => np ? { ...np, params: newParams } : null);
      }

      if (newState.current !== prevPhysioState.current) {
        prevPhysioState.current = newState.current;
        if (musicSource === 'recorded') {
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
        title: 'Generative Soundscape',
        artist: 'My DJ Engine',
        genre: 'Adaptive',
        duration: 0,
        elapsed: 0,
        params: musicParams,
        url: '',
      });
    } else {
      audioEngine.current.setParams(musicParams);
      audioEngine.current.start();
      playTrack(musicParams, mode);
    }
    setIsPlaying(true);
  }, [musicParams, mode, volume, playTrack]);

  const stopSession = useCallback(() => {
    setIsPlaying(false);
    setNowPlaying(null);
    elapsedRef.current = 0;
    audioEngine.current.stop();
    generativeEngine.current.stop();
  }, []);

  const skip = useCallback(() => {
    setStats(s => ({ ...s, skips: s.skips + 1, tracksPlayed: s.tracksPlayed + 1 }));
    if (musicSourceRef.current === 'recorded') {
      playTrack(musicParams, mode);
    }
    // For generative, skip doesn't apply — params update continuously
  }, [musicParams, mode, playTrack]);

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
    if (musicSourceRef.current === 'recorded') {
      playTrack(musicParams, mode);
    }
  }, [submitFeedback, musicParams, mode, playTrack]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioEngine.current.stop();
      generativeEngine.current.dispose();
    };
  }, []);

  return {
    mode, setMode, intensity, setIntensity,
    volume, setVolume,
    isPlaying, startSession, stopSession,
    bio, setBio, state, musicParams, nowPlaying,
    stats, skip, like, dislike, timeOfDay: getTimeOfDay(),
    musicSource, setMusicSource,
    intentFlavor, setIntentFlavor,
  };
}
