import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Plus, Download, Mic, Music, Stop, Repeat } from "lucide-react";
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
];

// Define only functional instruments
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
  const [volume, setVolume] = useState<number>(80);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingAvailable, setRecordingAvailable] = useState(false);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<HTMLAudioElement | null>(null);

  // Audio context and timer references
  const audioContext = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const recordingUrlRef = useRef<string | null>(null);

  // Initialize audio context with user interaction
  const initAudioContext = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create audio destination for recording
      if (audioContext.current && !audioDestinationRef.current) {
        audioDestinationRef.current = audioContext.current.createMediaStreamDestination();
      }
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
      
      // Connect masterGain to recording destination if recording
      if (audioDestinationRef.current && isRecording) {
        masterGain.connect(audioDestinationRef.current);
      }
      
      // Get section-specific instruments
      const sectionInstruments = sections[sectionIndex]?.instruments || [];
      
      // For each instrument in the section, create tones
      sectionInstruments.forEach(instrumentId => {
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
      
      // Add drums if enabled and in section instruments
      if (sectionInstruments.includes('drums')) {
        playEnhancedDrumSound(context, masterGain, getStyleVariations(style));
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
      default:
