
// Audio utilities for chord progression

// Define root notes
export const rootNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Common chord progressions for auto-generation
export const commonProgressions = {
  'Pop I-V-vi-IV': [
    { root: 'C', type: 'major' },
    { root: 'G', type: 'major' },
    { root: 'A', type: 'minor' },
    { root: 'F', type: 'major' },
  ],
  'Jazz ii-V-I': [
    { root: 'D', type: 'minor' },
    { root: 'G', type: '7' },
    { root: 'C', type: 'maj7' },
    { root: 'C', type: 'maj7' },
  ],
  'Blues I-IV-V': [
    { root: 'C', type: '7' },
    { root: 'F', type: '7' },
    { root: 'G', type: '7' },
    { root: 'C', type: '7' },
  ],
  '50s I-vi-IV-V': [
    { root: 'C', type: 'major' },
    { root: 'A', type: 'minor' },
    { root: 'F', type: 'major' },
    { root: 'G', type: 'major' },
  ],
  'Funk I-IV-V': [
    { root: 'D', type: '7' },
    { root: 'G', type: '7' },
    { root: 'A', type: '7' },
    { root: 'D', type: '7' },
  ],
  'Rock I-V-VI-IV': [
    { root: 'E', type: 'major' },
    { root: 'B', type: 'major' },
    { root: 'C#', type: 'minor' },
    { root: 'A', type: 'major' },
  ],
  'Latin i-bVII-bVI-V': [
    { root: 'A', type: 'minor' },
    { root: 'G', type: 'major' },
    { root: 'F', type: 'major' },
    { root: 'E', type: '7' },
  ],
  'Soul ii-V-I': [
    { root: 'D', type: 'min7' },
    { root: 'G', type: '7' },
    { root: 'C', type: 'maj7' },
    { root: 'C', type: 'maj7' },
  ],
};

// Define only functional instruments
export const availableInstruments = {
  piano: { name: "Piano", type: "keyboard" },
  acousticPiano: { name: "Acoustic Piano", type: "keyboard" },
  electricPiano: { name: "Electric Piano", type: "keyboard" },
  organ: { name: "Organ", type: "keyboard" },
  synth: { name: "Synth", type: "keyboard" },
  guitar: { name: "Guitar", type: "string" },
  acousticGuitar: { name: "Acoustic Guitar", type: "string" },
  electricGuitar: { name: "Electric Guitar", type: "string" },
  bass: { name: "Bass", type: "string" },
  acousticBass: { name: "Acoustic Bass", type: "string" },
  electricBass: { name: "Electric Bass", type: "string" },
  drums: { name: "Drums", type: "percussion" },
  strings: { name: "Strings", type: "orchestral" },
  brass: { name: "Brass", type: "orchestral" },
  saxophone: { name: "Saxophone", type: "woodwind" },
  flute: { name: "Flute", type: "woodwind" },
};

// Get appropriate chord types for different musical styles
export const getChordTypesForStyle = (style: string): string[] => {
  switch(style) {
    case "Jazz":
      return ["maj7", "min7", "7", "dim", "sus4"];
    case "Blues":
      return ["7", "min7", "major", "minor"];
    case "Rock":
      return ["major", "minor", "7", "sus4"];
    case "Funk":
      return ["7", "min7", "major", "sus4"];
    case "Latin":
      return ["major", "minor", "7", "maj7"];
    case "50s":
      return ["major", "minor", "7"];
    case "Soul":
      return ["maj7", "min7", "7"];
    case "Pop":
    default:
      return ["major", "minor", "sus2", "sus4"];
  }
};

// Get style variations to adapt sound
export const getStyleVariations = (style: string) => {
  switch(style) {
    case "Jazz":
      return {
        detuneAmount: 5,
        noteDelayMod: 0.05,
        distortion: 0.1,
        chorusLevel: 0.2,
        reverbLevel: 0.6
      };
    case "Blues":
      return {
        detuneAmount: 10,
        noteDelayMod: 0.03,
        distortion: 0.3,
        chorusLevel: 0.1,
        reverbLevel: 0.4
      };
    case "Rock":
      return {
        detuneAmount: 3,
        noteDelayMod: 0.01,
        distortion: 0.4,
        chorusLevel: 0.15,
        reverbLevel: 0.3
      };
    case "Funk":
      return {
        detuneAmount: 2,
        noteDelayMod: 0.01,
        distortion: 0.2,
        chorusLevel: 0.1,
        reverbLevel: 0.2
      };
    case "Latin":
      return {
        detuneAmount: 4,
        noteDelayMod: 0.02,
        distortion: 0.05,
        chorusLevel: 0.3,
        reverbLevel: 0.5
      };
    case "50s":
      return {
        detuneAmount: 8,
        noteDelayMod: 0.03,
        distortion: 0.15,
        chorusLevel: 0.4,
        reverbLevel: 0.7
      };
    case "Soul":
      return {
        detuneAmount: 6,
        noteDelayMod: 0.02,
        distortion: 0.1,
        chorusLevel: 0.3,
        reverbLevel: 0.6
      };
    case "Pop":
    default:
      return {
        detuneAmount: 2,
        noteDelayMod: 0.01,
        distortion: 0.05,
        chorusLevel: 0.2,
        reverbLevel: 0.4
      };
  }
};

