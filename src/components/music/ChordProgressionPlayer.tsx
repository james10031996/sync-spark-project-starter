
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Plus, Trash, Music } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChordSection } from "@/components/music/ChordSection";
import { toast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";

// Define chord types for the progression player
const chordTypes = [
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
const rootNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Common chord progressions for auto-generation
const commonProgressions = {
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
  '50s I-vi-IV-V': [
    { root: 'C', type: 'major' },
    { root: 'A', type: 'minor' },
    { root: 'F', type: 'major' },
    { root: 'G', type: 'major' },
  ],
  'Blues I-IV-V': [
    { root: 'C', type: '7' },
    { root: 'F', type: '7' },
    { root: 'G', type: '7' },
    { root: 'C', type: '7' },
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

// Define all available instruments
const availableInstruments = {
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

// Define a chord in the progression
export interface ChordInProgression {
  root: string;
  type: string;
  instruments?: string[]; // Array of instrument IDs to play this chord with
}

// Define a section of chords
export interface ChordSectionData {
  id: string;
  chords: ChordInProgression[];
  instruments?: string[]; // Section-level instruments
}

interface ChordProgressionPlayerProps {
  className?: string;
}

/**
 * A component for playing chord progressions with multiple sections
 */
const ChordProgressionPlayer: React.FC<ChordProgressionPlayerProps> = ({
  className = "",
}) => {
  // Main state
  const [sections, setSections] = useState<ChordSectionData[]>([
    {
      id: "section-1",
      chords: [
        { root: "C", type: "major" },
        { root: "G", type: "7" },
        { root: "A", type: "minor" },
        { root: "F", type: "major" },
      ],
      instruments: ["piano", "guitar", "bass"],
    },
  ]);
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState<number>(100);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [currentChord, setCurrentChord] = useState<number>(0);
  const [style, setStyle] = useState<string>("Pop");
  const [activeInstruments, setActiveInstruments] = useState<Record<string, boolean>>({
    piano: true,
    acousticPiano: false,
    electricPiano: false,
    organ: false,
    synth: false,
    guitar: true,
    acousticGuitar: false,
    electricGuitar: false,
    bass: true,
    acousticBass: false,
    electricBass: false,
    drums: false,
    strings: false,
    brass: false,
    saxophone: false,
    flute: false
  });
  const [volume, setVolume] = useState<number>(80);

  // Audio context and timer references
  const audioContext = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Initialize audio context with user interaction
  const initAudioContext = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext.current;
  };

  // Enhanced playChord function with improved sound quality and style variations
  const playChord = (chord: ChordInProgression, sectionIndex: number = 0) => {
    try {
      const context = initAudioContext();
      const masterGain = context.createGain();
      masterGain.gain.value = volume / 100;
      masterGain.connect(context.destination);
      
      // Determine which instruments to use (chord-specific, section-specific, or global)
      const instrumentsToUse = chord.instruments || 
                               sections[sectionIndex]?.instruments || 
                               Object.keys(activeInstruments).filter(inst => activeInstruments[inst]);
      
      // Define frequencies for notes in the chord
      const rootIndex = rootNotes.indexOf(chord.root);
      const chord_type = chordTypes.find((ct) => ct.id === chord.type);
      
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
      
      // Apply style-specific variations
      const styleVariations = getStyleVariations(style);
      
      // Create tones for each instrument
      instrumentsToUse.forEach(instrumentId => {
        if (!activeInstruments[instrumentId]) return;
        
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
      
      // Add drums if enabled
      if (activeInstruments.drums) {
        playEnhancedDrumSound(context, masterGain, styleVariations);
      }
      
    } catch (error) {
      console.error("Error playing chord:", error);
    }
  };
  
  // Get style-specific variations to affect the sound
  const getStyleVariations = (style: string) => {
    const baseVariations = {
      noteDelayMod: 0,
      attackMod: 0,
      releaseMod: 0,
      filterFreqMod: 0,
      vibratoDepthMod: 0,
      vibratoRateMod: 0,
      detuneAmount: 0,
      reverbLevel: 0.1
    };
    
    switch(style) {
      case "Pop":
        return {
          ...baseVariations,
          noteDelayMod: 0.01,
          attackMod: 0.02,
          filterFreqMod: 500,
          detuneAmount: 3
        };
      case "Jazz":
        return {
          ...baseVariations,
          noteDelayMod: 0.04,
          attackMod: 0.05,
          releaseMod: 0.3,
          vibratoDepthMod: 5,
          vibratoRateMod: 2,
          reverbLevel: 0.2
        };
      case "Rock":
        return {
          ...baseVariations,
          attackMod: -0.01,
          detuneAmount: 6,
          filterFreqMod: -500
        };
      case "Blues":
        return {
          ...baseVariations,
          noteDelayMod: 0.05,
          vibratoDepthMod: 7,
          vibratoRateMod: 1,
          detuneAmount: 4
        };
      case "Funk":
        return {
          ...baseVariations,
          noteDelayMod: -0.01,
          attackMod: -0.02,
          filterFreqMod: 800
        };
      case "Latin":
        return {
          ...baseVariations,
          noteDelayMod: 0.02,
          vibratoDepthMod: 4,
          detuneAmount: 2
        };
      case "Soul":
        return {
          ...baseVariations,
          noteDelayMod: 0.03,
          attackMod: 0.04,
          vibratoDepthMod: 6,
          reverbLevel: 0.25
        };
      default:
        return baseVariations;
    }
  };
  
  // Get instrument-specific settings
  const getInstrumentSettings = (instrumentId: string, style: string) => {
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
    
    // Customize based on instrument
    switch(instrumentId) {
      case "piano":
        return {
          ...baseSettings,
          waveform: "triangle",
          octave: 4,
          attack: 0.01,
          release: 1.2
        };
      case "acousticPiano":
        return {
          ...baseSettings,
          waveform: "triangle",
          octave: 4,
          attack: 0.02,
          release: 1.5,
          filterFreq: 6000
        };
      case "electricPiano":
        return {
          ...baseSettings,
          waveform: "sine",
          octave: 4,
          attack: 0.01,
          release: 1.0,
          filterFreq: 4000
        };
      case "organ":
        return {
          ...baseSettings,
          waveform: "sine",
          octave: 4,
          attack: 0.005,
          release: 0.8,
          filterFreq: 7000
        };
      case "synth":
        return {
          ...baseSettings,
          waveform: "sawtooth",
          octave: 4,
          attack: 0.05,
          release: 0.7,
          filterFreq: 3000
        };
      case "guitar":
        return {
          ...baseSettings,
          waveform: "triangle",
          octave: 3,
          attack: 0.03,
          release: 0.8,
          filterFreq: 4500
        };
      case "acousticGuitar":
        return {
          ...baseSettings,
          waveform: "triangle",
          octave: 3,
          attack: 0.04,
          release: 0.9
        };
      case "electricGuitar":
        return {
          ...baseSettings, 
          waveform: "sawtooth",
          octave: 3,
          attack: 0.02,
          release: 0.7,
          filterFreq: 3500
        };
      case "bass":
        return {
          ...baseSettings,
          waveform: "triangle",
          octave: 2,
          attack: 0.06,
          release: 1.0,
          filterFreq: 2000
        };
      case "acousticBass":
        return {
          ...baseSettings,
          waveform: "triangle",
          octave: 2,
          attack: 0.08,
          release: 1.2
        };
      case "electricBass":
        return {
          ...baseSettings,
          waveform: "sawtooth",
          octave: 2,
          attack: 0.04,
          release: 0.8,
          filterFreq: 1500
        };
      case "strings":
        return {
          ...baseSettings,
          waveform: "sine",
          octave: 4,
          attack: 0.2,
          release: 2.0,
          vibratoRate: 6,
          vibratoDepth: 5
        };
      case "brass":
        return {
          ...baseSettings,
          waveform: "sawtooth",
          octave: 4,
          attack: 0.1,
          release: 0.5,
          filterFreq: 3000
        };
      case "saxophone":
        return {
          ...baseSettings,
          waveform: "sawtooth",
          octave: 4,
          attack: 0.15,
          release: 0.6,
          vibratoRate: 5,
          vibratoDepth: 7
        };
      case "flute":
        return {
          ...baseSettings,
          waveform: "sine",
          octave: 5,
          attack: 0.1,
          release: 0.4,
          filterFreq: 6000
        };
      default:
        return baseSettings;
    }
  };
  
  // Create instrument-specific tones with advanced sound design
  const createInstrumentTone = (
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
    filter.frequency.value = settings.filterFreq + styleVariations.filterFreqMod;
    filter.Q.value = settings.filterQ;
    
    // Set oscillator properties
    osc.type = settings.waveform;
    osc.frequency.value = frequency;
    osc.detune.value = Math.random() * styleVariations.detuneAmount * 2 - styleVariations.detuneAmount;
    
    // Apply ADSR envelope
    const now = context.currentTime;
    const attackTime = Math.max(0.001, settings.attack + styleVariations.attackMod);
    const releaseTime = Math.max(0.001, settings.release + styleVariations.releaseMod);
    
    gain.gain.setValueAtTime(0, now + delay);
    gain.gain.linearRampToValueAtTime(settings.sustain, now + delay + attackTime);
    gain.gain.setValueAtTime(settings.sustain * 0.8, now + delay + settings.decay);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + releaseTime);
    
    // Connect nodes
    osc.connect(filter);
    filter.connect(gain);
    
    // Add reverb for certain instruments
    if (["piano", "strings", "acousticPiano", "electricPiano", "flute"].includes(instrumentId)) {
      const convolver = context.createConvolver();
      // In a real implementation, we would load an impulse response
      // For now we'll use a simple reverb approximation
      const reverbGain = context.createGain();
      reverbGain.gain.value = styleVariations.reverbLevel;
      gain.connect(reverbGain);
      reverbGain.connect(masterGain);
    }
    
    gain.connect(masterGain);
    
    // Start and stop oscillator
    osc.start(now + delay);
    osc.stop(now + delay + releaseTime + 0.1);
    
    // Add vibrato for expressive instruments
    if (["strings", "brass", "saxophone", "flute"].includes(instrumentId)) {
      const lfo = context.createOscillator();
      const lfoGain = context.createGain();
      
      lfo.type = "sine";
      lfo.frequency.value = settings.vibratoRate + styleVariations.vibratoRateMod;
      
      lfoGain.gain.value = settings.vibratoDepth + styleVariations.vibratoDepthMod;
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      lfo.start(now + delay + 0.1);
      lfo.stop(now + delay + releaseTime);
    }
    
    return { osc, gain }; // Return for potential cleanup
  };
  
  // Enhanced drum sounds based on style
  const playEnhancedDrumSound = (context: AudioContext, masterGain: GainNode, styleVariations: any = {}) => {
    // Time offset for creating rhythmic patterns
    const now = context.currentTime;
    const kickVolume = 0.8;
    const snareVolume = 0.6;
    const hihatVolume = 0.4;
    
    // Improved kick drum
    const kickOsc = context.createOscillator();
    const kickGain = context.createGain();
    
    kickOsc.frequency.value = 150;
    kickOsc.frequency.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    kickGain.gain.setValueAtTime(kickVolume, now);
    kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    kickOsc.connect(kickGain);
    kickGain.connect(masterGain);
    
    kickOsc.start(now);
    kickOsc.stop(now + 0.4);
    
    // Style-specific drum patterns
    switch(style) {
      case "Rock":
        // Heavy kick and snare
        setTimeout(() => {
          playSnare(context, masterGain, snareVolume * 1.2);
        }, 250);
        break;
      case "Funk":
        // Syncopated hi-hat pattern
        setTimeout(() => {
          playHiHat(context, masterGain, hihatVolume * 0.7);
        }, 100);
        setTimeout(() => {
          playHiHat(context, masterGain, hihatVolume);
        }, 200);
        setTimeout(() => {
          playSnare(context, masterGain, snareVolume);
        }, 250);
        setTimeout(() => {
          playHiHat(context, masterGain, hihatVolume * 0.7);
        }, 350);
        break;
      case "Jazz":
        // Brushed snare and light hi-hat
        setTimeout(() => {
          playHiHat(context, masterGain, hihatVolume * 0.5);
        }, 125);
        setTimeout(() => {
          playSnare(context, masterGain, snareVolume * 0.7, true);
        }, 250);
        setTimeout(() => {
          playHiHat(context, masterGain, hihatVolume * 0.4);
        }, 375);
        break;
      case "Latin":
        // Percussion heavy
        setTimeout(() => {
          playConga(context, masterGain, 0.4);
        }, 150);
        setTimeout(() => {
          playHiHat(context, masterGain, hihatVolume * 0.6);
        }, 250);
        setTimeout(() => {
          playConga(context, masterGain, 0.3);
        }, 350);
        break;
      default:
        // Standard beat for other styles
        setTimeout(() => {
          playHiHat(context, masterGain, hihatVolume);
        }, 200);
        if (Math.random() > 0.5) {
          setTimeout(() => {
            playSnare(context, masterGain, snareVolume);
          }, 250);
        }
    }
  };
  
  // Helper function to create snare drum sound
  const playSnare = (context: AudioContext, masterGain: GainNode, volume: number = 0.6, brushed: boolean = false) => {
    const bufferSize = context.sampleRate * 0.1;
    const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    // Snare body
    const snareOsc = context.createOscillator();
    const snareGain = context.createGain();
    const snareFilter = context.createBiquadFilter();
    
    snareOsc.frequency.value = 180;
    snareOsc.type = "triangle";
    
    snareFilter.type = "bandpass";
    snareFilter.frequency.value = brushed ? 3000 : 2000;
    
    snareGain.gain.setValueAtTime(volume * 0.5, context.currentTime);
    snareGain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + (brushed ? 0.3 : 0.2));
    
    snareOsc.connect(snareFilter);
    snareFilter.connect(snareGain);
    snareGain.connect(masterGain);
    
    snareOsc.start(context.currentTime);
    snareOsc.stop(context.currentTime + (brushed ? 0.3 : 0.2));
    
    // Snare noise
    const snareNoise = context.createBufferSource();
    snareNoise.buffer = noiseBuffer;
    
    const snareNoiseGain = context.createGain();
    const snareNoiseFilter = context.createBiquadFilter();
    
    snareNoiseFilter.type = "highpass";
    snareNoiseFilter.frequency.value = brushed ? 1500 : 1000;
    
    snareNoiseGain.gain.setValueAtTime(volume, context.currentTime);
    snareNoiseGain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + (brushed ? 0.3 : 0.2));
    
    snareNoise.connect(snareNoiseFilter);
    snareNoiseFilter.connect(snareNoiseGain);
    snareNoiseGain.connect(masterGain);
    
    snareNoise.start(context.currentTime);
    snareNoise.stop(context.currentTime + (brushed ? 0.3 : 0.2));
  };
  
  // Helper function to create hi-hat sound
  const playHiHat = (context: AudioContext, masterGain: GainNode, volume: number = 0.4, open: boolean = false) => {
    const bufferSize = context.sampleRate * (open ? 0.2 : 0.1);
    const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const hatNode = context.createBufferSource();
    hatNode.buffer = noiseBuffer;
    
    const hatGain = context.createGain();
    const hatFilter = context.createBiquadFilter();
    
    hatFilter.type = "highpass";
    hatFilter.frequency.value = 8000;
    hatFilter.Q.value = 1;
    
    hatGain.gain.setValueAtTime(volume, context.currentTime);
    hatGain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + (open ? 0.4 : 0.08));
    
    hatNode.connect(hatFilter);
    hatFilter.connect(hatGain);
    hatGain.connect(masterGain);
    
    hatNode.start(context.currentTime);
  };
  
  // Helper function to create conga sound
  const playConga = (context: AudioContext, masterGain: GainNode, volume: number = 0.5) => {
    const congaOsc = context.createOscillator();
    const congaGain = context.createGain();
    
    congaOsc.frequency.value = 220;
    congaOsc.type = "sine";
    
    congaGain.gain.setValueAtTime(volume, context.currentTime);
    congaGain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
    
    congaOsc.connect(congaGain);
    congaGain.connect(masterGain);
    
    congaOsc.start(context.currentTime);
    congaOsc.stop(context.currentTime + 0.2);
  };

  // Start/stop playback
  const togglePlayback = () => {
    if (playing) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  // Start playing the chord progression
  const startPlayback = () => {
    initAudioContext();
    setPlaying(true);
    setCurrentSection(0);
    setCurrentChord(0);
    
    // Calculate interval between chord changes based on BPM
    const msPerBeat = 60000 / bpm;
    const msPerChord = msPerBeat * 4; // 4 beats per chord
    
    // Play the first chord immediately
    if (sections.length > 0 && sections[0].chords.length > 0) {
      playChord(sections[0].chords[0], 0);
    }
    
    // Set up interval to play subsequent chords
    intervalRef.current = window.setInterval(() => {
      setCurrentChord((prev) => {
        const nextChord = prev + 1;
        const currentSectionChords = sections[currentSection].chords.length;
        
        // If we've reached the end of the current section
        if (nextChord >= currentSectionChords) {
          setCurrentSection((prevSection) => {
            const nextSection = prevSection + 1;
            
            // If we've played through all sections, loop back to the first
            if (nextSection >= sections.length) {
              // Play first chord of first section
              if (sections.length > 0 && sections[0].chords.length > 0) {
                playChord(sections[0].chords[0], 0);
              }
              return 0;
            } else {
              // Play first chord of next section
              if (sections[nextSection].chords.length > 0) {
                playChord(sections[nextSection].chords[0], nextSection);
              }
              return nextSection;
            }
          });
          return 0;
        } else {
          // Play next chord in current section
          playChord(sections[currentSection].chords[nextChord], currentSection);
          return nextChord;
        }
      });
    }, msPerChord);
  };

  // Stop playback
  const stopPlayback = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPlaying(false);
  };

  // Update chord in a section
  const updateChord = (sectionIndex: number, chordIndex: number, newChord: ChordInProgression) => {
    setSections((prevSections) => {
      const updatedSections = [...prevSections];
      const updatedChords = [...updatedSections[sectionIndex].chords];
      updatedChords[chordIndex] = newChord;
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        chords: updatedChords,
      };
      return updatedSections;
    });
  };

  // Add a chord to a section
  const addChordToSection = (sectionIndex: number) => {
    // Get the last chord of the section to use as a template for the new one
    const section = sections[sectionIndex];
    const lastChord = section.chords[section.chords.length - 1];
    const newChord = { ...lastChord }; // Clone the last chord
    
    setSections((prevSections) => {
      const updatedSections = [...prevSections];
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        chords: [...updatedSections[sectionIndex].chords, newChord]
      };
      return updatedSections;
    });
    
    toast({
      title: "Chord added",
      description: "A new chord has been added to your section.",
    });
  };

  // Add a new section
  const addSection = () => {
    // Default to adding the same progression as the last section, or a basic progression if none exists
    const newSectionChords = sections.length > 0 
      ? [...sections[sections.length - 1].chords]
      : [
          { root: "C", type: "major" },
          { root: "G", type: "major" },
          { root: "A", type: "minor" },
          { root: "F", type: "major" },
        ];
    
    setSections((prevSections) => [
      ...prevSections,
      {
        id: `section-${prevSections.length + 1}`,
        chords: newSectionChords,
        instruments: prevSections.length > 0 ? [...(prevSections[prevSections.length - 1].instruments || [])] : undefined
      },
    ]);
    
    toast({
      title: "Section added",
      description: "A new chord section has been added to your progression.",
    });
  };

  // Remove a section
  const removeSection = (sectionIndex: number) => {
    // Don't remove if there's only one section left
    if (sections.length <= 1) {
      toast({
        title: "Cannot remove section",
        description: "You need at least one section in your progression.",
        variant: "destructive",
      });
      return;
    }
    
    setSections((prevSections) => 
      prevSections.filter((_, index) => index !== sectionIndex)
    );
    
    toast({
      description: "Section removed from your progression.",
    });
  };

  // Generate chord progression based on selected style
  const generateChords = () => {
    // Get a progression based on the selected style
    let progression;
    
    switch(style) {
      case "Pop":
        progression = commonProgressions['Pop I-V-vi-IV'];
        break;
      case "Jazz":
        progression = commonProgressions['Jazz ii-V-I'];
        break;
      case "50s":
        progression = commonProgressions['50s I-vi-IV-V'];
        break;
      case "Blues":
        progression = commonProgressions['Blues I-IV-V'];
        break;
      case "Funk":
        progression = commonProgressions['Funk I-IV-V'];
        break;
      case "Rock":
        progression = commonProgressions['Rock I-V-VI-IV'];
        break;
      case "Latin":
        progression = commonProgressions['Latin i-bVII-bVI-V'];
        break;
      case "Soul":
        progression = commonProgressions['Soul ii-V-I'];
        break;
      default:
        progression = commonProgressions['Pop I-V-vi-IV'];
    }
    
    // Replace current sections with the generated progression
    setSections([
      {
        id: "section-1",
        chords: progression,
      }
    ]);
    
    toast({
      title: `${style} progression generated`,
      description: "A new chord progression has been created.",
    });
  };

  // Toggle instrument on/off
  const toggleInstrument = (instrument: string) => {
    setActiveInstruments(prev => ({
      ...prev,
      [instrument]: !prev[instrument]
    }));
  };

  // Update instrument for a specific section
  const updateSectionInstruments = (sectionIndex: number, instruments: string[]) => {
    setSections(prev => {
      const newSections = [...prev];
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        instruments
      };
      return newSections;
    });
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  // Update interval if BPM changes during playback
  useEffect(() => {
    if (playing) {
      stopPlayback();
      startPlayback();
    }
  }, [bpm]);

  return (
    <div className={`w-full max-w-4xl mx-auto ${className} animate-fade-in`}>
      {/* Main controls with smooth animation */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button 
          variant={playing ? "destructive" : "default"}
          onClick={togglePlayback}
          className="w-24 transition-all duration-300 hover:scale-105"
        >
          <Play className={`mr-1 h-4 w-4 ${playing ? 'animate-pulse' : ''}`} />
          {playing ? "Stop" : "Play"}
        </Button>

        <div className="flex items-center border rounded-md px-3 py-1">
          <Input
            type="number"
            min={40}
            max={240}
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value) || 100)}
            className="w-16 border-none text-center"
          />
          <span className="text-sm ml-1">BPM</span>
        </div>

        <Select value={style} onValueChange={setStyle}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pop">Pop</SelectItem>
            <SelectItem value="Jazz">Jazz</SelectItem>
            <SelectItem value="50s">50s</SelectItem>
            <SelectItem value="Blues">Blues</SelectItem>
            <SelectItem value="Funk">Funk</SelectItem>
            <SelectItem value="Rock">Rock</SelectItem>
            <SelectItem value="Latin">Latin</SelectItem>
            <SelectItem value="Soul">Soul</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={generateChords}>
          Generate chords
        </Button>

        {/* Volume slider */}
        <div className="flex items-center gap-2 ml-auto">
          <Music className="h-4 w-4" />
          <Slider
            defaultValue={[80]}
            max={100}
            step={1}
            value={[volume]}
            onValueChange={(value) => setVolume(value[0])}
            className="w-24"
          />
        </div>
      </div>

      {/* Instruments accordion */}
      <Accordion type="single" collapsible className="mb-6">
        <AccordionItem value="instruments" className="border rounded-md">
          <AccordionTrigger className="px-4 py-2">Instruments</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-2 px-4">
              <div className="space-y-6">
                <h4 className="font-medium">Keyboards</h4>
                <div className="space-y-3">
                  <InstrumentToggle 
                    id="piano" 
                    label="Piano" 
                    checked={activeInstruments.piano} 
                    onToggle={() => toggleInstrument("piano")} 
                  />
                  <InstrumentToggle 
                    id="acousticPiano" 
                    label="Acoustic Piano" 
                    checked={activeInstruments.acousticPiano} 
                    onToggle={() => toggleInstrument("acousticPiano")} 
                  />
                  <InstrumentToggle 
                    id="electricPiano" 
                    label="Electric Piano" 
                    checked={activeInstruments.electricPiano} 
                    onToggle={() => toggleInstrument("electricPiano")} 
                  />
                  <InstrumentToggle 
                    id="organ" 
                    label="Organ" 
                    checked={activeInstruments.organ} 
                    onToggle={() => toggleInstrument("organ")} 
                  />
                  <InstrumentToggle 
                    id="synth" 
                    label="Synth" 
                    checked={activeInstruments.synth} 
                    onToggle={() => toggleInstrument("synth")} 
                  />
                </div>
              </div>
              
              <div className="space-y-6">
                <h4 className="font-medium">Strings</h4>
                <div className="space-y-3">
                  <InstrumentToggle 
                    id="guitar" 
                    label="Guitar" 
                    checked={activeInstruments.guitar} 
                    onToggle={() => toggleInstrument("guitar")} 
                  />
                  <InstrumentToggle 
                    id="acousticGuitar" 
                    label="Acoustic Guitar" 
                    checked={activeInstruments.acousticGuitar} 
                    onToggle={() => toggleInstrument("acousticGuitar")} 
                  />
                  <InstrumentToggle 
                    id="electricGuitar" 
                    label="Electric Guitar" 
                    checked={activeInstruments.electricGuitar} 
                    onToggle={() => toggleInstrument("electricGuitar")} 
                  />
                  <InstrumentToggle 
                    id="bass" 
                    label="Bass" 
                    checked={activeInstruments.bass} 
                    onToggle={() => toggleInstrument("bass")} 
                  />
                  <InstrumentToggle 
                    id="acousticBass" 
                    label="Acoustic Bass" 
                    checked={activeInstruments.acousticBass} 
                    onToggle={() => toggleInstrument("acousticBass")} 
                  />
                  <InstrumentToggle 
                    id="electricBass" 
                    label="Electric Bass" 
                    checked={activeInstruments.electricBass} 
                    onToggle={() => toggleInstrument("electricBass")} 
                  />
                </div>
              </div>
              
              <div className="space-y-6">
                <h4 className="font-medium">Orchestral</h4>
                <div className="space-y-3">
                  <InstrumentToggle 
                    id="strings" 
                    label="Strings" 
                    checked={activeInstruments.strings} 
                    onToggle={() => toggleInstrument("strings")} 
                  />
                  <InstrumentToggle 
                    id="brass" 
                    label="Brass" 
                    checked={activeInstruments.brass} 
                    onToggle={() => toggleInstrument("brass")} 
                  />
                  <InstrumentToggle 
                    id="woodwinds" 
                    label="Woodwinds" 
                    checked={activeInstruments.saxophone || activeInstruments.flute} 
                    onToggle={() => {
                      toggleInstrument("saxophone");
                      toggleInstrument("flute");
                    }} 
                  />
                  <InstrumentToggle 
                    id="saxophone" 
                    label="Saxophone" 
                    checked={activeInstruments.saxophone} 
                    onToggle={() => toggleInstrument("saxophone")} 
                  />
                  <InstrumentToggle 
                    id="flute" 
                    label="Flute" 
                    checked={activeInstruments.flute} 
                    onToggle={() => toggleInstrument("flute")} 
                  />
                </div>
              </div>
              
              <div className="space-y-6">
                <h4 className="font-medium">Percussion</h4>
                <div className="space-y-3">
                  <InstrumentToggle 
                    id="drums" 
                    label="Drums" 
                    checked={activeInstruments.drums} 
                    onToggle={() => toggleInstrument("drums")} 
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Chord sections */}
      <div className="space-y-6">
        {sections.map((section, sectionIndex) => (
          <ChordSection 
            key={section.id}
            section={section}
            sectionIndex={sectionIndex}
            isPlaying={playing && currentSection === sectionIndex}
            currentChord={currentChord}
            updateChord={(chordIndex, newChord) => updateChord(sectionIndex, chordIndex, newChord)}
            playChord={(chord) => playChord(chord, sectionIndex)}
            onAddChord={() => addChordToSection(sectionIndex)}
            onRemoveSection={() => removeSection(sectionIndex)}
          />
        ))}
      </div>

      {/* Section controls */}
      <div className="flex gap-4 mt-6">
        <Button variant="ghost" onClick={addSection} className="ml-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add section
        </Button>
      </div>
    </div>
  );
};

interface InstrumentToggleProps {
  id: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
}

const InstrumentToggle: React.FC<InstrumentToggleProps> = ({ id, label, checked, onToggle }) => {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={`${id}-toggle`} className="text-sm font-medium cursor-pointer">{label}</Label>
      <Switch 
        id={`${id}-toggle`} 
        checked={checked} 
        onCheckedChange={onToggle} 
      />
    </div>
  );
};

export default ChordProgressionPlayer;
