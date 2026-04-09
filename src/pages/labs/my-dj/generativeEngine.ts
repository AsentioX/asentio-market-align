// Generative music engine using Web Audio API
// Creates ambient, adaptive soundscapes in real-time based on MusicParams

import { MusicParams } from './musicEngine';

type EngineState = 'stopped' | 'playing';

interface OscLayer {
  osc: OscillatorNode;
  gain: GainNode;
  filter?: BiquadFilterNode;
}

export class GenerativeEngine {
  private ctx: AudioContext | null = null;
  private state: EngineState = 'stopped';
  private masterGain: GainNode | null = null;
  private layers: OscLayer[] = [];
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private currentParams: MusicParams = { bpm: 70, energy: 20, rhythmDensity: 15, vocalPresence: 10, harmonicTension: 10, intensity: 50 };
  private currentVolume = 0.7;
  private updateInterval: number | null = null;
  private beatInterval: number | null = null;
  private kickGain: GainNode | null = null;

  private getCtx(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  setVolume(v: number) {
    this.currentVolume = Math.max(0, Math.min(1, v));
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.currentVolume * 0.3, this.getCtx().currentTime, 0.1);
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

    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(ctx.destination);

    // Build layers
    this.buildPadLayers(ctx);
    this.buildNoise(ctx);
    this.buildRhythm(ctx);

    // Fade in
    this.masterGain.gain.setTargetAtTime(this.currentVolume * 0.3, ctx.currentTime, 0.8);
    this.state = 'playing';

    // Periodic param application for smooth transitions
    this.updateInterval = window.setInterval(() => this.applyParams(), 2000);
  }

  private buildPadLayers(ctx: AudioContext) {
    // Create 3-4 detuned oscillator layers for a pad sound
    const baseFreq = this.getBaseFreq();
    const types: OscillatorType[] = ['sine', 'triangle', 'sine'];
    const detunes = [0, 7, -5];
    const gains = [0.4, 0.2, 0.15];

    types.forEach((type, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = type;
      osc.frequency.value = baseFreq * (i === 2 ? 2 : 1); // octave for 3rd
      osc.detune.value = detunes[i];

      filter.type = 'lowpass';
      filter.frequency.value = 800;
      filter.Q.value = 1;

      gain.gain.value = gains[i];

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);
      osc.start();

      this.layers.push({ osc, gain, filter });
    });

    // Sub bass
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.value = baseFreq / 2;
    subGain.gain.value = 0.15;
    sub.connect(subGain);
    subGain.connect(this.masterGain!);
    sub.start();
    this.layers.push({ osc: sub, gain: subGain });

