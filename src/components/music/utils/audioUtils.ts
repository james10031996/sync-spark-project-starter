/**
 * Audio utility functions for the music components
 */

// Get instrument-specific settings with improved sound quality
export const getInstrumentSettings = (instrumentId: string, patternStyle: string) => {
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
    panning: 0,
    detune: 0,
  };
  
  // Customize based on instrument with enhanced settings for better sound quality
  switch(instrumentId) {
    case "piano":
      return {
        ...baseSettings,
        waveform: "triangle",
        octave: 4,
        attack: 0.01,
        decay: 1.5,
        sustain: 0.8,
        release: 1.8,
        filterFreq: 6000,
        panning: -0.15,
      };
    case "acousticGuitar":
      return {
        ...baseSettings,
        waveform: "triangle",
        octave: 3,
        attack: 0.02,
        decay: 0.3,
        sustain: 0.6,
        release: 1.2,
        filterFreq: 5500,
        panning: 0.2,
        detune: 2,
      };
    case "electricGuitar":
      return {
        ...baseSettings, 
        waveform: "sawtooth",
        octave: 3,
        attack: 0.01,
        decay: 0.3,
        sustain: 0.6,
        release: 1.0,
        filterFreq: 4000,
        panning: 0.3,
        detune: -3,
      };
    case "bass":
      return {
        ...baseSettings,
        waveform: patternStyle === "Blues" ? "sawtooth" : "triangle",
        octave: 2,
        attack: 0.04,
        decay: 0.15,
        sustain: 0.9,
        release: 1.2,
        filterFreq: 2500,
        panning: -0.1,
        detune: 0,
      };
    case "strings":
      return {
        ...baseSettings,
        waveform: "sine",
        octave: 4,
        attack: 0.15,
        decay: 0.3,
        sustain: 0.8,
        release: 2.5,
        filterFreq: 4500,
        panning: -0.2,
        detune: 5,
      };
    case "synth":
      return {
        ...baseSettings,
        waveform: "sawtooth",
        octave: 4,
        attack: 0.03,
        decay: 0.2,
        sustain: 0.7,
        release: 1.0,
        filterFreq: 3500,
        panning: 0.25,
        detune: -4,
      };
    case "organ":
      return {
        ...baseSettings,
        waveform: "sine",
        octave: 4,
        attack: 0.003,
        decay: 0.1,
        sustain: 0.9,
        release: 0.9,
        filterFreq: 7500,
        panning: 0,
        detune: 0,
      };
    default:
      return baseSettings;
  }
};

