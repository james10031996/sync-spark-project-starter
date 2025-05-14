
import { ChordInProgression } from "../types/audio";
import { rootNotes } from "./audioUtils";
import { getStyleVariations, getInstrumentSettings, createDistortion, createChorus } from "./audioUtils";

// Create instrument-specific tones with advanced sound design
export const createInstrumentTone = (
  context: AudioContext,
  frequency: number,
  masterGain: GainNode,
  instrumentId: string,
  settings: any,
  delay: number = 0,
  styleVariations: any = {}
) => {
  // Create oscillators and audio nodes
  const osc = context.createOscillator();
  const gain = context.createGain();
  
  // Create filter
  const filter = context.createBiquadFilter();
  filter.type = settings.filterType;
  filter.frequency.value = settings.filterFreq;
  filter.Q.value = settings.filterQ;
  
  // Set oscillator properties
  osc.type = settings.waveform;
  osc.frequency.value = frequency;
  osc.detune.value = Math.random() * styleVariations.detuneAmount * 2 - styleVariations.detuneAmount;
  
  // Apply ADSR envelope
  const now = context.currentTime;
  const attackTime = Math.max(0.001, settings.attack);
  const releaseTime = Math.max(0.001, settings.release);
  
  gain.gain.setValueAtTime(0, now + delay);
  gain.gain.linearRampToValueAtTime(settings.sustain, now + delay + attackTime);
  gain.gain.setValueAtTime(settings.sustain * 0.8, now + delay + settings.decay);
  gain.gain.exponentialRampToValueAtTime(0.001, now + delay + releaseTime);
  
  // Connect nodes
  let outputNode: AudioNode = filter;
  osc.connect(filter);
  
  // Add distortion if needed
  if (styleVariations.distortion > 0) {
    const distortion = createDistortion(context, styleVariations.distortion);
    filter.connect(distortion);
    outputNode = distortion;
  } else {
    filter.connect(gain);
    outputNode = gain;
  }
  
  // Add chorus if needed
  if (styleVariations.chorusLevel > 0 && 
      ["electricGuitar", "acousticGuitar", "electricPiano", "strings"].includes(instrumentId)) {
    const chorus = createChorus(context, frequency, styleVariations.chorusLevel);
    outputNode.connect(chorus);
    chorus.connect(gain);
  } else if (outputNode !== gain) {
    outputNode.connect(gain);
  }
  
  // Add reverb for certain instruments
  if (styleVariations.reverbLevel > 0) {
    const reverbGain = context.createGain();
    reverbGain.gain.value = styleVariations.reverbLevel;
    
    // Create a simple reverb effect with delay
    const delay = context.createDelay();
    delay.delayTime.value = 0.1;
    
    const reverbFilter = context.createBiquadFilter();
    reverbFilter.type = "lowpass";
    reverbFilter.frequency.value = 3000;
    
    gain.connect(delay);
    delay.connect(reverbFilter);
    reverbFilter.connect(reverbGain);
    reverbGain.connect(masterGain);
  }
  
  gain.connect(masterGain);
  
  // Start and stop oscillator
  osc.start(now + delay);
  osc.stop(now + delay + releaseTime + 0.1);
  
  // Add vibrato for expressive instruments
  if (settings.vibratoDepth > 0) {
    const lfo = context.createOscillator();
    const lfoGain = context.createGain();
    
    lfo.type = "sine";
    lfo.frequency.value = settings.vibratoRate;
    
    lfoGain.gain.value = settings.vibratoDepth;
    
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    
    lfo.start(now + delay + 0.1);
    lfo.stop(now + delay + releaseTime);
  }
  
  return { osc, gain }; // Return for potential cleanup
};

// Play a chord with specified instruments and settings
export const playChord = (
  chord: ChordInProgression,
  sectionIndex: number,
  context: AudioContext,
  volume: number,
  style: string,
  sectionInstruments: string[],
  audioDestination?: MediaStreamAudioDestinationNode | null,
  isRecording: boolean = false
) => {
  try {
    const masterGain = context.createGain();
    masterGain.gain.value = volume / 100;
    masterGain.connect(context.destination);
    
    // Connect masterGain to recording destination if recording
    if (audioDestination && isRecording) {
      masterGain.connect(audioDestination);
    }
    
    // Get style variations to adapt sound
    const styleVariations = getStyleVariations(style);
    
    // For each instrument in the section, create tones
    sectionInstruments.forEach(instrumentId => {
      // Define frequencies for notes in the chord
      const rootIndex = rootNotes.indexOf(chord.root);
      
      // Set intervals based on chord type
      let intervals: number[];
      switch (chord.type) {
        case "minor":
          intervals = [0, 3, 7];
          break;
        case "7":
          intervals = [0, 4, 7, 10];
          break;
        case "maj7":
          intervals = [0, 4, 7, 11];
          break;
        case "min7":
          intervals = [0, 3, 7, 10];
          break;
        case "dim":
          intervals = [0, 3, 6];
          break;
        case "aug":
          intervals = [0, 4, 8];
          break;
        case "sus2":
          intervals = [0, 2, 7];
          break;
        case "sus4":
          intervals = [0, 5, 7];
          break;
        default:
          intervals = [0, 4, 7]; // Default to major chord intervals
      }
      
      // Create instrument tones
      const instrumentSettings = getInstrumentSettings(instrumentId, style);
      
      // Create tones for each note in the chord
      intervals.forEach((interval, i) => {
        const noteIndex = (rootIndex + interval) % 12;
        const octaveOffset = Math.floor((rootIndex + interval) / 12);
        const note = rootNotes[noteIndex];
        
        // Calculate frequency using scientific pitch notation
        const a4Index = rootNotes.indexOf("A") + (4 * 12);
        const noteFullIndex = rootNotes.indexOf(note) + ((instrumentSettings.octave + octaveOffset) * 12);
        const frequency = 440 * Math.pow(2, (noteFullIndex - a4Index) / 12);
        
        createInstrumentTone(
          context, 
          frequency, 
          masterGain,
          instrumentId,
          instrumentSettings,
          i * instrumentSettings.noteDelay + styleVariations.noteDelayMod,
          styleVariations
        );
      });
    });
    
  } catch (error) {
    console.error("Error playing chord:", error);
  }
};
