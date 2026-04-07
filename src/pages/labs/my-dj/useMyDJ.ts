// Core hook that ties state engine + music engine + wearable data together

import { useState, useEffect, useRef, useCallback } from 'react';
import { UserMode, BioInputs, computeState, StateSnapshot, getTimeOfDay } from './stateEngine';
import { MusicParams, NowPlaying, computeMusicParams, selectTrack } from './musicEngine';
import { getAudioEngine } from './audioEngine';

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
  const [bio, setBio] = useState<BioInputs>({ heartRate: 72, hrv: 55, cadence: 0, sleepScore: 78, stress: 30 });
  const [state, setState] = useState<StateSnapshot>({ current: 'resting', target: 'calm', alignment: 0.5, strategy: 'counterbalance' });
  const [musicParams, setMusicParams] = useState<MusicParams>({ bpm: 70, energy: 20, rhythmDensity: 15, vocalPresence: 10, harmonicTension: 10, intensity: 50 });
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [stats, setStats] = useState<SessionStats>({ startedAt: null, durationSec: 0, avgAlignment: 0, tracksPlayed: 0, likes: 0, skips: 0, alignmentHistory: [] });

  const alignmentSumRef = useRef(0);
  const alignmentCountRef = useRef(0);
  const elapsedRef = useRef(0);
  const audioEngine = useRef(getAudioEngine());

  // Sync volume to audio engine
  useEffect(() => {
    audioEngine.current.setVolume(volume);
  }, [volume]);

  // Simulate bio data changes
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setBio(prev => {
        // Gradual adaptation toward target based on mode
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
  }, [isPlaying, mode]);

  // Recompute state + music params whenever bio/mode/intensity changes
  useEffect(() => {
    const newState = computeState(bio, mode);
    setState(newState);
    const newParams = computeMusicParams(newState, bio, mode, intensity);
    setMusicParams(newParams);

    // Update audio engine with new params in real-time
    if (isPlaying) {
      audioEngine.current.setParams(newParams);
    }

    if (isPlaying) {
      alignmentSumRef.current += newState.alignment;
      alignmentCountRef.current += 1;
      setStats(s => ({
        ...s,
        avgAlignment: alignmentSumRef.current / alignmentCountRef.current,
        alignmentHistory: [...s.alignmentHistory.slice(-59), { t: Date.now(), v: newState.alignment }],
      }));
    }
  }, [bio, mode, intensity, isPlaying]);

  // Auto-select track when params change significantly or track ends
  useEffect(() => {
    if (!isPlaying) return;
    if (!nowPlaying || elapsedRef.current >= (nowPlaying.duration - 5)) {
      const track = selectTrack(musicParams);
      elapsedRef.current = 0;
      setNowPlaying({
        title: track.title,
        artist: track.artist,
        genre: track.genre,
        duration: track.duration,
        elapsed: 0,
        params: musicParams,
      });
      setStats(s => ({ ...s, tracksPlayed: s.tracksPlayed + 1 }));
    }
  }, [musicParams, isPlaying, nowPlaying]);

  // Elapsed time ticker
  useEffect(() => {
    if (!isPlaying || !nowPlaying) return;
    const interval = setInterval(() => {
      elapsedRef.current += 1;
      setNowPlaying(np => np ? { ...np, elapsed: elapsedRef.current, params: musicParams } : null);
      setStats(s => ({ ...s, durationSec: s.durationSec + 1 }));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, nowPlaying, musicParams]);

  const startSession = useCallback(() => {
    setIsPlaying(true);
    alignmentSumRef.current = 0;
    alignmentCountRef.current = 0;
    setStats({ startedAt: new Date(), durationSec: 0, avgAlignment: 0, tracksPlayed: 0, likes: 0, skips: 0, alignmentHistory: [] });
    audioEngine.current.setParams(musicParams);
    audioEngine.current.start();
  }, [musicParams]);

  const stopSession = useCallback(() => {
    setIsPlaying(false);
    setNowPlaying(null);
    elapsedRef.current = 0;
    audioEngine.current.stop();
  }, []);

  const skip = useCallback(() => {
    elapsedRef.current = 999; // triggers next track selection
    setStats(s => ({ ...s, skips: s.skips + 1 }));
    const track = selectTrack(musicParams);
    elapsedRef.current = 0;
    setNowPlaying({
      title: track.title, artist: track.artist, genre: track.genre,
      duration: track.duration, elapsed: 0, params: musicParams,
    });
    setStats(s => ({ ...s, tracksPlayed: s.tracksPlayed + 1 }));
  }, [musicParams]);

  const like = useCallback(() => {
    setStats(s => ({ ...s, likes: s.likes + 1 }));
  }, []);

  return {
    mode, setMode, intensity, setIntensity,
    isPlaying, startSession, stopSession,
    bio, state, musicParams, nowPlaying,
    stats, skip, like, timeOfDay: getTimeOfDay(),
  };
}