// Create instrument-specific tones with improved sound quality
export const createInstrumentTone = (
  context: AudioContext,
  frequency: number,
  masterGain: GainNode,
  instrumentId: string,
  settings: any,
  delay: number = 0,
  volume: number = 80
) => {
  // Create oscillators and audio nodes
  const osc = context.createOscillator();
  const gainNode = context.createGain();
  
  // Create filter with improved settings
  const filter = context.createBiquadFilter();
  filter.type = settings.filterType;
  filter.frequency.value = settings.filterFreq;
  filter.Q.value = settings.filterQ;
  
  // Add panning for spatial separation
  const panner = context.createStereoPanner();
  panner.pan.value = settings.panning || 0;
  
  // Set oscillator properties with slight detune for richness
  osc.type = settings.waveform;
  osc.frequency.value = frequency;
  if (settings.detune) {
    osc.detune.value = settings.detune;
  }
  
  // Add EQ for better frequency separation between instruments
  const eqLow = context.createBiquadFilter();
  const eqMid = context.createBiquadFilter();
  const eqHigh = context.createBiquadFilter();
  
  eqLow.type = "lowshelf";
  eqMid.type = "peaking";
  eqHigh.type = "highshelf";
  
  // Set EQ parameters based on instrument type for better separation
  applyInstrumentEQ(instrumentId, eqLow, eqMid, eqHigh);
  
  // Volume adjustment based on instrument for better balance and clarity
  const instrumentVolume = getInstrumentVolume(instrumentId) * (volume / 100);
  
  // Apply improved ADSR envelope for more natural sound
  const now = context.currentTime;
  const attackTime = Math.max(0.001, settings.attack);
  const decayTime = Math.max(0.001, settings.decay);
  const releaseTime = Math.max(0.001, settings.release);
  
  gainNode.gain.setValueAtTime(0, now + delay);
  gainNode.gain.linearRampToValueAtTime(instrumentVolume, now + delay + attackTime);
  gainNode.gain.setValueAtTime(instrumentVolume * settings.sustain, now + delay + attackTime + decayTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + attackTime + decayTime + releaseTime);
  
  // Connect nodes with improved routing including EQ
  osc.connect(filter);
  filter.connect(eqLow);
  eqLow.connect(eqMid);
  eqMid.connect(eqHigh);
  eqHigh.connect(panner);
  panner.connect(gainNode);
  
  // Add enhanced effects based on instrument type
  if (["piano", "strings", "synth"].includes(instrumentId)) {
    // Create more sophisticated reverb with feedback for spatial depth
    const reverbGain = context.createGain();
    reverbGain.gain.value = 0.2; // Increased for better audibility
    
    const delay1 = context.createDelay();
    delay1.delayTime.value = 0.12;
    
    const delay2 = context.createDelay();
    delay2.delayTime.value = 0.15;
    
    const reverbFilter = context.createBiquadFilter();
    reverbFilter.type = "lowpass";
    reverbFilter.frequency.value = 3500;
    
    // Create a feedback loop for richer reverb
    const feedback = context.createGain();
    feedback.gain.value = 0.15;
    
    gainNode.connect(delay1);
    delay1.connect(reverbFilter);
    reverbFilter.connect(feedback);
    feedback.connect(delay2);
    delay2.connect(reverbFilter);
    reverbFilter.connect(reverbGain);
    reverbGain.connect(masterGain);
  }
  
  // For electric guitar and synth, add better distortion and harmonics
  if (["electricGuitar", "synth"].includes(instrumentId)) {
    const distortion = context.createWaveShaper();
    distortion.curve = createDistortionCurve(30);
    distortion.oversample = '4x';
    
    const distortionGain = context.createGain();
    distortionGain.gain.value = 0.15; // Increased for more character
    
    gainNode.connect(distortion);
    distortion.connect(distortionGain);
    distortionGain.connect(masterGain);
    
    // Add a second oscillator slightly detuned for richer sound
    const osc2 = context.createOscillator();
    osc2.type = "sawtooth";
    osc2.frequency.value = frequency;
    osc2.detune.value = instrumentId === "electricGuitar" ? 5 : -5;
    
    const osc2Gain = context.createGain();
    osc2Gain.gain.value = 0.15;
    
    osc2.connect(osc2Gain);
    osc2Gain.connect(masterGain);
    osc2.start(now + delay);
    osc2.stop(now + delay + attackTime + decayTime + releaseTime + 0.1);
  }
  
  // For bass, add sub-bass enhancement
  if (instrumentId === "bass") {
    // Add sub-oscillator for deep bass
    const subOsc = context.createOscillator();
    subOsc.type = "sine";
    subOsc.frequency.value = frequency / 2; // One octave lower
    
    const subGain = context.createGain();
    subGain.gain.value = 0.3;
    
    const subFilter = context.createBiquadFilter();
    subFilter.type = "lowpass";
    subFilter.frequency.value = 120; // Only pass very low frequencies
    
    subOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(masterGain);
    
    subOsc.start(now + delay);
    subOsc.stop(now + delay + attackTime + decayTime + releaseTime + 0.1);
  }
  
  // For acoustic instruments, add body resonance
  if (["acousticGuitar", "piano"].includes(instrumentId)) {
    const bodyResonance = context.createBiquadFilter();
    bodyResonance.type = "peaking";
    bodyResonance.frequency.value = instrumentId === "acousticGuitar" ? 220 : 420;
    bodyResonance.Q.value = 5;
    bodyResonance.gain.value = 6;
    
    const resonanceGain = context.createGain();
    resonanceGain.gain.value = 0.2;
    
    gainNode.connect(bodyResonance);
    bodyResonance.connect(resonanceGain);
    resonanceGain.connect(masterGain);
  }
  
  // For organ, add harmonics
  if (instrumentId === "organ") {
    // Add multiple oscillators for organ harmonics
    const frequencies = [
      frequency * 2, // One octave up
      frequency * 3, // Fifth above octave
      frequency * 4  // Two octaves up
    ];
    
    const gains = [0.2, 0.1, 0.05];
    
    frequencies.forEach((freq, i) => {
      const harmOsc = context.createOscillator();
      harmOsc.type = "sine";
      harmOsc.frequency.value = freq;
      
      const harmGain = context.createGain();
      harmGain.gain.value = gains[i];
      
      harmOsc.connect(harmGain);
      harmGain.connect(masterGain);
      
      harmOsc.start(now + delay);
      harmOsc.stop(now + delay + attackTime + decayTime + releaseTime + 0.1);
    });
  }
  
  gainNode.connect(masterGain);
  
  // Start and stop oscillator with small padding
  osc.start(now + delay);
  osc.stop(now + delay + attackTime + decayTime + releaseTime + 0.1);
  
  return { osc, gainNode }; // Return for potential cleanup
};

