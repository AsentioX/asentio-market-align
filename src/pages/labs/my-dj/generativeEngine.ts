// Generative music engine using Web Audio API
// Creates rich, musical adaptive soundscapes with chord progressions,
// arpeggios, delay, reverb, and melodic sequences

import { MusicParams } from './musicEngine';

type EngineState = 'stopped' | 'playing';

// Musical scales (semitone offsets from root)
const SCALES = {
  minor:      [0, 2, 3, 5, 7, 8, 10],
  major:      [0, 2, 4, 5, 7, 9, 11],
  pentatonic: [0, 3, 5, 7, 10],
  dorian:     [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
};

// Chord progressions (scale degree indices) per mood
const PROGRESSIONS: Record<string, number[][]> = {
  calm:     [[0, 2, 4], [3, 5, 0], [4, 6, 1], [2, 4, 6]],       // i - iv - v - iii
  focus:    [[0, 2, 4], [5, 0, 2], [3, 5, 0], [4, 6, 1]],       // I - vi - IV - V
  energize: [[0, 2, 4], [4, 6, 1], [3, 5, 0], [5, 0, 2]],       // I - V - IV - vi
  tense:    [[0, 2, 4], [6, 1, 3], [5, 0, 2], [1, 3, 5]],       // i - vii - vi - ii
};

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function getScaleNote(root: number, scale: number[], degree: number): number {
  const octaveOffset = Math.floor(degree / scale.length);
  const idx = ((degree % scale.length) + scale.length) % scale.length;
  return root + scale[idx] + octaveOffset * 12;
}

export class GenerativeEngine {
  private ctx: AudioContext | null = null;
  private state: EngineState = 'stopped';
  private masterGain: GainNode | null = null;
  private reverbGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayWet: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private convolverWet: GainNode | null = null;
  private currentParams: MusicParams = { bpm: 70, energy: 20, rhythmDensity: 15, vocalPresence: 10, harmonicTension: 10, intensity: 50 };
  private currentVolume = 0.7;
  private updateInterval: number | null = null;

  // Musical state
  private rootMidi = 48; // C3
  private scale = SCALES.minor;
  private chordIndex = 0;
  private progression = PROGRESSIONS.calm;
  private beatTimer: number | null = null;
  private arpTimer: number | null = null;
  private melodyTimer: number | null = null;
  private padOscs: { osc: OscillatorNode; gain: GainNode; filter: BiquadFilterNode }[] = [];
  private subOsc: OscillatorNode | null = null;
  private subGain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;

  private getCtx(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  setVolume(v: number) {
    this.currentVolume = Math.max(0, Math.min(1, v));
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.currentVolume * 0.35, this.getCtx().currentTime, 0.1);
    }
  }

  setParams(p: MusicParams) {
    this.currentParams = { ...p };
    if (this.state === 'playing') {
      this.applyParams();
    }
  }

  start() {
    if (this.state === 'playing') return;
    const ctx = this.getCtx();
    if (ctx.state === 'suspended') ctx.resume();

    // Master output
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(ctx.destination);

    // Effects chain
    this.buildEffects(ctx);
    this.buildPads(ctx);
    this.buildNoise(ctx);
    this.selectMusicalContext();

    // Fade in
    this.masterGain.gain.setTargetAtTime(this.currentVolume * 0.35, ctx.currentTime, 1.0);
    this.state = 'playing';

    // Start musical loops
    this.startChordLoop();
    this.startArpeggio();
    this.startMelody();
    this.startBeatLoop();

    // Periodic smooth param updates
    this.updateInterval = window.setInterval(() => this.applyParams(), 3000);
  }

  // ─── Effects ──────────────────────────────────────
  private buildEffects(ctx: AudioContext) {
    // Stereo delay
    this.delayNode = ctx.createDelay(2.0);
    this.delayNode.delayTime.value = 0.375; // dotted eighth feel
    this.delayFeedback = ctx.createGain();
    this.delayFeedback.gain.value = 0.35;
    this.delayWet = ctx.createGain();
    this.delayWet.gain.value = 0.2;

    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayNode.connect(this.delayWet);
    this.delayWet.connect(this.masterGain!);

    // Convolution reverb (impulse response from noise)
    this.convolver = ctx.createConvolver();
    const irLength = ctx.sampleRate * 2.5;
    const irBuffer = ctx.createBuffer(2, irLength, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = irBuffer.getChannelData(ch);
      for (let i = 0; i < irLength; i++) {
        // Exponential decay with some diffusion
        const decay = Math.exp(-3.5 * i / irLength);
        data[i] = (Math.random() * 2 - 1) * decay;
      }
    }
    this.convolver.buffer = irBuffer;
    this.convolverWet = ctx.createGain();
    this.convolverWet.gain.value = 0.25;
    this.convolver.connect(this.convolverWet);
    this.convolverWet.connect(this.masterGain!);
  }

  private sendToEffects(node: AudioNode) {
    if (this.delayNode) node.connect(this.delayNode);
    if (this.convolver) node.connect(this.convolver);
  }

  // ─── Pad (warm chord bed) ────────────────────────
  private buildPads(ctx: AudioContext) {
    // 4 oscillators for rich chord voicing
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = i < 2 ? 'sawtooth' : 'triangle';
      osc.frequency.value = 220;
      osc.detune.value = (i - 1.5) * 8; // slight spread

      filter.type = 'lowpass';
      filter.frequency.value = 600;
      filter.Q.value = 0.7;

      gain.gain.value = 0.06;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);
      this.sendToEffects(gain);
      osc.start();

      this.padOscs.push({ osc, gain, filter });
    }

    // Sub bass
    this.subOsc = ctx.createOscillator();
    this.subGain = ctx.createGain();
    this.subOsc.type = 'sine';
    this.subOsc.frequency.value = 55;
    this.subGain.gain.value = 0.12;
    this.subOsc.connect(this.subGain);
    this.subGain.connect(this.masterGain!);
    this.subOsc.start();

    // Pad LFO for filter sweep
    this.lfo = ctx.createOscillator();
    this.lfoGain = ctx.createGain();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = 0.12;
    this.lfoGain.gain.value = 250;
    this.lfo.connect(this.lfoGain);
    this.padOscs.forEach(p => this.lfoGain!.connect(p.filter.frequency));
    this.lfo.start();
  }

  // ─── Noise texture ───────────────────────────────
  private buildNoise(ctx: AudioContext) {
    const bufSize = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

    this.noiseNode = ctx.createBufferSource();
    this.noiseNode.buffer = buf;
    this.noiseNode.loop = true;

    this.noiseFilter = ctx.createBiquadFilter();
    this.noiseFilter.type = 'bandpass';
    this.noiseFilter.frequency.value = 3000;
    this.noiseFilter.Q.value = 0.8;

    this.noiseGain = ctx.createGain();
    this.noiseGain.gain.value = 0.012;

    this.noiseNode.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.masterGain!);
    this.noiseNode.start();
  }

  // ─── Musical context selection ────────────────────
  private selectMusicalContext() {
    const p = this.currentParams;

    // Root note based on energy (lower energy = lower root)
    if (p.energy < 25) this.rootMidi = 43; // G2
    else if (p.energy < 50) this.rootMidi = 48; // C3
    else if (p.energy < 75) this.rootMidi = 50; // D3
    else this.rootMidi = 53; // F3

    // Scale based on tension & energy
    if (p.harmonicTension > 60) {
      this.scale = SCALES.dorian;
      this.progression = PROGRESSIONS.tense;
    } else if (p.energy > 60) {
      this.scale = SCALES.mixolydian;
      this.progression = PROGRESSIONS.energize;
    } else if (p.energy > 35) {
      this.scale = SCALES.major;
      this.progression = PROGRESSIONS.focus;
    } else {
      this.scale = SCALES.pentatonic;
      this.progression = PROGRESSIONS.calm;
    }
  }

  // ─── Chord loop (changes chord every N beats) ─────
  private startChordLoop() {
    const changeBars = () => {
      if (this.state !== 'playing' || !this.ctx) return;
      const beatsPerChord = 4;
      const beatMs = 60000 / Math.max(40, this.currentParams.bpm);
      const chordMs = beatMs * beatsPerChord;

      this.chordIndex = (this.chordIndex + 1) % this.progression.length;
      this.voiceChord();

      this.beatTimer = window.setTimeout(changeBars, chordMs);
    };
    this.voiceChord();
    const beatMs = 60000 / Math.max(40, this.currentParams.bpm);
    this.beatTimer = window.setTimeout(changeBars, beatMs * 4);
  }

  private voiceChord() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const chord = this.progression[this.chordIndex];

    // Voice the 4 pad oscillators across chord tones + extensions
    const voicings = [
      getScaleNote(this.rootMidi, this.scale, chord[0]),        // root
      getScaleNote(this.rootMidi, this.scale, chord[1]),        // third
      getScaleNote(this.rootMidi, this.scale, chord[2]),        // fifth
      getScaleNote(this.rootMidi + 12, this.scale, chord[0]),   // octave root
    ];

    this.padOscs.forEach((p, i) => {
      const freq = midiToFreq(voicings[i]);
      p.osc.frequency.setTargetAtTime(freq, now, 0.8);
    });

    // Sub follows root
    if (this.subOsc) {
      const subFreq = midiToFreq(getScaleNote(this.rootMidi - 12, this.scale, chord[0]));
      this.subOsc.frequency.setTargetAtTime(subFreq, now, 0.5);
    }
  }

  // ─── Arpeggio ─────────────────────────────────────
  private startArpeggio() {
    const playArpNote = () => {
      if (this.state !== 'playing' || !this.ctx) return;
      const p = this.currentParams;

      // Arpeggio intensity scales with rhythmDensity
      if (p.rhythmDensity < 15) {
        const beatMs = 60000 / Math.max(40, p.bpm);
        this.arpTimer = window.setTimeout(playArpNote, beatMs);
        return;
      }

      const ctx = this.ctx;
      const now = ctx.currentTime;
      const chord = this.progression[this.chordIndex];

      // Pick a note from the chord, occasionally adding extensions
      const degreePool = [...chord];
      if (p.harmonicTension > 40 && Math.random() < 0.3) {
        degreePool.push(chord[0] + 7); // add 7th
      }
      const degree = degreePool[Math.floor(Math.random() * degreePool.length)];
      const octave = Math.random() < 0.4 ? 12 : 0;
      const midi = getScaleNote(this.rootMidi + octave, this.scale, degree);
      const freq = midiToFreq(midi);

      // Pluck-like synth voice
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.value = freq;
      osc2.type = 'sine';
      osc2.frequency.value = freq * 2.01; // slight shimmer

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000 + p.energy * 40, now);
      filter.frequency.setTargetAtTime(400, now, 0.15);
      filter.Q.value = 2;

      const vol = 0.04 + (p.rhythmDensity / 100) * 0.06;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.setTargetAtTime(0.001, now, 0.2 + (1 - p.energy / 100) * 0.3);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);
      this.sendToEffects(gain);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 1.5);
      osc2.stop(now + 1.5);

      // Timing: subdivisions based on density
      const beatMs = 60000 / Math.max(40, p.bpm);
      const subdivision = p.rhythmDensity > 60 ? 0.25 : p.rhythmDensity > 35 ? 0.5 : 1;
      const jitter = (Math.random() - 0.5) * beatMs * 0.08; // humanize
      const nextMs = beatMs * subdivision + jitter;

      // Occasional rests
      const restChance = p.rhythmDensity > 50 ? 0.1 : 0.3;
      const actualNext = Math.random() < restChance ? nextMs * 2 : nextMs;

      this.arpTimer = window.setTimeout(playArpNote, Math.max(80, actualNext));
    };

    const beatMs = 60000 / Math.max(40, this.currentParams.bpm);
    this.arpTimer = window.setTimeout(playArpNote, beatMs / 2);
  }

  // ─── Melody (sparse, ambient notes) ───────────────
  private startMelody() {
    const playMelody = () => {
      if (this.state !== 'playing' || !this.ctx) return;
      const p = this.currentParams;
      const ctx = this.ctx;
      const now = ctx.currentTime;

      // Melody plays sparse, floating notes in higher octave
      if (p.vocalPresence > 10) {
        const chord = this.progression[this.chordIndex];
        // Walk stepwise or jump
        const stepChoices = [0, 1, 2, 3, 4, 5, 6];
        const step = stepChoices[Math.floor(Math.random() * stepChoices.length)];
        const midi = getScaleNote(this.rootMidi + 24, this.scale, step);
        const freq = midiToFreq(midi);

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.value = freq;

        filter.type = 'lowpass';
        filter.frequency.value = 1500 + p.energy * 20;
        filter.Q.value = 1;

        const vol = 0.02 + (p.vocalPresence / 100) * 0.04;
        const attackTime = 0.3 + (1 - p.energy / 100) * 0.5;
        const releaseTime = 0.5 + (1 - p.energy / 100) * 1.5;

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol, now + attackTime);
        gain.gain.setTargetAtTime(0.001, now + attackTime + 0.2, releaseTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain!);
        this.sendToEffects(gain);

        osc.start(now);
        osc.stop(now + attackTime + releaseTime + 1);
      }

      // Next melody note: longer intervals, very human-feeling
      const beatMs = 60000 / Math.max(40, p.bpm);
      const interval = beatMs * (2 + Math.random() * 4); // every 2-6 beats
      this.melodyTimer = window.setTimeout(playMelody, interval);
    };

    const beatMs = 60000 / Math.max(40, this.currentParams.bpm);
    this.melodyTimer = window.setTimeout(playMelody, beatMs * 2);
  }

  // ─── Beat loop (kick + perc) ──────────────────────
  private startBeatLoop() {
    // Handled via chord loop timing — kick on downbeat
    // Additional percussive elements scheduled here
  }

  private scheduleKick() {
    if (this.state !== 'playing' || !this.ctx) return;
    if (this.currentParams.rhythmDensity < 25) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.1);

    const vol = Math.min(0.2, this.currentParams.rhythmDensity / 400);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // ─── Parameter application ────────────────────────
  private applyParams() {
    if (!this.ctx || this.state !== 'playing') return;
    const now = this.ctx.currentTime;
    const p = this.currentParams;

    this.selectMusicalContext();

    // Pad filter & gain
    const padCutoff = 400 + (p.energy / 100) * 2500 + (p.harmonicTension / 100) * 1000;
    const padVol = 0.04 + (p.energy / 100) * 0.04;
    this.padOscs.forEach(pad => {
      pad.filter.frequency.setTargetAtTime(padCutoff, now, 1.0);
      pad.filter.Q.setTargetAtTime(0.5 + (p.harmonicTension / 100) * 3, now, 1.0);
      pad.gain.gain.setTargetAtTime(padVol, now, 1.0);
    });

    // Sub volume
    if (this.subGain) {
      const subVol = 0.06 + (p.energy / 100) * 0.1;
      this.subGain.gain.setTargetAtTime(subVol, now, 0.5);
    }

    // LFO rate
    if (this.lfo) {
      this.lfo.frequency.setTargetAtTime(0.06 + (p.energy / 100) * 0.3, now, 1.0);
    }
    if (this.lfoGain) {
      this.lfoGain.gain.setTargetAtTime(150 + (p.energy / 100) * 350, now, 1.0);
    }

    // Noise texture
    if (this.noiseGain) {
      this.noiseGain.gain.setTargetAtTime(0.005 + (p.harmonicTension / 100) * 0.025, now, 0.5);
    }
    if (this.noiseFilter) {
      this.noiseFilter.frequency.setTargetAtTime(1500 + (p.energy / 100) * 3000, now, 1.0);
    }

    // Delay time synced to BPM (dotted eighth)
    if (this.delayNode) {
      const delayTime = (60 / Math.max(40, p.bpm)) * 0.75;
      this.delayNode.delayTime.setTargetAtTime(delayTime, now, 0.5);
    }
    if (this.delayFeedback) {
      this.delayFeedback.gain.setTargetAtTime(0.2 + (p.energy / 100) * 0.25, now, 0.5);
    }
    if (this.delayWet) {
      this.delayWet.gain.setTargetAtTime(0.1 + (p.energy / 100) * 0.15, now, 0.5);
    }

    // Reverb amount
    if (this.convolverWet) {
      const reverbAmount = 0.35 - (p.energy / 100) * 0.15; // more reverb when calm
      this.convolverWet.gain.setTargetAtTime(reverbAmount, now, 0.5);
    }
  }

  // ─── Lifecycle ────────────────────────────────────
  stop() {
    if (this.state === 'stopped') return;
    this.state = 'stopped';

    if (this.updateInterval) { clearInterval(this.updateInterval); this.updateInterval = null; }
    if (this.beatTimer) { clearTimeout(this.beatTimer); this.beatTimer = null; }
    if (this.arpTimer) { clearTimeout(this.arpTimer); this.arpTimer = null; }
    if (this.melodyTimer) { clearTimeout(this.melodyTimer); this.melodyTimer = null; }

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
      setTimeout(() => this.cleanup(), 2000);
    } else {
      this.cleanup();
    }
  }

  private cleanup() {
    const safeStop = (n: AudioNode | AudioBufferSourceNode | OscillatorNode | null) => {
      if (!n) return;
      try { if ('stop' in n) (n as OscillatorNode).stop(); } catch {}
      try { n.disconnect(); } catch {}
    };

    this.padOscs.forEach(p => { safeStop(p.osc); safeStop(p.gain); safeStop(p.filter); });
    this.padOscs = [];

    safeStop(this.subOsc); this.subOsc = null;
    safeStop(this.subGain); this.subGain = null;
    safeStop(this.lfo); this.lfo = null;
    safeStop(this.lfoGain); this.lfoGain = null;
    safeStop(this.noiseNode); this.noiseNode = null;
    safeStop(this.noiseGain); this.noiseGain = null;
    safeStop(this.noiseFilter); this.noiseFilter = null;
    safeStop(this.delayNode); this.delayNode = null;
    safeStop(this.delayFeedback); this.delayFeedback = null;
    safeStop(this.delayWet); this.delayWet = null;
    safeStop(this.convolver); this.convolver = null;
    safeStop(this.convolverWet); this.convolverWet = null;
    safeStop(this.masterGain); this.masterGain = null;
  }

  getState(): EngineState { return this.state; }
  isActuallyPlaying(): boolean { return this.state === 'playing'; }

  dispose() {
    this.stop();
    if (this.ctx && this.ctx.state !== 'closed') {
      try { this.ctx.close(); } catch {}
    }
    this.ctx = null;
  }
}

// Singleton
let instance: GenerativeEngine | null = null;
export function getGenerativeEngine(): GenerativeEngine {
  if (!instance) instance = new GenerativeEngine();
  return instance;
}
