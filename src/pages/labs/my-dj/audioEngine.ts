// Real music playback engine using HTML5 Audio
// Replaces the Web Audio API generative engine with actual audio file playback

import { MusicParams } from './musicEngine';

type EngineState = 'stopped' | 'playing';

export class AudioEngine {
  private audio: HTMLAudioElement | null = null;
  private state: EngineState = 'stopped';
  private currentVolume = 0.7;
  private fadeInterval: number | null = null;
  private onTrackEndCallback: (() => void) | null = null;

  setVolume(v: number) {
    this.currentVolume = Math.max(0, Math.min(1, v));
    if (this.audio) {
      this.audio.volume = this.currentVolume;
    }
  }

  setParams(_p: MusicParams) {
    // In real-music mode, params don't change the audio in real-time.
    // They influence track selection in the music engine instead.
  }

  setOnTrackEnd(cb: () => void) {
    this.onTrackEndCallback = cb;
  }

  loadAndPlay(url: string) {
    // Fade out current track if playing
    if (this.audio && this.state === 'playing') {
      this.crossfadeTo(url);
      return;
    }

    this.createAudio(url);
    this.audio!.play().catch(err => {
      console.warn('Audio play failed (user interaction may be needed):', err.message);
    });
  }

  private createAudio(url: string) {
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
    }

    this.audio = new Audio(url);
    this.audio.volume = this.currentVolume;
    this.audio.crossOrigin = 'anonymous';

    this.audio.addEventListener('ended', () => {
      if (this.onTrackEndCallback) {
        this.onTrackEndCallback();
      }
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio error:', e);
    });
  }

  private crossfadeTo(newUrl: string) {
    const oldAudio = this.audio;
    const fadeDuration = 2000; // 2 second crossfade
    const steps = 40;
    const stepTime = fadeDuration / steps;
    let step = 0;

    // Create new audio
    this.createAudio(newUrl);
    const newAudio = this.audio!;
    newAudio.volume = 0;
    newAudio.play().catch(() => {});

    // Crossfade
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    this.fadeInterval = window.setInterval(() => {
      step++;
      const progress = step / steps;

      if (oldAudio) {
        oldAudio.volume = Math.max(0, this.currentVolume * (1 - progress));
      }
      newAudio.volume = this.currentVolume * progress;

      if (step >= steps) {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        if (oldAudio) {
          oldAudio.pause();
          oldAudio.removeAttribute('src');
          oldAudio.load();
        }
      }
    }, stepTime);
  }

  start() {
    this.state = 'playing';
    // Actual playback is triggered via loadAndPlay
  }

  stop() {
    this.state = 'stopped';
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    if (this.audio) {
      // Fade out
      const fadeDuration = 800;
      const steps = 20;
      const stepTime = fadeDuration / steps;
      let step = 0;
      const startVol = this.audio.volume;
      const audio = this.audio;

      const fadeOut = setInterval(() => {
        step++;
        audio.volume = Math.max(0, startVol * (1 - step / steps));
        if (step >= steps) {
          clearInterval(fadeOut);
          audio.pause();
        }
      }, stepTime);
    }
  }

  getState(): EngineState {
    return this.state;
  }

  getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }

  getDuration(): number {
    return this.audio?.duration || 0;
  }

  isActuallyPlaying(): boolean {
    return this.audio !== null && !this.audio.paused && this.state === 'playing';
  }

  dispose() {
    this.stop();
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
      this.audio = null;
    }
  }
}

// Singleton
let instance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!instance) {
    instance = new AudioEngine();
  }
  return instance;
}