// New function to apply instrument-specific EQ for better separation
const applyInstrumentEQ = (
  instrumentId: string,
  lowEQ: BiquadFilterNode,
  midEQ: BiquadFilterNode,
  highEQ: BiquadFilterNode
) => {
  switch (instrumentId) {
    case "piano":
      // Piano - boost mids slightly, cut very low and very high
      lowEQ.frequency.value = 250;
      lowEQ.gain.value = -2;
      midEQ.frequency.value = 800;
      midEQ.Q.value = 1;
      midEQ.gain.value = 3;
      highEQ.frequency.value = 6000;
      highEQ.gain.value = -1;
      break;
      
    case "acousticGuitar":
      // Acoustic guitar - boost high mids for clarity
      lowEQ.frequency.value = 150;
      lowEQ.gain.value = -1;
      midEQ.frequency.value = 1200;
      midEQ.Q.value = 1.2;
      midEQ.gain.value = 4;
      highEQ.frequency.value = 5000;
      highEQ.gain.value = 2;
      break;
      
    case "electricGuitar":
      // Electric guitar - boost mid range
      lowEQ.frequency.value = 200;
      lowEQ.gain.value = -3;
      midEQ.frequency.value = 1800;
      midEQ.Q.value = 1.5;
      midEQ.gain.value = 5;
      highEQ.frequency.value = 4500;
      highEQ.gain.value = 1;
      break;
      
    case "bass":
      // Bass - boost lows, cut highs
      lowEQ.frequency.value = 80;
      lowEQ.gain.value = 5;
      midEQ.frequency.value = 400;
      midEQ.Q.value = 0.8;
      midEQ.gain.value = -2;
      highEQ.frequency.value = 2000;
      highEQ.gain.value = -6;
      break;
      
    case "strings":
      // Strings - smooth mids, boost highs for air
      lowEQ.frequency.value = 300;
      lowEQ.gain.value = -1;
      midEQ.frequency.value = 900;
      midEQ.Q.value = 0.7;
      midEQ.gain.value = 2;
      highEQ.frequency.value = 7000;
      highEQ.gain.value = 3;
      break;
      
    case "synth":
      // Synth - boost low and high for presence
      lowEQ.frequency.value = 150;
      lowEQ.gain.value = 3;
      midEQ.frequency.value = 1000;
      midEQ.Q.value = 2;
      midEQ.gain.value = -2;
      highEQ.frequency.value = 5000;
      highEQ.gain.value = 4;
      break;
      
    case "organ":
      // Organ - boost low mids and high mids
      lowEQ.frequency.value = 200;
      lowEQ.gain.value = 2;
      midEQ.frequency.value = 1500;
      midEQ.Q.value = 2;
      midEQ.gain.value = 4;
      highEQ.frequency.value = 6000;
      highEQ.gain.value = -1;
      break;
      
    default:
      // Default neutral EQ
      lowEQ.frequency.value = 200;
      lowEQ.gain.value = 0;
      midEQ.frequency.value = 1000;
      midEQ.Q.value = 1;
      midEQ.gain.value = 0;
      highEQ.frequency.value = 5000;
      highEQ.gain.value = 0;
  }
};

