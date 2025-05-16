
import { useRef, useState } from "react";
import { ChordInProgression } from "../types/chordTypes";
import { createInstrumentTone, getInstrumentSettings, getNoteFrequency } from "../utils/audioUtils";
import { rootNotes } from "../types/chordTypes";

export const useChordPlayer = (volume: number = 80) => {
  const audioContext = useRef<AudioContext | null>(null);
  
  // Initialize audio context with user interaction
  const initAudioContext = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext.current;
  };
  
  // Play a chord with improved sound quality
  const playChord = (
    chord: ChordInProgression, 
    instrumentsToUse: string[], 
    pattern: string = "Pop"
  ) => {
    try {
      const context = initAudioContext();
      
      // Create master compressor for better mix
      const compressor = context.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.knee.value = 30;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;
      
      // Create master gain node
      const masterGain = context.createGain();
      masterGain.gain.value = 1.0;
      
      // Add a subtle reverb to the master output for overall space
      const masterReverb = context.createConvolver();
      
      // Create impulse response for small room reverb
      const impulseLength = 0.5;
      const rate = context.sampleRate;
      const impulse = context.createBuffer(2, rate * impulseLength, rate);
      
      for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
        const impulseData = impulse.getChannelData(channel);
        for (let i = 0; i < impulseData.length; i++) {
          impulseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / (rate * impulseLength), 2);
        }
      }
      
      masterReverb.buffer = impulse;
      
      // Create master reverb gain
      const masterReverbGain = context.createGain();
      masterReverbGain.gain.value = 0.1; // Subtle reverb
      
      // Connect master chain with split for dry/wet reverb
      masterGain.connect(compressor);
      masterGain.connect(masterReverb);
      masterReverb.connect(masterReverbGain);
      masterReverbGain.connect(compressor);
      compressor.connect(context.destination);
      
      if (instrumentsToUse.length === 0) {
        // If no instruments are selected, default to piano
        instrumentsToUse = ['piano'];
      }
      
      // Define frequencies for notes in the chord
      const rootIndex = rootNotes.indexOf(chord.root);
      
      // Set intervals based on chord type with improved voicings
      let intervals: number[];
      switch (chord.type) {
        case "minor":
          intervals = [0, 3, 7, 12]; // Added octave for fullness
          break;
        case "7":
          intervals = [0, 4, 7, 10];
          break;
        case "maj7":
          intervals = [0, 4, 7, 11, 14]; // Added 5th in higher octave
          break;
        case "min7":
          intervals = [0, 3, 7, 10, 12]; // Added octave for richness
          break;
        case "dim":
          intervals = [0, 3, 6, 9]; // Added diminished 7th
          break;
        case "aug":
          intervals = [0, 4, 8, 12]; // Added octave
          break;
        case "sus2":
          intervals = [0, 2, 7, 12]; // Added octave
          break;
        case "sus4":
          intervals = [0, 5, 7, 12]; // Added octave
          break;
        default:
          intervals = [0, 4, 7, 12]; // Default to major chord intervals with octave
      }
      
      // Create tones for each instrument with enhanced sound quality and spatial positioning
      instrumentsToUse.forEach((instrumentId, instrumentIndex) => {
        // Adjust timing per instrument for more realistic ensemble feel
        const instrumentDelay = instrumentIndex * 0.005;
        
        const instrumentSettings = getInstrumentSettings(instrumentId, pattern);
        
        // Create tones for each note in the chord with slight timing variations for realism
        intervals.forEach((interval, noteIndex) => {
          const noteIndex = (rootIndex + interval) % 12;
          const octaveOffset = Math.floor((rootIndex + interval) / 12);
          const note = rootNotes[noteIndex];
          
          // Calculate frequency using scientific pitch notation
          const frequency = getNoteFrequency(note, instrumentSettings.octave + octaveOffset);
          
          // Small timing variation for natural feel - different for each note and instrument
          const noteDelay = instrumentDelay + (noteIndex * 0.012) + (Math.random() * 0.005);
          
          // Add slight velocity variation based on note position in chord
          const noteVolumeMultiplier = interval === 0 ? 1.0 : (interval === intervals[1] ? 0.92 : 0.85);
          
          createInstrumentTone(
            context, 
            frequency, 
            masterGain,
            instrumentId,
            {
              ...instrumentSettings,
              // Add slight variations to settings based on pattern/style
              attack: pattern === "Jazz" ? 
                instrumentSettings.attack * 1.2 : 
                pattern === "Blues" ? 
                  instrumentSettings.attack * 0.8 : 
                  instrumentSettings.attack,
              // Adjust panning based on note position for width
              panning: instrumentSettings.panning + ((noteIndex % 3) * 0.05 - 0.05)
            },
            noteDelay,
            volume * noteVolumeMultiplier
          );
        });
      });
      
    } catch (error) {
      console.error("Error playing chord:", error);
    }
  };
  
  return { playChord, initAudioContext };
};