// Get instrument settings based on the instrument and style
export const getInstrumentSettings = (instrumentId: string, style: string) => {
  const baseSettings = {
    octave: 4,
    waveform: 'sine' as OscillatorType,
    attack: 0.05,
    decay: 0.1,
    sustain: 0.7,
    release: 0.8,
    filterType: 'lowpass' as BiquadFilterType,
    filterFreq: 2000,
    filterQ: 1,
    noteDelay: 0.02,
    vibratoRate: 5,
    vibratoDepth: 0
  };
  
  // Adjust settings based on instrument
  switch(instrumentId) {
    case 'piano':
    case 'acousticPiano':
      return {
        ...baseSettings,
        octave: 4,
        waveform: 'triangle',
        attack: 0.01,
        decay: 0.2,
        sustain: 0.5,
        release: 1.5,
        filterFreq: 8000
      };
    case 'electricPiano':
      return {
        ...baseSettings,
        octave: 4,
        waveform: 'sine',
        attack: 0.02,
        decay: 0.5,
        sustain: 0.4,
        release: 1.2,
        filterFreq: 5000,
        vibratoRate: 6,
        vibratoDepth: style === 'Jazz' ? 5 : 2
      };
    case 'organ':
      return {
        ...baseSettings,
        octave: 4,
        waveform: 'sawtooth',
        attack: 0.02,
        decay: 0.3,
        sustain: 0.8,
        release: 0.5,
        filterFreq: 3000
      };
    case 'synth':
      return {
        ...baseSettings,
        octave: 4,
        waveform: 'sawtooth',
        attack: 0.05,
        decay: 0.3,
        sustain: 0.6,
        release: 0.8,
        filterFreq: 4000,
        vibratoRate: 6,
        vibratoDepth: 10
      };
    case 'guitar':
    case 'acousticGuitar':
      return {
        ...baseSettings,
        octave: 3,
        waveform: 'triangle',
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 0.8,
        filterFreq: 6000,
        noteDelay: 0.03
      };
    case 'electricGuitar':
      return {
        ...baseSettings,
        octave: 3,
        waveform: 'square',
        attack: 0.01,
        decay: 0.15,
        sustain: 0.4,
        release: 0.7,
        filterFreq: 3500,
        noteDelay: 0.02
      };
    case 'bass':
    case 'acousticBass':
    case 'electricBass':
      return {
        ...baseSettings,
        octave: 2,
        waveform: 'triangle',
        attack: 0.01,
        decay: 0.1,
        sustain: 0.7,
        release: 0.6,
        filterFreq: 2000,
        noteDelay: 0
      };
    case 'strings':
      return {
        ...baseSettings,
        octave: 4,
        waveform: 'sine',
        attack: 0.1,
        decay: 0.3,
        sustain: 0.6,
        release: 1.5,
        filterFreq: 3000,
        vibratoRate: 5,
        vibratoDepth: 3
      };
    case 'brass':
      return {
        ...baseSettings,
        octave: 4,
        waveform: 'sawtooth',
        attack: 0.05,
        decay: 0.1,
        sustain: 0.7,
        release: 0.3,
        filterFreq: 2000
      };
    case 'saxophone':
      return {
        ...baseSettings,
        octave: 4,
        waveform: 'sawtooth',
        attack: 0.08,
        decay: 0.1,
        sustain: 0.8,
        release: 0.4,
        filterFreq: 1800,
        vibratoRate: 5,
        vibratoDepth: 10
      };
    case 'flute':
      return {
        ...baseSettings,
        octave: 5,
        waveform: 'sine',
        attack: 0.05,
        decay: 0.1,
        sustain: 0.7,
        release: 0.3,
        filterFreq: 2500,
        vibratoRate: 6,
        vibratoDepth: 5
      };
    default:
      return baseSettings;
  }
};

// Audio effect utilities
export const createDistortion = (context: AudioContext, amount: number) => {
  const distortion = context.createWaveShaper();
  
  // Create distortion curve
  const curve = new Float32Array(44100);
  const deg = Math.PI / 180;
  
  for (let i = 0; i < 44100; i++) {
    const x = i * 2 / 44100 - 1;
    curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
  }
  
  distortion.curve = curve;
  distortion.oversample = '4x';
  
  return distortion;
};

export const createChorus = (context: AudioContext, frequency: number, level: number) => {
  const delayNode = context.createDelay();
  delayNode.delayTime.value = 0.03;
  
  // Create LFO for chorus effect
  const lfo = context.createOscillator();
  const lfoGain = context.createGain();
  
  lfo.frequency.value = 1.5;
  lfoGain.gain.value = 0.005 * level;
  
  lfo.connect(lfoGain);
  lfoGain.connect(delayNode.delayTime);
  
  // Start the LFO
  lfo.start();
  
  return delayNode;
};