// Get instrument-specific volume balance with improved levels
const getInstrumentVolume = (instrumentId: string): number => {
  switch (instrumentId) {
    case "piano":
      return 0.65; // Slightly raised for better clarity
    case "acousticGuitar":
      return 0.58; // Enhanced for better presence
    case "electricGuitar":
      return 0.5; // Boosted for better audibility
    case "bass":
      return 0.75; // Slight boost
    case "strings":
      return 0.55; // Better balance
    case "synth":
      return 0.45; // Adjusted for blend
    case "organ":
      return 0.55; // Better presence
    default:
      return 0.5;
  }
};

// Create distortion curve for electric guitar and synth with improved harmonics
function createDistortionCurve(amount: number) {
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;
  
  for (let i = 0; i < samples; ++i) {
    const x = i * 2 / samples - 1;
    curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
  }
  
  return curve;
}

// Calculate note frequency using scientific pitch notation
export const getNoteFrequency = (note: string, octave: number): number => {
  const rootNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const noteIndex = rootNotes.indexOf(note);
  // A4 is the reference note (440 Hz)
  const a4Index = rootNotes.indexOf("A") + (4 * 12);
  const noteFullIndex = noteIndex + (octave * 12);
  return 440 * Math.pow(2, (noteFullIndex - a4Index) / 12);
};

