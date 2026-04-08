// Web Audio generative music engine driven by MusicParams
// Produces real-time adaptive MUSIC: groovy drums, warm bass, lush pads, singable melodies

import { MusicParams } from './musicEngine';

type EngineState = 'stopped' | 'playing';

// Musical chord progressions (scale degree indices)
const PROGRESSIONS_MAJOR = [
  [0, 3, 4, 3],   // I - IV - V - IV
  [0, 5, 3, 4],   // I - vi - IV - V
  [0, 3, 5, 4],   // I - IV - vi - V
  [0, 4, 5, 3],   // I - V - vi - IV
];

const PROGRESSIONS_MINOR = [
  [0, 3, 4, 4],   // i - iv - v - v
  [0, 5, 3, 6],   // i - VI - iv - VII
  [0, 3, 6, 4],   // i - iv - VII - v
  [0, 6, 5, 4],   // i - VII - VI - v
];

// Note frequencies for scales (octave 4)
const C_MAJOR = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88];
const C_MINOR = [261.63, 293.66, 311.13, 349.23, 392.00, 415.30, 466.16];

// Chord quality templates (intervals from root in scale degrees)
const TRIAD = [0, 2, 4];
const SEVENTH = [0, 2, 4, 6];

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private reverb: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private drumGain: GainNode | null = null;
  private bassGain: GainNode | null = null;
  private padGain: GainNode | null = null;
  private melodyGain: GainNode | null = null;
  private state: EngineState = 'stopped';
  private schedulerTimer: number | null = null;
  private currentBeat = 0;
  private nextBeatTime = 0;
  private params: MusicParams = { bpm: 90, energy: 40, rhythmDensity: 30, vocalPresence: 10, harmonicTension: 15, intensity: 50 };

  // Musical state
  private currentProgression: number[] = PROGRESSIONS_MAJOR[0];
  private currentChordIndex = 0;
  private currentScale = C_MAJOR;
  private melodyLastNote = 3; // start in middle of scale
  private barCount = 0;
  private swingAmount = 0.02; // subtle swing for groove

  init() {
    if (this.ctx) return;
    this.ctx = new AudioContext();

    // Master chain: compressor → dry/wet reverb → output
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -18;
    this.compressor.knee.value = 12;
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.15;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.55;
    this.masterGain.connect(this.compressor);

    // Reverb send
    this.reverb = this.ctx.createConvolver();
    this.reverb.buffer = this.createReverbIR(1.8, 3.5);
    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.value = 0.25;

    this.dryGain = this.ctx.createGain();
    this.dryGain.gain.value = 0.85;

    this.compressor.connect(this.dryGain);
    this.compressor.connect(this.reverb);
    this.reverb.connect(this.reverbGain);
    this.dryGain.connect(this.ctx.destination);
    this.reverbGain.connect(this.ctx.destination);

    // Layer buses
    this.drumGain = this.ctx.createGain();
    this.drumGain.connect(this.masterGain);

    this.bassGain = this.ctx.createGain();
    this.bassGain.connect(this.masterGain);

    this.padGain = this.ctx.createGain();
    this.padGain.connect(this.masterGain);

    this.melodyGain = this.ctx.createGain();
    this.melodyGain.connect(this.masterGain);
  }

  private createReverbIR(duration: number, decay: number): AudioBuffer {
    const length = this.ctx!.sampleRate * duration;
    const buffer = this.ctx!.createBuffer(2, length, this.ctx!.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return buffer;
  }

  setVolume(v: number) {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), this.ctx!.currentTime, 0.05);
    }
  }

  setParams(p: MusicParams) {
    this.params = p;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const energyF = p.energy / 100;
    const rhythmF = p.rhythmDensity / 100;
    const tensionF = p.harmonicTension / 100;

    this.drumGain?.gain.setTargetAtTime(0.25 + rhythmF * 0.4, t, 0.4);
    this.bassGain?.gain.setTargetAtTime(0.25 + energyF * 0.35, t, 0.4);
    this.padGain?.gain.setTargetAtTime(0.18 + (1 - energyF) * 0.22, t, 0.4);
    this.melodyGain?.gain.setTargetAtTime(0.12 + energyF * 0.25, t, 0.4);

    // More reverb when calmer, less when energetic
    this.reverbGain?.gain.setTargetAtTime(0.15 + (1 - energyF) * 0.25, t, 0.5);

    // Swing increases with energy
    this.swingAmount = 0.01 + energyF * 0.035;

    // Update scale & progression
    this.currentScale = tensionF > 0.5 ? C_MINOR : C_MAJOR;
    const progs = tensionF > 0.5 ? PROGRESSIONS_MINOR : PROGRESSIONS_MAJOR;
    const progIdx = Math.min(Math.floor(energyF * progs.length), progs.length - 1);
    this.currentProgression = progs[progIdx];
  }

  start() {
    this.init();
    if (this.state === 'playing') return;
    if (this.ctx!.state === 'suspended') this.ctx!.resume();
    this.state = 'playing';
    this.currentBeat = 0;
    this.barCount = 0;
    this.currentChordIndex = 0;
    this.melodyLastNote = 3;
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
    const lookahead = 0.15;
    while (this.nextBeatTime < this.ctx.currentTime + lookahead) {
      this.playBeat(this.nextBeatTime, this.currentBeat);
      const eighthDur = 60 / this.params.bpm / 2;
      // Apply swing to odd 8th notes
      const swing = (this.currentBeat % 2 === 1) ? this.swingAmount : 0;
      this.nextBeatTime += eighthDur + swing;
      this.currentBeat = (this.currentBeat + 1) % 16;
      if (this.currentBeat === 0) {
        this.barCount++;
        // Advance chord every bar
        this.currentChordIndex = (this.currentChordIndex + 1) % this.currentProgression.length;
      }
    }
    this.schedulerTimer = window.setTimeout(this.schedule, 40);
  };

  private getChordRoot(): number {
    const rootDegree = this.currentProgression[this.currentChordIndex];
    return this.currentScale[rootDegree % 7];
  }

  private getChordNotes(): number[] {
    const rootDegree = this.currentProgression[this.currentChordIndex];
    const template = this.params.energy > 60 ? SEVENTH : TRIAD;
    return template.map(interval => {
      const degree = (rootDegree + interval) % 7;
      return this.currentScale[degree];
    });
  }

  private playBeat(time: number, beat: number) {
    const { energy, rhythmDensity, harmonicTension } = this.params;
    const energyF = energy / 100;
    const rhythmF = rhythmDensity / 100;
    const beatDur = 60 / this.params.bpm / 2;

    // ─── DRUMS ───
    // Kick: beat 0, 8 always; 4,12 at higher energy; ghost kicks for groove
    if (beat === 0 || beat === 8) {
      this.playKick(time, 1.0);
    } else if ((beat === 4 || beat === 12) && energyF > 0.45) {
      this.playKick(time, 0.7);
    } else if (beat === 6 && energyF > 0.7) {
      this.playKick(time, 0.4); // ghost kick
    }

    // Snare: 4, 12 with ghost notes
    if (beat === 4 || beat === 12) {
      this.playSnare(time, 1.0);
    } else if ((beat === 10 || beat === 14) && rhythmF > 0.5) {
      this.playSnare(time, 0.3); // ghost snare
    }

    // Hihat: groove pattern
    if (rhythmF > 0.15) {
      if (beat % 2 === 0) {
        this.playHihat(time, false, 0.6 + (beat % 4 === 0 ? 0.25 : 0));
      }
      if (beat % 2 === 1 && rhythmF > 0.4) {
        this.playHihat(time, beat % 4 === 3, 0.35); // open hat on upbeat
      }
    }

    // Ride/shaker at high density
    if (rhythmF > 0.7 && beat % 2 === 0) {
      this.playRide(time);
    }

    // Clap layer on snare beats at high energy
    if ((beat === 4 || beat === 12) && energyF > 0.6) {
      this.playClap(time);
    }

    // ─── BASS ───
    const bassRoot = this.getChordRoot() / 4; // 2 octaves down
    if (beat === 0 || beat === 8) {
      this.playBass(time, bassRoot, beatDur * 3);
    } else if (beat === 6 && energyF > 0.4) {
      // Walking bass note
      const walkNote = this.currentScale[(this.currentProgression[this.currentChordIndex] + 4) % 7] / 4;
      this.playBass(time, walkNote, beatDur * 1.5);
    } else if (beat % 4 === 0 && beat !== 0 && beat !== 8 && energyF > 0.65) {
      this.playBass(time, bassRoot * 1.5, beatDur);
    }

    // ─── CHORDS / PADS ───
    if (beat === 0) {
      const chordDur = (60 / this.params.bpm) * 4; // full bar
      this.playChordPad(time, chordDur);
    }
    // Rhythmic chord stabs at high energy
    if (energyF > 0.55 && (beat === 2 || beat === 10)) {
      this.playChordStab(time, beatDur * 0.8);
    }

    // ─── MELODY ───
    const melodyChance = 0.15 + energyF * 0.35 + rhythmF * 0.15;
    if (beat % 2 === 0 && Math.random() < melodyChance) {
      const dur = beatDur * (Math.random() > 0.6 ? 2 : 1);
      this.playMelodyNote(time, dur);
    }
  }

  // ─── INSTRUMENTS ─────────────────────────────────

  private playKick(time: number, velocity: number) {
    if (!this.ctx || !this.drumGain) return;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Main body
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.08);

    // Sub layer for weight
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(80, time);
    osc2.frequency.exponentialRampToValueAtTime(28, time + 0.15);

    gain.gain.setValueAtTime(0.7 * velocity, time);
    gain.gain.setValueAtTime(0.6 * velocity, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.drumGain);
    osc.start(time);
    osc.stop(time + 0.35);
    osc2.start(time);
    osc2.stop(time + 0.35);
  }

  private playSnare(time: number, velocity: number) {
    if (!this.ctx || !this.drumGain) return;
    const dur = 0.18;
    const bufLen = this.ctx.sampleRate * dur;
    const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 1.5);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;

    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 3500;
    bp.Q.value = 0.8;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45 * velocity, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.connect(bp);
    bp.connect(gain);
    gain.connect(this.drumGain);
    noise.start(time);
    noise.stop(time + dur);

    // Tonal snap
    const osc = this.ctx.createOscillator();
    const og = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(120, time + 0.04);
    og.gain.setValueAtTime(0.35 * velocity, time);
    og.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
    osc.connect(og);
    og.connect(this.drumGain);
    osc.start(time);
    osc.stop(time + 0.06);
  }

  private playHihat(time: number, open: boolean, velocity: number) {
    if (!this.ctx || !this.drumGain) return;
    const dur = open ? 0.15 : 0.035;
    const bufLen = this.ctx.sampleRate * dur;
    const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, open ? 2 : 4);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;

    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7500;

    const bp = this.ctx.createBiquadFilter();
    bp.type = 'peaking';
    bp.frequency.value = 10000;
    bp.gain.value = 4;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity * 0.22, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.connect(hp);
    hp.connect(bp);
    bp.connect(gain);
    gain.connect(this.drumGain);
    noise.start(time);
    noise.stop(time + dur);
  }

  private playRide(time: number) {
    if (!this.ctx || !this.drumGain) return;
    // Metallic ride using detuned square waves
    const freqs = [800, 1200, 1580];
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.04, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    gain.connect(this.drumGain);

    freqs.forEach(f => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'square';
      osc.frequency.value = f;
      const ig = this.ctx!.createGain();
      ig.gain.value = 0.3;
      osc.connect(ig);
      ig.connect(gain);
      osc.start(time);
      osc.stop(time + 0.25);
    });
  }

  private playClap(time: number) {
    if (!this.ctx || !this.drumGain) return;
    // Multiple short noise bursts for clap
    for (let n = 0; n < 3; n++) {
      const offset = time + n * 0.008;
      const bufLen = this.ctx.sampleRate * 0.04;
      const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 3);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buf;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 2200;
      bp.Q.value = 1.2;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.15, offset);
      g.gain.exponentialRampToValueAtTime(0.001, offset + 0.04);
      noise.connect(bp);
      bp.connect(g);
      g.connect(this.drumGain);
      noise.start(offset);
      noise.stop(offset + 0.04);
    }
  }

  private playBass(time: number, freq: number, dur: number) {
    if (!this.ctx || !this.bassGain) return;
    const energyF = this.params.energy / 100;

    // Two detuned oscillators for fatness
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();

    osc1.type = energyF > 0.6 ? 'sawtooth' : 'triangle';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq, time);
    osc1.detune.value = 5;
    osc2.detune.value = -5;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250 + energyF * 800, time);
    // Filter envelope: opens then closes
    filter.frequency.linearRampToValueAtTime(350 + energyF * 1000, time + 0.05);
    filter.frequency.exponentialRampToValueAtTime(200 + energyF * 300, time + dur * 0.7);
    filter.Q.value = 1.5 + energyF * 3;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.5, time + 0.01);
    gain.gain.setValueAtTime(0.45, time + dur * 0.65);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.bassGain);
    osc1.start(time);
    osc1.stop(time + dur + 0.01);
    osc2.start(time);
    osc2.stop(time + dur + 0.01);
  }

  private playChordPad(time: number, dur: number) {
    if (!this.ctx || !this.padGain) return;
    const notes = this.getChordNotes();

    notes.forEach((freq, i) => {
      // Two oscillators per voice for richness
      for (let layer = 0; layer < 2; layer++) {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = layer === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq * (layer === 0 ? 1 : 2), time); // second layer octave up
        osc.detune.setValueAtTime((Math.random() - 0.5) * 15 + (layer * 7), time);

        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800 + (this.params.energy / 100) * 1500;
        filter.Q.value = 0.5;

        const vol = layer === 0 ? 0.08 : 0.03;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(vol, time + dur * 0.15);
        gain.gain.setValueAtTime(vol * 0.85, time + dur * 0.7);
        gain.gain.linearRampToValueAtTime(0, time + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.padGain!);
        osc.start(time);
        osc.stop(time + dur + 0.02);
      }
    });
  }

  private playChordStab(time: number, dur: number) {
    if (!this.ctx || !this.padGain) return;
    const notes = this.getChordNotes();

    notes.forEach(freq => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq * 2, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, time);
      filter.frequency.exponentialRampToValueAtTime(500, time + dur);
      filter.Q.value = 2;

      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.padGain!);
      osc.start(time);
      osc.stop(time + dur + 0.01);
    });
  }

  private playMelodyNote(time: number, dur: number) {
    if (!this.ctx || !this.melodyGain) return;
    const energyF = this.params.energy / 100;

    // Stepwise melody: move 0, ±1, or ±2 scale degrees (weighted toward small steps)
    const steps = [-2, -1, -1, 0, 0, 1, 1, 2];
    const step = steps[Math.floor(Math.random() * steps.length)];
    this.melodyLastNote = Math.max(0, Math.min(6, this.melodyLastNote + step));

    // Tend toward chord tones
    const chordRoot = this.currentProgression[this.currentChordIndex];
    const chordTones = [chordRoot, (chordRoot + 2) % 7, (chordRoot + 4) % 7];
    if (Math.random() < 0.4 && !chordTones.includes(this.melodyLastNote)) {
      // Snap to nearest chord tone
      let closest = chordTones[0];
      let minDist = Math.abs(this.melodyLastNote - closest);
      for (const ct of chordTones) {
        const dist = Math.abs(this.melodyLastNote - ct);
        if (dist < minDist) { closest = ct; minDist = dist; }
      }
      this.melodyLastNote = closest;
    }

    const freq = this.currentScale[this.melodyLastNote] * 2; // octave 5

    // Lead synth: two detuned oscillators + filter
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();

    osc1.type = energyF > 0.55 ? 'sawtooth' : 'triangle';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 1.002, time); // slight detune

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200 + energyF * 2500, time);
    filter.frequency.exponentialRampToValueAtTime(600 + energyF * 500, time + dur * 0.8);
    filter.Q.value = 1 + energyF * 2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.15, time + 0.015); // fast attack
    gain.gain.setValueAtTime(0.12, time + dur * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.melodyGain);
    osc1.start(time);
    osc1.stop(time + dur + 0.01);
    osc2.start(time);
    osc2.stop(time + dur + 0.01);
  }
}

// Singleton
let instance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!instance) instance = new AudioEngine();
  return instance;
}
