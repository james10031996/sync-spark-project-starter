
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
  
  // Volume adjustment based on instrument for better balance
  const instrumentVolume = getInstrumentVolume(instrumentId) * (volume / 100);
  
  // Apply improved ADSR envelope for more natural sound
  const now = context.currentTime;
  const attackTime = Math.max(0.001, settings.attack);
  const decayTime = Math.max(0.001, settings.decay);
  const releaseTime = Math.max(0.001, settings.release);
  
  gainNode.gain.setValueAtTime(0, now + delay);
  gainNode.gain.linearRampToValueAtTime(instrumentVolume, now + delay + attackTime);
  gainNode.gain.setValueAtTime(instrumentVolume * settings.sustain, now + delay + attackTime + decayTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + attackTime + decayTime + releaseTime);
  
  // Connect nodes with improved routing
  osc.connect(filter);
  filter.connect(panner);
  panner.connect(gainNode);
  
  // Add enhanced effects based on instrument type
  if (["piano", "strings", "synth"].includes(instrumentId)) {
    // Create more sophisticated reverb with feedback
    const reverbGain = context.createGain();
    reverbGain.gain.value = 0.18;
    
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
  
  // For electric guitar and synth, add subtle distortion
  if (["electricGuitar", "synth"].includes(instrumentId)) {
    const distortion = context.createWaveShaper();
    distortion.curve = createDistortionCurve(30);
    distortion.oversample = '4x';
    
    const distortionGain = context.createGain();
    distortionGain.gain.value = 0.1;
    
    gainNode.connect(distortion);
    distortion.connect(distortionGain);
    distortionGain.connect(masterGain);
  }
  
  gainNode.connect(masterGain);
  
  // Start and stop oscillator with small padding
  osc.start(now + delay);
  osc.stop(now + delay + attackTime + decayTime + releaseTime + 0.1);
  
  return { osc, gainNode }; // Return for potential cleanup
};

// Get instrument-specific volume balance
const getInstrumentVolume = (instrumentId: string): number => {
  switch (instrumentId) {
    case "piano":
      return 0.6;
    case "acousticGuitar":
      return 0.55;
    case "electricGuitar":
      return 0.45;
    case "bass":
      return 0.7;
    case "strings":
      return 0.5;
    case "synth":
      return 0.4;
    case "organ":
      return 0.5;
    default:
      return 0.5;
  }
};

// Create distortion curve for electric guitar and synth
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