// Enhanced drum sound generation functions
export const createEnhancedDrumSound = async (type: string, context: AudioContext): Promise<AudioBuffer> => {
  // Create a buffer for the sound
  let buffer: AudioBuffer;
  const sampleRate = context.sampleRate;
  
  switch (type) {
    case "kick": {
      // Enhanced kick drum with deeper sub frequencies and better punch
      buffer = context.createBuffer(2, sampleRate * 0.6, sampleRate);
      const dataLeft = buffer.getChannelData(0);
      const dataRight = buffer.getChannelData(1);
      
      for (let i = 0; i < dataLeft.length; i++) {
        const t = i / sampleRate;
        
        // Main frequency sweep (deeper than before)
        const frequency = 60 * Math.exp(-20 * t);
        
        // Add stronger punch at the start
        const punchEnv = Math.exp(-150 * t);
        const punch = Math.sin(2 * Math.PI * 220 * t) * punchEnv * 0.7;
        
        // Enhanced sub bass
        const subFreq = 40 * Math.exp(-12 * t);
        const sub = Math.sin(2 * Math.PI * subFreq * t) * 0.85;
        
        const mainSound = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-12 * t);
        
        // Combine components with better ratios
        const combined = mainSound * 0.7 + punch * 0.35 + sub * 0.5;
        
        // Apply stronger attack envelope
        const env = Math.exp(-7 * t);
        
        // Add subtle stereo variation for dimension
        dataLeft[i] = combined * env;
        dataRight[i] = combined * env * 0.98;
      }
      break;
    }
    case "snare": {
      // Completely redesigned snare with more snap and body
      buffer = context.createBuffer(2, sampleRate * 0.4, sampleRate);
      const dataLeft = buffer.getChannelData(0);
      const dataRight = buffer.getChannelData(1);
      
      for (let i = 0; i < dataLeft.length; i++) {
        const t = i / sampleRate;
        
        // Snappy transient attack
        const snapEnv = Math.exp(-180 * t);
        const snap = (Math.random() * 2 - 1) * snapEnv * 0.8;
        
        // Body component (tone)
        const toneEnv = Math.exp(-25 * t);
        const tone1 = Math.sin(2 * Math.PI * 230 * t) * toneEnv * 0.4;
        const tone2 = Math.sin(2 * Math.PI * 460 * t) * toneEnv * 0.3;
        
        // Noise component with better filtering
        const noise = (Math.random() * 2 - 1);
        const noiseHP = noise - (Math.random() * 2 - 1) * 0.3;
        const noiseEnv = Math.exp(-t * 15);
        
        // Combine components with better balance for snare character
        dataLeft[i] = snap * 0.6 + (tone1 + tone2) * 0.4 + noiseHP * noiseEnv * 0.6;
        
        // Slight stereo variation for width
        dataRight[i] = snap * 0.58 + (tone1 * 0.95 + tone2 * 1.05) * 0.4 + 
          noiseHP * noiseEnv * 0.62 * (1 + (Math.random() * 0.06 - 0.03));
      }
      break;
    }
    case "hihat": {
      // Enhanced hi-hat with more sizzle
      buffer = context.createBuffer(2, sampleRate * 0.2, sampleRate);
      const dataLeft = buffer.getChannelData(0);
      const dataRight = buffer.getChannelData(1);
      
      // Create a better filtered noise
      for (let i = 0; i < dataLeft.length; i++) {
        const t = i / sampleRate;
        
        // Generate metallic noise with more harmonics
        let noise = 0;
        // Add multiple frequency bands for a more metallic sound
        for (let j = 0; j < 8; j++) {
          const freq = 7500 + j * 1500; // Higher frequencies for more sizzle
          noise += Math.sin(2 * Math.PI * freq * t + Math.random() * 0.3) * 0.08;
        }
        
        // Add more white noise
        noise += (Math.random() * 2 - 1) * 0.6;
        
        // Apply snappier envelope
        const env = Math.exp(-t * (t < 0.003 ? 30 : 100));
        
        // Output with more stereo width
        dataLeft[i] = noise * env;
        dataRight[i] = (Math.random() * 2 - 1) * env * 0.6; // More stereo separation
      }
      break;
    }
    case "clap": {
      // Completely redesigned clap sound that's distinct from snare
      buffer = context.createBuffer(2, sampleRate * 0.5, sampleRate);
      const dataLeft = buffer.getChannelData(0);
      const dataRight = buffer.getChannelData(1);
      
      for (let i = 0; i < dataLeft.length; i++) {
        const t = i / sampleRate;
        let env = 0;
        
        // Create multiple "clap" transients with a different pattern than before
        if (t < 0.001) env = t / 0.001;
        else if (t < 0.006) env = 1 - (t - 0.001) / 0.005;
        else if (t < 0.007) env = 0;
        else if (t < 0.008) env = (t - 0.007) / 0.001;
        else if (t < 0.015) env = 1 - (t - 0.008) / 0.007;
        else if (t < 0.016) env = 0;
        else if (t < 0.017) env = (t - 0.016) / 0.001;
        else if (t < 0.025) env = 1 - (t - 0.017) / 0.008;
        else if (t < 0.026) env = 0;
        else if (t < 0.027) env = (t - 0.026) / 0.001;
        
        // Longer reverb-like decay
        if (t >= 0.027) env = Math.exp(-(t - 0.027) * 12) * 0.9;
        
        // More focused band-limited noise for "hand" character
        let noise = 0;
        for (let j = 0; j < 12; j++) {
          // Focus on higher frequencies than snare
          noise += Math.sin(2 * Math.PI * (2000 + j * 600) * t * (1 + Math.random() * 0.1)) * 0.08;
        }
        noise += (Math.random() * 2 - 1) * 0.3;
        
        // Apply envelope and light compression
        const signal = noise * env;
        const compressed = signal * (1 - Math.max(0, signal - 0.7) * 0.4);
        
        // Wide stereo spreading for distinct clap character
        dataLeft[i] = compressed * 0.95;
        dataRight[i] = (Math.random() * 2 - 1) * env * 0.8; // Very wide stereo
      }
      break;
    }
    default: {
      // Default to a simple tone
      buffer = context.createBuffer(2, sampleRate * 0.2, sampleRate);
      const dataLeft = buffer.getChannelData(0);
      const dataRight = buffer.getChannelData(1);
      
      for (let i = 0; i < dataLeft.length; i++) {
        const t = i / sampleRate;
        const signal = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-10 * t);
        dataLeft[i] = signal;
        dataRight[i] = signal;
      }
    }
  }
  
  return buffer;
};
