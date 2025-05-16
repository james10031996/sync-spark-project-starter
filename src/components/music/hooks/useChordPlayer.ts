
import { useRef, useState, useCallback, useEffect } from "react";
import { ChordInProgression } from "../types/chordTypes";
import { createInstrumentTone, getInstrumentSettings, getNoteFrequency } from "../utils/audioUtils";
import { rootNotes } from "../types/chordTypes";

export const useChordPlayer = (volume: number = 80) => {
  const audioContext = useRef<AudioContext | null>(null);
  const masterGainNode = useRef<GainNode | null>(null);
  const compressorNode = useRef<DynamicsCompressorNode | null>(null);
  
  // Initialize audio context with user interaction
  const initAudioContext = useCallback(() => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create master compressor for better mix
      compressorNode.current = audioContext.current.createDynamicsCompressor();
      compressorNode.current.threshold.value = -24;
      compressorNode.current.knee.value = 30;
      compressorNode.current.ratio.value = 12;
      compressorNode.current.attack.value = 0.003;
      compressorNode.current.release.value = 0.25;
      
      // Create master gain node
      masterGainNode.current = audioContext.current.createGain();
      masterGainNode.current.gain.value = 1.0;
      
      // Setup the audio routing
      masterGainNode.current.connect(compressorNode.current);
      compressorNode.current.connect(audioContext.current.destination);
    }
    
    // Resume audioContext if it was suspended (needed for Chrome)
    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }
    
    return audioContext.current;
  }, []);
  
  // Clean up audio context when component unmounts
  useEffect(() => {
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
        audioContext.current = null;
      }
    };
  }, []);
  
  // Play a chord with improved sound quality
  const playChord = useCallback((
    chord: ChordInProgression, 
    instrumentsToUse: string[], 
    pattern: string = "Pop"
  ) => {
    try {
      const context = initAudioContext();
      
      // Create master compressor for better mix if it doesn't exist
      if (!compressorNode.current) {
        compressorNode.current = context.createDynamicsCompressor();
        compressorNode.current.threshold.value = -24;
        compressorNode.current.knee.value = 30;
        compressorNode.current.ratio.value = 12;
        compressorNode.current.attack.value = 0.003;
        compressorNode.current.release.value = 0.25;
      }
      
      // Create master gain node if it doesn't exist
      if (!masterGainNode.current) {
        masterGainNode.current = context.createGain();
        masterGainNode.current.gain.value = 1.0;
        masterGainNode.current.connect(compressorNode.current);
        compressorNode.current.connect(context.destination);
      }
      
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
      masterGainNode.current.connect(masterReverb);
      masterReverb.connect(masterReverbGain);
      masterReverbGain.connect(compressorNode.current);
      
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
        intervals.forEach((interval, index) => {
          const adjustedNoteIndex = (rootIndex + interval) % 12;
          const octaveOffset = Math.floor((rootIndex + interval) / 12);
          const note = rootNotes[adjustedNoteIndex];
          
          // Calculate frequency using scientific pitch notation
          const frequency = getNoteFrequency(note, instrumentSettings.octave + octaveOffset);
          
          // Small timing variation for natural feel - different for each note and instrument
          const noteDelay = instrumentDelay + (index * 0.012) + (Math.random() * 0.005);
          
          // Add slight velocity variation based on note position in chord
          const noteVolumeMultiplier = interval === 0 ? 1.0 : (interval === intervals[1] ? 0.92 : 0.85);
          
          // Enhanced spatial positioning for better instrument separation
          // Different instruments get placed at different positions in the stereo field
          const instrumentPanPosition = getPanningForInstrument(instrumentId, instrumentsToUse.length);
          
          createInstrumentTone(
            context, 
            frequency, 
            masterGainNode.current,
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
              panning: instrumentPanPosition + ((index % 3) * 0.05 - 0.05)
            },
            noteDelay,
            volume * noteVolumeMultiplier
          );
        });
      });
      
    } catch (error) {
      console.error("Error playing chord:", error);
    }
  }, [initAudioContext, volume]);
  
  // Helper function to intelligently place instruments across the stereo field
  const getPanningForInstrument = (instrumentId: string, totalInstruments: number): number => {
    // Define ideal positions for instruments when used together
    // This creates better stereo separation between instruments
    
    if (totalInstruments <= 1) {
      // If only one instrument, center it
      return 0;
    }

    // Different panning strategies for different numbers of instruments
    switch (instrumentId) {
      case "piano":
        return -0.15;
      case "acousticGuitar":
        return 0.25;
      case "electricGuitar":
        return 0.4;
      case "bass":
        return -0.05; // Bass mostly centered but slightly left
      case "strings":
        return -0.3;
      case "synth":
        return 0.3;
      case "organ":
        return 0.1;
      default:
        return 0;
    }
  };
  
  return { playChord, initAudioContext };
};
