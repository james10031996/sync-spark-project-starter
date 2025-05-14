
// Audio utility functions for chord progression player

// Define chord types for the progression player
export const chordTypes = [
  { id: "major", name: "Major", symbol: "" },
  { id: "minor", name: "Minor", symbol: "m" },
  { id: "7", name: "7th", symbol: "7" },
  { id: "maj7", name: "Major 7th", symbol: "maj7" },
  { id: "min7", name: "Minor 7th", symbol: "m7" },
  { id: "dim", name: "Diminished", symbol: "dim" },
  { id: "aug", name: "Augmented", symbol: "aug" },
  { id: "sus2", name: "Sus2", symbol: "sus2" },
  { id: "sus4", name: "Sus4", symbol: "sus4" },
];

// Root notes
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

// Define functional instruments
export const availableInstruments: Record<string, { name: string; type: string }> = {
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

// Get style-specific variations for sound
export const getStyleVariations = (style: string) => {
  const baseVariations = {
    noteDelayMod: 0,
    attackMod: 0,
    releaseMod: 0,
    filterFreqMod: 0,
    vibratoDepthMod: 0,
    vibratoRateMod: 0,
    detuneAmount: 0,
    reverbLevel: 0.1,
    distortion: 0,
    chorusLevel: 0
  };
  
  switch(style) {
    case "Pop":
      return {
        ...baseVariations,
        noteDelayMod: 0.01,
        attackMod: 0.02,
        filterFreqMod: 500,
        detuneAmount: 3,
        chorusLevel: 0.2
      };
    case "Jazz":
      return {
        ...baseVariations,
        noteDelayMod: 0.04,
        attackMod: 0.05,
        releaseMod: 0.3,
        vibratoDepthMod: 5,
        vibratoRateMod: 2,
        reverbLevel: 0.3,
        filterFreqMod: 200
      };
    case "Rock":
      return {
        ...baseVariations,
        attackMod: -0.01,
        detuneAmount: 6,
        filterFreqMod: -500,
        distortion: 15,
        reverbLevel: 0.15
      };
    case "Blues":
      return {
        ...baseVariations,
        noteDelayMod: 0.05,
        vibratoDepthMod: 10,
        vibratoRateMod: 1,
        detuneAmount: 4,
        filterFreqMod: -300
      };
    case "Funk":
      return {
        ...baseVariations,
        noteDelayMod: -0.01,
        attackMod: -0.02,
        filterFreqMod: 800,
        reverbLevel: 0.05
      };
    case "Latin":
      return {
        ...baseVariations,
        noteDelayMod: 0.02,
        vibratoDepthMod: 4,
        detuneAmount: 2,
        reverbLevel: 0.25,
        chorusLevel: 0.1
      };
    case "Soul":
      return {
        ...baseVariations,
        noteDelayMod: 0.03,
        attackMod: 0.04,
        vibratoDepthMod: 6,
        reverbLevel: 0.25,
        filterFreqMod: 200
      };
    case "50s":
      return {
        ...baseVariations,
        noteDelayMod: 0.02,
        vibratoDepthMod: 3,
        reverbLevel: 0.4,
        chorusLevel: 0.05,
        filterFreqMod: -200
      };
    default:
      return baseVariations;
  }
};

// Get chord types for different musical styles
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

// Get instrument settings for different instruments
export const getInstrumentSettings = (instrumentId: string, style: string) => {
  const baseSettings = {
    octave: 4,
    waveform: "triangle" as OscillatorType,
    attack: 0.03,
    decay: 0.1,
    sustain: 0.7,
    release: 1.5,
    filterType: "lowpass" as BiquadFilterType,
    filterFreq: 5000,
    filterQ: 1,
    noteDelay: 0.02,
    vibratoRate: 5,
    vibratoDepth: 3
  };
  
  // Get style variations to adapt instrument settings
  const styleVariations = getStyleVariations(style);
  
  // Customize based on instrument
  switch(instrumentId) {
    case "piano":
      return {
        ...baseSettings,
        waveform: "triangle",
        octave: 4,
        attack: 0.01 + styleVariations.attackMod * 0.5,
        release: 1.2 + styleVariations.releaseMod * 0.5,
        filterFreq: 5000 + styleVariations.filterFreqMod * 0.5
      };
    case "acousticPiano":
      return {
        ...baseSettings,
        waveform: "triangle",
        octave: 4,
        attack: 0.02 + styleVariations.attackMod * 0.5,
        release: 1.5 + styleVariations.releaseMod,
        filterFreq: 6000 + styleVariations.filterFreqMod * 0.5
      };
    case "electricPiano":
      return {
        ...baseSettings,
        waveform: "sine",
        octave: 4,
        attack: 0.01 + styleVariations.attackMod * 0.3,
        release: 1.0 + styleVariations.releaseMod * 0.8,
        filterFreq: 4000 + styleVariations.filterFreqMod * 1.2
      };
    default:
      return baseSettings;
  }
};

// Create audio effects
export const createDistortion = (context: AudioContext, amount: number) => {
  const distortion = context.createWaveShaper();
  
  function makeDistortionCurve(amount: number) {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < n_samples; i++) {
      const x = i * 2 / n_samples - 1;
      curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }
  
  distortion.curve = makeDistortionCurve(amount);
  distortion.oversample = "4x";
  
  return distortion;
};

// Create chorus effect
export const createChorus = (context: AudioContext, frequency: number, amount: number) => {
  const chorus = context.createGain();
  
  // Create two detuned oscillators
  const detune1 = amount * 5;
  const detune2 = -amount * 5;
  
  const osc1 = context.createOscillator();
  osc1.type = "sine";
  osc1.frequency.value = frequency;
  osc1.detune.value = detune1;
  
  const osc2 = context.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = frequency;
  osc2.detune.value = detune2;
  
  const gain1 = context.createGain();
  gain1.gain.value = amount * 0.3;
  
  const gain2 = context.createGain();
  gain2.gain.value = amount * 0.3;
  
  osc1.connect(gain1);
  osc2.connect(gain2);
  gain1.connect(chorus);
  gain2.connect(chorus);
  
  osc1.start();
  osc2.start();
  setTimeout(() => {
    osc1.stop();
    osc2.stop();
  }, 5000); // Stop after 5 seconds
  
  return chorus;
};
