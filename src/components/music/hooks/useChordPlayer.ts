
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
  
  // Play a chord with improved sound
  const playChord = (
    chord: ChordInProgression, 
    instrumentsToUse: string[], 
    pattern: string = "Pop"
  ) => {
    try {
      const context = initAudioContext();
      const masterGain = context.createGain();
      masterGain.gain.value = 1.0;  // Master gain is controlled by individual instrument volumes now
      masterGain.connect(context.destination);
      
      if (instrumentsToUse.length === 0) {
        // If no instruments are selected, default to piano
        instrumentsToUse = ['piano'];
      }
      
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
      
      // Create tones for each instrument with enhanced sound quality
      instrumentsToUse.forEach(instrumentId => {
        const instrumentSettings = getInstrumentSettings(instrumentId, pattern);
        
        // Create tones for each note in the chord with slight timing variations for realism
        intervals.forEach((interval, i) => {
          const noteIndex = (rootIndex + interval) % 12;
          const octaveOffset = Math.floor((rootIndex + interval) / 12);
          const note = rootNotes[noteIndex];
          
          // Calculate frequency using scientific pitch notation
          const a4Index = rootNotes.indexOf("A") + (4 * 12);
          const noteFullIndex = rootNotes.indexOf(note) + ((instrumentSettings.octave + octaveOffset) * 12);
          const frequency = 440 * Math.pow(2, (noteFullIndex - a4Index) / 12);
          
          // Small timing variation for natural feel
          const noteDelay = i * 0.02 + (Math.random() * 0.01);
          
          createInstrumentTone(
            context, 
            frequency, 
            masterGain,
            instrumentId,
            instrumentSettings,
            noteDelay,
            volume
          );
        });
      });
      
    } catch (error) {
      console.error("Error playing chord:", error);
    }
  };
  
  return { playChord, initAudioContext };
};
