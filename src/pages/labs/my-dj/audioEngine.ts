// Web Audio generative music engine driven by MusicParams
// Produces real-time adaptive music: drums, bass, pads, and melody

import { MusicParams } from './musicEngine';

type EngineState = 'stopped' | 'playing';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private drumGain: GainNode | null = null;
  private bassGain: GainNode | null = null;
  private padGain: GainNode | null = null;
  private melodyGain: GainNode | null = null;
  private state: EngineState = 'stopped';
  private schedulerTimer: number | null = null;
  private currentBeat = 0;
  private nextBeatTime = 0;
  private params: MusicParams = { bpm: 80, energy: 30, rhythmDensity: 20, vocalPresence: 10, harmonicTension: 15, intensity: 50 };

  // Scales for melody/bass based on tension
  private calmScale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]; // C major
  private tenseScale = [261.63, 293.66, 311.13, 349.23, 392.00, 415.30, 466.16]; // C minor

  init() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.ctx.destination);

    this.drumGain = this.ctx.createGain();
    this.drumGain.connect(this.masterGain);

    this.bassGain = this.ctx.createGain();
    this.bassGain.connect(this.masterGain);

    this.padGain = this.ctx.createGain();
    this.padGain.connect(this.masterGain);

    this.melodyGain = this.ctx.createGain();
    this.melodyGain.connect(this.masterGain);
  }

  setVolume(v: number) {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), this.ctx!.currentTime, 0.05);
    }
  }

  setParams(p: MusicParams) {
    this.params = p;
    // Update layer volumes based on params
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const energyF = p.energy / 100;
    const rhythmF = p.rhythmDensity / 100;

    this.drumGain?.gain.setTargetAtTime(0.3 + rhythmF * 0.5, t, 0.3);
    this.bassGain?.gain.setTargetAtTime(0.2 + energyF * 0.4, t, 0.3);
    this.padGain?.gain.setTargetAtTime(0.15 + (1 - energyF) * 0.25, t, 0.3);
    this.melodyGain?.gain.setTargetAtTime(0.1 + energyF * 0.3, t, 0.3);
  }

  start() {
    this.init();
    if (this.state === 'playing') return;
    if (this.ctx!.state === 'suspended') this.ctx!.resume();
    this.state = 'playing';
    this.currentBeat = 0;
    this.nextBeatTime = this.ctx!.currentTime + 0.1;
    this.setParams(this.params);
    this.schedule();
  }

  stop() {
    this.state = 'stopped';
    if (this.schedulerTimer) {
      clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  getState(): EngineState {
    return this.state;
  }

  dispose() {
    this.stop();
    this.ctx?.close();
    this.ctx = null;
    this.masterGain = null;
  }

  // ─── Scheduler ─────────────────────────────────────
  private schedule = () => {
    if (this.state !== 'playing' || !this.ctx) return;
    const lookahead = 0.15; // seconds
    while (this.nextBeatTime < this.ctx.currentTime + lookahead) {
      this.playBeat(this.nextBeatTime, this.currentBeat);
      const beatDuration = 60 / this.params.bpm / 2; // 8th notes
      this.nextBeatTime += beatDuration;
      this.currentBeat = (this.currentBeat + 1) % 16; // 2-bar pattern in 8th notes
    }
    this.schedulerTimer = window.setTimeout(this.schedule, 50);
  };

  private playBeat(time: number, beat: number) {
    const { energy, rhythmDensity, harmonicTension } = this.params;
    const energyF = energy / 100;
    const rhythmF = rhythmDensity / 100;
    const tensionF = harmonicTension / 100;

    // ─── Kick on beats 0, 8 (downbeats)
    if (beat % 8 === 0) {
      this.playKick(time);
    }
    // ─── Additional kick on 4 if high energy
    if (beat % 4 === 0 && energyF > 0.5) {
      this.playKick(time);
    }

    // ─── Snare on beats 4, 12
    if (beat === 4 || beat === 12) {
      this.playSnare(time);
    }

    // ─── Hihat pattern based on rhythm density
    if (rhythmF > 0.2 && beat % 2 === 0) {
      this.playHihat(time, false);
    }
    if (rhythmF > 0.5 && beat % 2 === 1) {
      this.playHihat(time, true); // off-beat open hats
    }
    if (rhythmF > 0.8) {
      // 16th-note hats at high density
      this.playHihat(time, false);
    }

    // ─── Bass on downbeats
    if (beat % 8 === 0) {
      const scale = tensionF > 0.5 ? this.tenseScale : this.calmScale;
      const bassNote = scale[Math.floor(Math.random() * 3)] / 4; // low octave
      this.playBass(time, bassNote, 60 / this.params.bpm);
    }
    // Extra bass notes if energetic
    if (beat % 4 === 0 && energyF > 0.6) {
      const scale = tensionF > 0.5 ? this.tenseScale : this.calmScale;
      const bassNote = scale[Math.floor(Math.random() * 4)] / 4;
      this.playBass(time, bassNote, 60 / this.params.bpm / 2);
    }

    // ─── Pad changes every 2 bars (beat 0)
    if (beat === 0) {
      this.playPad(time, tensionF);
    }

    // ─── Melody notes — more frequent with higher energy
    const melodyChance = 0.1 + energyF * 0.4 + rhythmF * 0.2;
    if (beat % 2 === 0 && Math.random() < melodyChance) {
      const scale = tensionF > 0.5 ? this.tenseScale : this.calmScale;
      const note = scale[Math.floor(Math.random() * scale.length)];
      this.playMelody(time, note, 60 / this.params.bpm * (Math.random() > 0.5 ? 1 : 0.5));
    }
  }

  // ─── Sound generators ─────────────────────────────

  private playKick(time: number) {
    if (!this.ctx || !this.drumGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.12);
    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
    osc.connect(gain);
    gain.connect(this.drumGain);
    osc.start(time);
    osc.stop(time + 0.3);
  }

  private playSnare(time: number) {
    if (!this.ctx || !this.drumGain) return;
    // Noise burst for snare
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.drumGain);
    noise.start(time);
    noise.stop(time + 0.15);

    // Tonal body
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.05);
    oscGain.gain.setValueAtTime(0.4, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    osc.connect(oscGain);
    oscGain.connect(this.drumGain);
    osc.start(time);
    osc.stop(time + 0.08);
  }

  private playHihat(time: number, open: boolean) {
    if (!this.ctx || !this.drumGain) return;
    const dur = open ? 0.12 : 0.04;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 6000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(open ? 0.2 : 0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.drumGain);
    noise.start(time);
    noise.stop(time + dur);
  }

  private playBass(time: number, freq: number, dur: number) {
    if (!this.ctx || !this.bassGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300 + (this.params.energy / 100) * 600, time);
    filter.Q.value = 2;

    gain.gain.setValueAtTime(0.5, time);
    gain.gain.setValueAtTime(0.5, time + dur * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.bassGain);
    osc.start(time);
    osc.stop(time + dur + 0.01);
  }

  private playPad(time: number, tensionF: number) {
    if (!this.ctx || !this.padGain) return;
    const dur = (60 / this.params.bpm) * 4; // 1 bar
    const scale = tensionF > 0.5 ? this.tenseScale : this.calmScale;

    // Play a 3-note chord
    const root = Math.floor(Math.random() * 4);
    const notes = [scale[root], scale[(root + 2) % 7], scale[(root + 4) % 7]];

    notes.forEach(freq => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      // Slight detuning for warmth
      osc.detune.setValueAtTime((Math.random() - 0.5) * 10, time);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.12, time + 0.3);
      gain.gain.setValueAtTime(0.12, time + dur - 0.5);
      gain.gain.linearRampToValueAtTime(0, time + dur);

      osc.connect(gain);
      gain.connect(this.padGain!);
      osc.start(time);
      osc.stop(time + dur + 0.01);
    });
  }

  private playMelody(time: number, freq: number, dur: number) {
    if (!this.ctx || !this.melodyGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = this.params.energy > 60 ? 'square' : 'triangle';
    osc.frequency.setValueAtTime(freq * 2, time); // higher octave

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.2, time + 0.02);
    gain.gain.setValueAtTime(0.2, time + dur * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.melodyGain);
    osc.start(time);
    osc.stop(time + dur + 0.01);
  }
}

// Singleton
let instance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!instance) instance = new AudioEngine();
  return instance;
}