    // LFO for movement
    this.lfo = ctx.createOscillator();
    this.lfoGain = ctx.createGain();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = 0.15;
    this.lfoGain.gain.value = 200;
    this.lfo.connect(this.lfoGain);
    // Connect LFO to filter frequencies
    this.layers.forEach(l => {
      if (l.filter) {
        this.lfoGain!.connect(l.filter.frequency);
      }
    });
    this.lfo.start();
  }

  private buildNoise(ctx: AudioContext) {
    // Filtered noise for texture
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.noiseNode = ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 2000;
    noiseFilter.Q.value = 0.5;

    this.noiseGain = ctx.createGain();
    this.noiseGain.gain.value = 0.02;

    this.noiseNode.connect(noiseFilter);
    noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.masterGain!);
    this.noiseNode.start();
  }

  private buildRhythm(ctx: AudioContext) {
    this.kickGain = ctx.createGain();
    this.kickGain.gain.value = 0;
    this.kickGain.connect(this.masterGain!);
    this.scheduleBeats();
  }

  private scheduleBeats() {
    if (this.beatInterval) clearInterval(this.beatInterval);
    const beatMs = 60000 / Math.max(40, this.currentParams.bpm);

    this.beatInterval = window.setInterval(() => {
      if (this.state !== 'playing' || !this.ctx || this.currentParams.rhythmDensity < 20) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;

      // Soft kick/pulse
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

      const kickVol = Math.min(0.3, this.currentParams.rhythmDensity / 300);
      gain.gain.setValueAtTime(kickVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 0.2);

      // Hi-hat on high density
      if (this.currentParams.rhythmDensity > 50 && Math.random() < 0.6) {
        setTimeout(() => {
          if (!this.ctx || this.state !== 'playing') return;
          const hatNow = this.ctx.currentTime;
          const hatBuf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.05, this.ctx.sampleRate);
          const hatData = hatBuf.getChannelData(0);
          for (let i = 0; i < hatData.length; i++) hatData[i] = (Math.random() * 2 - 1) * 0.3;

          const hatSrc = this.ctx.createBufferSource();
          hatSrc.buffer = hatBuf;
          const hatGain = this.ctx.createGain();
          const hatFilter = this.ctx.createBiquadFilter();
          hatFilter.type = 'highpass';
          hatFilter.frequency.value = 6000;

          hatGain.gain.setValueAtTime(0.08, hatNow);
          hatGain.gain.exponentialRampToValueAtTime(0.001, hatNow + 0.04);

          hatSrc.connect(hatFilter);
          hatFilter.connect(hatGain);
          hatGain.connect(this.masterGain!);
          hatSrc.start(hatNow);
        }, beatMs / 2);
      }
    }, beatMs);
  }

  private getBaseFreq(): number {
    // Map BPM range to harmonic keys
    // Lower BPM → lower notes, higher BPM → higher notes
    const bpm = this.currentParams.bpm;
    if (bpm < 70) return 65.41;   // C2
    if (bpm < 90) return 82.41;   // E2
    if (bpm < 110) return 98.0;   // G2
    if (bpm < 130) return 110.0;  // A2
    return 130.81;                 // C3
  }

  private applyParams() {
    if (!this.ctx || this.state !== 'playing') return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const p = this.currentParams;
    const baseFreq = this.getBaseFreq();

    // Update pad frequencies smoothly
    this.layers.forEach((layer, i) => {
      const freq = i === 2 ? baseFreq * 2 : i === 3 ? baseFreq / 2 : baseFreq;
      layer.osc.frequency.setTargetAtTime(freq, now, 1.0);

      // Filter cutoff based on energy
      if (layer.filter) {
        const cutoff = 300 + (p.energy / 100) * 3000 + (p.harmonicTension / 100) * 1500;
        layer.filter.frequency.setTargetAtTime(cutoff, now, 0.5);
        layer.filter.Q.setTargetAtTime(0.5 + (p.harmonicTension / 100) * 4, now, 0.5);
      }
    });

    // LFO speed based on energy
    if (this.lfo) {
      const lfoRate = 0.05 + (p.energy / 100) * 0.4;
      this.lfo.frequency.setTargetAtTime(lfoRate, now, 1.0);
    }
    if (this.lfoGain) {
      const lfoDepth = 100 + (p.energy / 100) * 400;
      this.lfoGain.gain.setTargetAtTime(lfoDepth, now, 0.5);
    }

    // Noise level based on harmonicTension
    if (this.noiseGain) {
      const noiseLevel = 0.005 + (p.harmonicTension / 100) * 0.04;
      this.noiseGain.gain.setTargetAtTime(noiseLevel, now, 0.5);
    }

    // Re-schedule beats if BPM changed significantly
    this.scheduleBeats();
  }

  stop() {
    if (this.state === 'stopped') return;
    this.state = 'stopped';

    if (this.updateInterval) { clearInterval(this.updateInterval); this.updateInterval = null; }
    if (this.beatInterval) { clearInterval(this.beatInterval); this.beatInterval = null; }

    // Fade out
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setTargetAtTime(0, now, 0.4);

      // Cleanup after fade
      setTimeout(() => this.cleanup(), 1500);
    } else {
      this.cleanup();
    }
  }

  private cleanup() {
    this.layers.forEach(l => {
      try { l.osc.stop(); } catch {}
      try { l.osc.disconnect(); } catch {}
      try { l.gain.disconnect(); } catch {}
      if (l.filter) try { l.filter.disconnect(); } catch {}
    });
    this.layers = [];

    if (this.lfo) { try { this.lfo.stop(); this.lfo.disconnect(); } catch {} this.lfo = null; }
    if (this.lfoGain) { try { this.lfoGain.disconnect(); } catch {} this.lfoGain = null; }
    if (this.noiseNode) { try { this.noiseNode.stop(); this.noiseNode.disconnect(); } catch {} this.noiseNode = null; }
    if (this.noiseGain) { try { this.noiseGain.disconnect(); } catch {} this.noiseGain = null; }
    if (this.kickGain) { try { this.kickGain.disconnect(); } catch {} this.kickGain = null; }
    if (this.masterGain) { try { this.masterGain.disconnect(); } catch {} this.masterGain = null; }
  }

  getState(): EngineState {
    return this.state;
  }

  isActuallyPlaying(): boolean {
    return this.state === 'playing';
  }

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
  if (!instance) {
    instance = new GenerativeEngine();
  }
  return instance;
}
