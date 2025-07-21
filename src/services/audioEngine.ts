// src/services/audioEngine.ts

export class AudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.value = 0.7;
      this.isInitialized = true;
      console.log('Audio Engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Audio Engine:', error);
      throw error;
    }
  }

  // Play a simple oscillator note
  playNote(frequency: number, duration: number = 0.5): void {
    if (!this.isInitialized || !this.context || !this.masterGain) {
      console.warn('Audio Engine not initialized');
      return;
    }

    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();

    oscillator.connect(envelope);
    envelope.connect(this.masterGain);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sawtooth';

    const now = this.context.currentTime;
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(0.3, now + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  // Play a chord
  playChord(notes: string[]): void {
    const noteFrequencies: { [key: string]: number } = {
      'C': 261.63, 'C#': 277.18, 'Db': 277.18, 'D': 293.66, 'D#': 311.13, 'Eb': 311.13,
      'E': 329.63, 'F': 349.23, 'F#': 369.99, 'Gb': 369.99, 'G': 392.00, 'G#': 415.30,
      'Ab': 415.30, 'A': 440.00, 'A#': 466.16, 'Bb': 466.16, 'B': 493.88
    };

    notes.forEach((note, index) => {
      const frequency = noteFrequencies[note];
      if (frequency) {
        setTimeout(() => this.playNote(frequency, 1), index * 50);
      }
    });
  }

  // Simple drum synthesizer
  playDrum(type: string): void {
    if (!this.isInitialized || !this.context) return;

    const now = this.context.currentTime;

    switch (type.toUpperCase()) {
      case 'KICK':
        this.playKick(now);
        break;
      case 'SNARE':
        this.playSnare(now);
        break;
      case 'HI-HAT':
      case 'HIHAT':
        this.playHiHat(now);
        break;
      case 'OPEN HAT':
        this.playOpenHat(now);
        break;
      case 'CRASH':
        this.playCrash(now);
        break;
      case 'CLAP':
        this.playClap(now);
        break;
      default:
        this.playPercussion(now);
    }
  }

  private playKick(time: number): void {
    if (!this.context || !this.masterGain) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

    osc.start(time);
    osc.stop(time + 0.5);
  }

  private playSnare(time: number): void {
    if (!this.context || !this.masterGain) return;

    // Noise for snare
    const bufferSize = this.context.sampleRate * 0.2;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.context.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.context.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = this.context.createGain();
    noiseGain.gain.setValueAtTime(1, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(time);
  }

  private playHiHat(time: number): void {
    if (!this.context || !this.masterGain) return;

    const bufferSize = this.context.sampleRate * 0.05;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.context.createBufferSource();
    noise.buffer = buffer;

    const filter = this.context.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 10000;

    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
  }

  private playOpenHat(time: number): void {
    if (!this.context || !this.masterGain) return;

    const bufferSize = this.context.sampleRate * 0.3;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.context.createBufferSource();
    noise.buffer = buffer;

    const filter = this.context.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 8000;

    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
  }

  private playCrash(time: number): void {
    if (!this.context || !this.masterGain) return;

    const bufferSize = this.context.sampleRate * 2;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.context.createBufferSource();
    noise.buffer = buffer;

    const filter = this.context.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;

    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
  }

  private playClap(time: number): void {
    if (!this.context || !this.masterGain) return;

    // Multiple short bursts for clap
    for (let i = 0; i < 3; i++) {
      const bufferSize = this.context.sampleRate * 0.01;
      const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
      const output = buffer.getChannelData(0);

      for (let j = 0; j < bufferSize; j++) {
        output[j] = Math.random() * 2 - 1;
      }

      const noise = this.context.createBufferSource();
      noise.buffer = buffer;

      const filter = this.context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1500;

      const gain = this.context.createGain();
      gain.gain.setValueAtTime(0.5, time + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.01, time + i * 0.03 + 0.01);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(time + i * 0.03);
    }
  }

  private playPercussion(time: number): void {
    if (!this.context || !this.masterGain) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.frequency.value = 800 + Math.random() * 400;
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  // Set master volume
  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  // Get audio context for advanced usage
  getContext(): AudioContext | null {
    return this.isInitialized ? this.context : null;
  }

  // Check if audio is ready
  isReady(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const audioEngine = new AudioEngine();