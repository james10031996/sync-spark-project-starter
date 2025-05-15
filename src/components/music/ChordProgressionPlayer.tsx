import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Music } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChordSection } from "@/components/music/ChordSection";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
const availableInstruments: Record<string, { name: string; type: string }> = {
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
  const [activeTab, setActiveTab] = useState("play");
  
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
      if (activeInstruments.drums && (instrumentsToUse.includes('drums') || !sections[sectionIndex]?.instruments)) {
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
      case "organ":
        return {
          ...baseSettings,
          waveform: style === "Rock" ? "square" : "sine",
          octave: 4,
          attack: 0.005 + Math.max(0, styleVariations.attackMod) * 0.2,
          release: 0.8 + Math.max(0, styleVariations.releaseMod) * 0.5,
          filterFreq: 7000 + styleVariations.filterFreqMod * 0.7,
          sustain: style === "Rock" ? 0.9 : 0.8
        };
      case "synth":
        return {
          ...baseSettings,
          waveform: style === "Rock" || style === "Funk" ? "sawtooth" : "triangle",
          octave: 4,
          attack: 0.05 + styleVariations.attackMod * 0.8,
          release: 0.7 + styleVariations.releaseMod * 0.6,
          filterFreq: 3000 + styleVariations.filterFreqMod * 1.5,
          vibratoRate: 5 + styleVariations.vibratoRateMod,
          vibratoDepth: 3 + styleVariations.vibratoDepthMod
        };
      case "guitar":
        return {
          ...baseSettings,
          waveform: style === "Rock" ? "sawtooth" : "triangle",
          octave: 3,
          attack: 0.03 + styleVariations.attackMod * 0.5,
          release: 0.8 + styleVariations.releaseMod * 0.3,
          filterFreq: 4500 + styleVariations.filterFreqMod * 0.8
        };
      case "acousticGuitar":
        return {
          ...baseSettings,
          waveform: "triangle",
          octave: 3,
          attack: 0.04 + styleVariations.attackMod * 0.3,
          release: 0.9 + styleVariations.releaseMod * 0.5,
          filterFreq: 5000 + styleVariations.filterFreqMod * 0.4
        };
      case "electricGuitar":
        return {
          ...baseSettings, 
          waveform: "sawtooth",
          octave: 3,
          attack: 0.02 + Math.min(0, styleVariations.attackMod) * 0.5,
          release: 0.7 + styleVariations.releaseMod * 0.4,
          filterFreq: 3500 + styleVariations.filterFreqMod * 0.9
        };
      case "bass":
        return {
          ...baseSettings,
          waveform: style === "Rock" || style === "Funk" ? "sawtooth" : "triangle",
          octave: 2,
          attack: 0.06 + styleVariations.attackMod * 0.4,
          release: 1.0 + styleVariations.releaseMod * 0.3,
          filterFreq: 2000 + styleVariations.filterFreqMod * 0.3
        };
      case "acousticBass":
        return {
          ...baseSettings,
          waveform: "triangle",
          octave: 2,
          attack: 0.08 + styleVariations.attackMod * 0.3,
          release: 1.2 + styleVariations.releaseMod * 0.5,
          filterFreq: 2200 + styleVariations.filterFreqMod * 0.2
        };
      case "electricBass":
        return {
          ...baseSettings,
          waveform: style === "Funk" ? "sawtooth" : "triangle",
          octave: 2,
          attack: 0.04 + styleVariations.attackMod * 0.2,
          release: 0.8 + styleVariations.releaseMod * 0.4,
          filterFreq: 1500 + styleVariations.filterFreqMod * 0.4
        };
      case "strings":
        return {
          ...baseSettings,
          waveform: "sine",
          octave: 4,
          attack: 0.2 + styleVariations.attackMod * 0.8,
          release: 2.0 + styleVariations.releaseMod * 1.0,
          vibratoRate: 6 + styleVariations.vibratoRateMod,
          vibratoDepth: 5 + styleVariations.vibratoDepthMod,
          filterFreq: 4000 + styleVariations.filterFreqMod * 0.5
        };
      case "brass":
        return {
          ...baseSettings,
          waveform: style === "Jazz" || style === "Funk" ? "sawtooth" : "square",
          octave: 4,
          attack: 0.1 + styleVariations.attackMod * 0.6,
          release: 0.5 + styleVariations.releaseMod * 0.7,
          filterFreq: 3000 + styleVariations.filterFreqMod * 0.8,
          vibratoRate: 4 + styleVariations.vibratoRateMod * 0.8,
          vibratoDepth: 2 + styleVariations.vibratoDepthMod * 0.7
        };
      case "saxophone":
        return {
          ...baseSettings,
          waveform: "sawtooth",
          octave: 4,
          attack: 0.15 + styleVariations.attackMod * 0.5,
          release: 0.6 + styleVariations.releaseMod * 0.8,
          vibratoRate: 5 + styleVariations.vibratoRateMod * 1.2,
          vibratoDepth: 7 + styleVariations.vibratoDepthMod * 1.5,
          filterFreq: 3500 + styleVariations.filterFreqMod * 0.6
        };
      case "flute":
        return {
          ...baseSettings,
          waveform: "sine",
          octave: 5,
          attack: 0.1 + styleVariations.attackMod * 0.4,
          release: 0.4 + styleVariations.releaseMod * 0.6,
          filterFreq: 6000 + styleVariations.filterFreqMod * 0.4,
          vibratoRate: 6 + styleVariations.vibratoRateMod * 0.9,
          vibratoDepth: 4 + styleVariations.vibratoDepthMod
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
  
  // Create distortion effect
  const createDistortion = (context: AudioContext, amount: number) => {
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
  const createChorus = (context: AudioContext, frequency: number, amount: number) => {
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
  
  // Enhanced drum sounds based on style
  const playEnhancedDrumSound = (context: AudioContext, masterGain: GainNode, styleVariations: any = {}) => {
    // Time offset for creating rhythmic patterns
    const now = context.currentTime;
    const kickVolume = 0.8 * (volume / 100);
    const snareVolume = 0.6 * (volume / 100);
    const hihatVolume = 0.4 * (volume / 100);
    
    // Improved kick drum
    const kickOsc = context.createOscillator();
    const kickGain = context.createGain();
    
    // Style-specific kick drum
    if (style === "Rock") {
      kickOsc.frequency.value = 80;
      kickOsc.type = "square";
    } else if (style === "Jazz") {
      kickOsc.frequency.value = 110;
      kickOsc.type = "sine";
    } else {
      kickOsc.frequency.value = 100;
      kickOsc.type = "triangle";
    }
    
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
          playSnare(context, masterGain, snareVolume * 1.2, false, style);
        }, 250);
        break;
      case "Funk":
        // Syncopated hi-hat pattern
        setTimeout(() => {
          playHiHat(context, masterGain, hihatVolume * 0.7, false, style);
        }, 100);
        setTimeout(() => {
          playHiHat(context, masterGain, hihatVolume, false, style);
        }, 200);
        setTimeout(() => {
          playSnare(context, masterGain, snareVolume, false, style);
        }, 250);
        setTimeout(() => {
          playHiHat(context, masterGain, hihatVolume * 0.7, false, style);
        }, 350);
        break;
      case "Jazz":
        // Brushed snare and light hi-hat
        setTimeout(() => {
          playHiHat(context, masterGain, hihatVolume * 0.5, false, style);
        }, 125);
        setTimeout(() => {
          playSnare(context, masterGain, snareVolume * 0.7, true, style);
        }, 250);
        setTimeout(() => {
          playHiHat(context, masterGain, hihatVolume * 0.4, false, style);
        }, 375);
        break;
      case "Latin":
        // Percussion heavy
        setTimeout(() => {
          playConga(context, masterGain, 0.4 * (volume / 100), style);
        }, 150);
        setTimeout(() => {
          playHiHat(context, masterGain, hihatVolume * 0.6, false, style);
        }, 250);
        setTimeout(() => {
          playConga(context, masterGain, 0.3 * (volume / 100), style);
        }, 350);
        break;
      case "Blues":
        // Shuffle feel
        setTimeout(() => {
          playHiHat(context, masterGain, hihatVolume * 0.6, false, style);
        }, 150);
        setTimeout(() => {
          playSnare(context, masterGain, snareVolume * 0.8, false, style);
        }, 250);
        break;
      case "Soul":
        // Soul backbeat
        setTimeout(() => {
          playHiHat(context, masterGain, hihatVolume * 0.5, false, style);
        }, 125);
        setTimeout(() => {
          playSnare(context, masterGain, snareVolume * 1.1, false, style);
        }, 250);
        setTimeout(() => {
          playHiHat(context, masterGain, hihatVolume * 0.5, false, style);
        }, 375);
        break;
      default:
        // Standard beat for other styles
        setTimeout(() => {
          playHiHat(context, masterGain, hihatVolume, false, style);
        }, 200);
        if (Math.random() > 0.3) {
          setTimeout(() => {
            playSnare(context, masterGain, snareVolume, false, style);
          }, 250);
        }
    }
  };
  
  // Helper function to create snare drum sound
  const playSnare = (context: AudioContext, masterGain: GainNode, volume: number = 0.6, brushed: boolean = false, style: string) => {
    const bufferSize = context.sampleRate * 0.1;
    const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Create noise sample
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    // Snare body - adjust based on style
    const snareOsc = context.createOscillator();
    const snareGain = context.createGain();
    const snareFilter = context.createBiquadFilter();
    
    // Style-specific snare tuning
    if (style === "Rock") {
      snareOsc.frequency.value = 200;
      snareFilter.frequency.value = brushed ? 3500 : 2500;
    } else if (style === "Jazz") {
      snareOsc.frequency.value = 150;
      snareFilter.frequency.value = brushed ? 4000 : 3000;
    } else if (style === "Funk") {
      snareOsc.frequency.value = 180;
      snareFilter.frequency.value = 3200;
    } else if (style === "Blues") {
      snareOsc.frequency.value = 160;
      snareFilter.frequency.value = brushed ? 2800 : 2200;
    } else {
      snareOsc.frequency.value = 180;
      snareFilter.frequency.value = brushed ? 3000 : 2000;
    }
    
    snareOsc.type = "triangle";
    snareFilter.type = "bandpass";
    
    // Style-specific envelope
    const decayTime = style === "Rock" ? 0.15 : (brushed ? 0.3 : 0.2);
    
    snareGain.gain.setValueAtTime(volume * 0.5, context.currentTime);
    snareGain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + decayTime);
    
    snareOsc.connect(snareFilter);
    snareFilter.connect(snareGain);
    snareGain.connect(masterGain);
    
    snareOsc.start(context.currentTime);
    snareOsc.stop(context.currentTime + decayTime);
    
    // Snare noise
    const snareNoise = context.createBufferSource();
    snareNoise.buffer = noiseBuffer;
    
    const snareNoiseGain = context.createGain();
    const snareNoiseFilter = context.createBiquadFilter();
    
    // Style-specific noise filter
    snareNoiseFilter.type = "highpass";
    if (style === "Rock") {
      snareNoiseFilter.frequency.value = brushed ? 1800 : 1300;
    } else if (style === "Jazz") {
      snareNoiseFilter.frequency.value = brushed ? 2000 : 1600;
    } else {
      snareNoiseFilter.frequency.value = brushed ? 1500 : 1000;
    }
    
    snareNoiseGain.gain.setValueAtTime(volume, context.currentTime);
    snareNoiseGain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + decayTime);
    
    snareNoise.connect(snareNoiseFilter);
    snareNoiseFilter.connect(snareNoiseGain);
    snareNoiseGain.connect(masterGain);
    
    snareNoise.start(context.currentTime);
    snareNoise.stop(context.currentTime + decayTime);
  };
  
  // Helper function to create hi-hat sound
  const playHiHat = (context: AudioContext, masterGain: GainNode, volume: number = 0.4, open: boolean = false, style: string) => {
    const bufferSize = context.sampleRate * (open ? 0.2 : 0.1);
    const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Create noise sample
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const hatNode = context.createBufferSource();
    hatNode.buffer = noiseBuffer;
    
    const hatGain = context.createGain();
    const hatFilter = context.createBiquadFilter();
    
    // Style-specific hi-hat tuning
    hatFilter.type = "highpass";
    if (style === "Rock") {
      hatFilter.frequency.value = 9000;
      hatFilter.Q.value = 1.5;
    } else if (style === "Jazz") {
      hatFilter.frequency.value = 7000;
      hatFilter.Q.value = 0.8;
    } else if (style === "Funk") {
      hatFilter.frequency.value = 8500;
      hatFilter.Q.value = 2;
    } else {
      hatFilter.frequency.value = 8000;
      hatFilter.Q.value = 1;
    }
    
    // Style-specific envelope
    const decayTime = style === "Jazz" ? (open ? 0.5 : 0.12) : (open ? 0.4 : 0.08);
    
    hatGain.gain.setValueAtTime(volume, context.currentTime);
    hatGain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + decayTime);
    
    hatNode.connect(hatFilter);
    hatFilter.connect(hatGain);
    hatGain.connect(masterGain);
    
    hatNode.start(context.currentTime);
  };
  
  // Helper function to create conga sound
  const playConga = (context: AudioContext, masterGain: GainNode, volume: number = 0.5, style: string) => {
    const congaOsc = context.createOscillator();
    const congaGain = context.createGain();
    
    // Style-specific conga tuning
    if (style === "Latin") {
      congaOsc.frequency.value = 240;
    } else {
      congaOsc.frequency.value = 220;
    }
    
    congaOsc.type = "sine";
    
    // Style-specific envelope
    const decayTime = style === "Latin" ? 0.3 : 0.2;
    
    congaGain.gain.setValueAtTime(volume, context.currentTime);
    congaGain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + decayTime);
    
    congaOsc.connect(congaGain);
    congaGain.connect(masterGain);
    
    congaOsc.start(context.currentTime);
    congaOsc.stop(context.currentTime + decayTime);
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

  // Generate chord progression based on selected style
  const generateChords = () => {
    // Get a progression based on the selected style
    let progression;
    let instruments: string[] = ["piano", "guitar", "bass"];
    
    switch(style) {
      case "Pop":
        progression = commonProgressions['Pop I-V-vi-IV'];
        instruments = ["piano", "guitar", "bass"];
        break;
      case "Jazz":
        progression = commonProgressions['Jazz ii-V-I'];
        instruments = ["piano", "bass", "saxophone"];
        break;
      case "50s":
        progression = commonProgressions['50s I-vi-IV-V'];
        instruments = ["piano", "guitar", "bass"];
        break;
      case "Blues":
        progression = commonProgressions['Blues I-IV-V'];
        instruments = ["guitar", "bass", "drums"];
        break;
      case "Funk":
        progression = commonProgressions['Funk I-IV-V'];
        instruments = ["guitar", "bass", "drums", "organ"];
        break;
      case "Rock":
        progression = commonProgressions['Rock I-V-VI-IV'];
        instruments = ["guitar", "bass", "drums"];
        break;
      case "Latin":
        progression = commonProgressions['Latin i-bVII-bVI-V'];
        instruments = ["guitar", "bass", "drums"];
        break;
      case "Soul":
        progression = commonProgressions['Soul ii-V-I'];
        instruments = ["piano", "bass", "strings", "drums"];
        break;
      default:
        progression = commonProgressions['Pop I-V-vi-IV'];
        instruments = ["piano", "guitar", "bass"];
    }
    
    // Replace current sections with the generated progression
    setSections([
      {
        id: "section-1",
        chords: progression,
        instruments: instruments
      }
    ]);
    
    toast({
      title: `${style} progression generated`,
      description: "A new chord progression has been created with style-specific instruments.",
    });
  };

  // Toggle instrument on/off
  const toggleInstrument = (instrument: string) => {
    setActiveInstruments(prev => ({
      ...prev,
      [instrument]: !prev[instrument]
    }));
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

        <Button variant="outline" onClick={generateChords} className="transition-all hover:bg-primary/10">
          Generate chords
        </Button>
        
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            <Slider
              min={0}
              max={100}
              step={1}
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              className="w-24 transition-all hover:scale-[1.01]"
            />
          </div>
        </div>
      </div>

      {/* Main content with tabs */}
      <Card className="p-4 mb-6">
        <Tabs defaultValue="play" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="play">Play</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="howto">How to Play</TabsTrigger>
            <TabsTrigger value="tutorial">Tutorial</TabsTrigger>
          </TabsList>

          <TabsContent value="play" className="space-y-4">
            {/* Chords display */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sections[0].chords.map((chord, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-md border text-center transition-all ${
                    playing && currentSection === 0 && currentChord === index 
                      ? 'bg-primary/20 border-primary scale-105' 
                      : 'bg-card border-border'
                  }`}
                  onClick={() => playChord(chord, 0)}
                >
                  <div className="text-lg font-semibold">
                    {chord.root}{chordTypes.find(ct => ct.id === chord.type)?.symbol || ''}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {chordTypes.find(ct => ct.id === chord.type)?.name || ''}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Instruments */}
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Active Instruments</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2">
                {Object.entries(activeInstruments)
                  .filter(([id, active]) => sections[0].instruments?.includes(id) || active)
                  .map(([id, active]) => (
                    <div key={id} className="flex items-center justify-between">
                      <Label htmlFor={`${id}-toggle`} className="text-sm font-medium cursor-pointer">{availableInstruments[id]?.name}</Label>
                      <Switch 
                        id={`${id}-toggle`} 
                        checked={active} 
                        onCheckedChange={() => toggleInstrument(id)} 
                        className="transition-all data-[state=checked]:bg-primary"
                      />
                    </div>
                  ))
                }
              </div>
            </div>
          </TabsContent>

          <TabsContent value="about">
            <div className="prose dark:prose-invert">
              <h3>About Chord Progression Player</h3>
              <p>
                The Chord Progression Player is a tool designed to help musicians, songwriters, and music enthusiasts experiment with different chord progressions and musical styles.
              </p>
              <p>
                This interactive tool allows you to:
              </p>
              <ul className="pl-6 list-disc space-y-1">
                <li>Play common chord progressions across various musical genres</li>
                <li>Choose from different musical styles such as Pop, Jazz, Rock, Blues, and more</li>
                <li>Customize the instrumentation to hear how progressions sound with different instruments</li>
                <li>Adjust the tempo (BPM) to match your preferred playing speed</li>
                <li>Generate style-specific chord progressions with appropriate instrumentation</li>
              </ul>
              <p>
                Whether you're looking for inspiration for your next song, learning about music theory, or just having fun exploring different sounds, the Chord Progression Player provides an intuitive interface to experiment with harmonic ideas.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="howto">
            <div className="prose dark:prose-invert">
              <h3>How to Play</h3>
              
              <div className="mb-4">
                <h4>Getting Started</h4>
                <ol className="pl-6 list-decimal space-y-1">
                  <li>Choose a musical style using the Style dropdown</li>
                  <li>Click "Generate chords" to create a progression suited to that style</li>
                  <li>Press the Play button to hear your progression</li>
                  <li>Adjust the BPM slider to speed up or slow down the playback</li>
                </ol>
              </div>
              
              <div className="mb-4">
                <h4>Customizing Your Sound</h4>
                <ul className="pl-6 list-disc space-y-1">
                  <li>Toggle instruments on or off using the switches in the Active Instruments section</li>
                  <li>Click on any chord box to hear that individual chord</li>
                  <li>Adjust the volume using the slider in the top controls</li>
                </ul>
              </div>
              
              <div>
                <h4>Tips for Better Results</h4>
                <ul className="pl-6 list-disc space-y-1">
                  <li>Different styles use different instrumental combinations - experiment with them</li>
                  <li>Jazz progressions tend to use more complex chord types (7th, maj7, min7)</li>
                  <li>Rock and Pop styles often work well with simpler major and minor chords</li>
                  <li>Try the same progression at different tempos to change the feel</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tutorial">
            <div className="prose dark:prose-invert">
              <h3>Chord Progression Tutorial</h3>
              
              <div className="mb-4">
                <h4>Basics of Chord Progressions</h4>
                <p>
                  A chord progression is a sequence of chords played in a specific order. In Western music, chord progressions provide the harmonic foundation for melodies and are often what gives a song its distinctive feel.
                </p>
              </div>
              
              <div className="mb-4">
                <h4>Common Progressions</h4>
                <ul className="pl-6 space-y-2">
                  <li>
                    <strong>I-IV-V (1-4-5):</strong> The foundation of blues and rock music. In C major, this would be C-F-G.
                  </li>
                  <li>
                    <strong>I-V-vi-IV (1-5-6-4):</strong> Extremely common in pop music. In C major: C-G-Am-F.
                  </li>
                  <li>
                    <strong>ii-V-I (2-5-1):</strong> The backbone of jazz. In C major: Dm7-G7-Cmaj7.
                  </li>
                  <li>
                    <strong>I-vi-IV-V (1-6-4-5):</strong> Classic 50s progression. In C major: C-Am-F-G.
                  </li>
                </ul>
              </div>
              
              <div className="mb-4">
                <h4>Understanding Roman Numerals</h4>
                <p>
                  In music theory, Roman numerals indicate the position of a chord within a scale:
                </p>
                <ul className="pl-6 list-disc space-y-1">
                  <li>Uppercase (I, IV, V) represents major chords</li>
                  <li>Lowercase (ii, iii, vi) represents minor chords</li>
                  <li>Numbers relate to the scale degree (I = 1st note of scale, etc.)</li>
                </ul>
              </div>
              
              <div>
                <h4>Experiment with the Player</h4>
                <p>
                  Use this chord progression player to experiment with different progressions across musical styles. Listen to how changing instruments or tempo affects the feel of the same chord sequence. Try generating progressions in different styles to hear how they differ harmonically.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ChordProgressionPlayer;
