import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Plus, Trash } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChordSection } from "@/components/music/ChordSection";
import { toast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  ]
};

// Instrument settings and types
type Instrument = "piano" | "guitar" | "bass" | "drums";
type InstrumentState = {
  [key in Instrument]: boolean;
};

// Define a chord in the progression
export interface ChordInProgression {
  root: string;
  type: string;
}

// Define a section of chords
export interface ChordSectionData {
  id: string;
  chords: ChordInProgression[];
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
    },
  ]);
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState<number>(100);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [currentChord, setCurrentChord] = useState<number>(0);
  const [style, setStyle] = useState<string>("Pop");
  const [instruments, setInstruments] = useState<InstrumentState>({
    piano: true,
    guitar: true,
    bass: true,
    drums: false,
  });

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

  // Enhanced playChord function with improved sound quality
  const playChord = (chord: ChordInProgression) => {
    try {
      const context = initAudioContext();
      
      // Define frequencies for notes in the chord
      const rootIndex = rootNotes.indexOf(chord.root);
      const chord_type = chordTypes.find((ct) => ct.id === chord.type);
      
      let intervals: number[] = [0, 4, 7]; // Default to major chord intervals
      
      // Set intervals based on chord type
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
      }
      
      // Enhanced tone creation for better sound quality
      intervals.forEach((interval, i) => {
        const noteIndex = (rootIndex + interval) % 12;
        const octaveOffset = Math.floor((rootIndex + interval) / 12);
        const note = rootNotes[noteIndex];
        
        // Calculate frequency using scientific pitch notation
        const a4Index = rootNotes.indexOf("A") + (4 * 12);
        const noteFullIndex = rootNotes.indexOf(note) + ((4 + octaveOffset) * 12);
        const frequency = 440 * Math.pow(2, (noteFullIndex - a4Index) / 12);
        
        // Create different tones for different instruments with improved quality
        if (instruments.piano) {
          // Piano with better harmonics
          createTone(context, frequency, "sine", 0.15, i * 0.02);
          createTone(context, frequency * 2, "sine", 0.05, i * 0.02); // Octave higher for richness
        }
        
        if (instruments.guitar) {
          // Guitar with string simulation
          createTone(context, frequency, "triangle", 0.1, i * 0.03, 0.1);
          createTone(context, frequency, "sawtooth", 0.05, i * 0.03 + 0.01, -3); // Add texture
        }
        
        if (instruments.bass && i === 0) {
          // Bass with deeper sound
          createTone(context, frequency / 2, "sine", 0.2, 0, 0);
          createTone(context, frequency / 4, "sine", 0.1, 0.05, 0); // Sub-bass
        }
      });
      
      // Enhanced drums if enabled
      if (instruments.drums) {
        playEnhancedDrumSound(context);
      }
    } catch (error) {
      console.error("Error playing chord:", error);
    }
  };
  
  // Enhanced tone creation function with better envelope
  const createTone = (
    context: AudioContext, 
    frequency: number, 
    type: OscillatorType = "sine", 
    volume: number = 0.1,
    delay: number = 0,
    detune: number = 0
  ) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    
    // Optional filter for more natural sound
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 5000;
    
    osc.type = type;
    osc.frequency.value = frequency;
    if (detune) osc.detune.value = detune;
    
    // Smoother ADSR envelope
    gain.gain.setValueAtTime(0, context.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, context.currentTime + delay + 0.03);
    gain.gain.setValueAtTime(volume * 0.8, context.currentTime + delay + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + delay + 1.8);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    
    osc.start(context.currentTime + delay);
    osc.stop(context.currentTime + delay + 2.0);
    
    // Add gentle vibrato for realism
    if (type === "triangle" || type === "sine") {
      const lfo = context.createOscillator();
      const lfoGain = context.createGain();
      
      lfo.type = "sine";
      lfo.frequency.value = 5 + Math.random() * 2; // Random slight variation
      
      lfoGain.gain.value = 3; // Vibrato depth
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.detune);
      
      lfo.start(context.currentTime + delay + 0.1);
      lfo.stop(context.currentTime + delay + 2.0);
    }
  };
  
  // Enhanced drum sounds
  const playEnhancedDrumSound = (context: AudioContext) => {
    // Improved kick drum
    const kickOsc = context.createOscillator();
    const kickGain = context.createGain();
    
    kickOsc.frequency.value = 150;
    kickOsc.frequency.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
    
    kickGain.gain.setValueAtTime(0.8, context.currentTime);
    kickGain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
    
    kickOsc.connect(kickGain);
    kickGain.connect(context.destination);
    
    kickOsc.start(context.currentTime);
    kickOsc.stop(context.currentTime + 0.4);
    
    // Better hi-hat with noise and filtering
    const bufferSize = context.sampleRate * 0.1;
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
    
    hatGain.gain.setValueAtTime(0.06, context.currentTime);
    hatGain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.08);
    
    hatNode.connect(hatFilter);
    hatFilter.connect(hatGain);
    hatGain.connect(context.destination);
    
    hatNode.start(context.currentTime);
    
    // Add snare hit on beats 2 and 4 for better rhythm
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const snareOsc = context.createOscillator();
        const snareGain = context.createGain();
        const snareFilter = context.createBiquadFilter();
        
        // Snare body
        snareOsc.frequency.value = 180;
        snareOsc.type = "triangle";
        
        snareFilter.type = "bandpass";
        snareFilter.frequency.value = 2000;
        
        snareGain.gain.setValueAtTime(0.1, context.currentTime);
        snareGain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
        
        snareOsc.connect(snareFilter);
        snareFilter.connect(snareGain);
        snareGain.connect(context.destination);
        
        snareOsc.start(context.currentTime);
        snareOsc.stop(context.currentTime + 0.2);
        
        // Snare noise
        const snareNoise = context.createBufferSource();
        snareNoise.buffer = noiseBuffer;
        
        const snareNoiseGain = context.createGain();
        const snareNoiseFilter = context.createBiquadFilter();
        
        snareNoiseFilter.type = "highpass";
        snareNoiseFilter.frequency.value = 1000;
        
        snareNoiseGain.gain.setValueAtTime(0.15, context.currentTime);
        snareNoiseGain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
        
        snareNoise.connect(snareNoiseFilter);
        snareNoiseFilter.connect(snareNoiseGain);
        snareNoiseGain.connect(context.destination);
        
        snareNoise.start(context.currentTime);
      }, 120); // Delay by around 120ms
    }
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
      playChord(sections[0].chords[0]);
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
                playChord(sections[0].chords[0]);
              }
              return 0;
            } else {
              // Play first chord of next section
              if (sections[nextSection].chords.length > 0) {
                playChord(sections[nextSection].chords[0]);
              }
              return nextSection;
            }
          });
          return 0;
        } else {
          // Play next chord in current section
          playChord(sections[currentSection].chords[nextChord]);
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
  const toggleInstrument = (instrument: Instrument) => {
    setInstruments(prev => ({
      ...prev,
      [instrument]: !prev[instrument]
    }));
  };

  // Handle file upload for background track
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // In a real implementation, you would load and play the audio file here
    toast({
      title: "File uploaded",
      description: `"${file.name}" has been uploaded. (Note: Audio processing not implemented in this demo)`,
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
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={() => {
          // Instruments panel would be a dropdown in actual implementation
          toast({
            title: "Instruments",
            description: "Access instrument controls via the accordion below.",
          });
        }}>
          Instruments
        </Button>

        <label className="cursor-pointer">
          <Button variant="outline" asChild className="transition-colors duration-300">
            <span>File</span>
          </Button>
          <input 
            type="file" 
            accept="audio/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {/* Instruments accordion */}
      <Accordion type="single" collapsible className="mb-6">
        <AccordionItem value="instruments">
          <AccordionTrigger className="py-2">Instruments</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Label htmlFor="piano-toggle" className="text-base font-medium mr-2">Piano</Label>
                  <span className="text-muted-foreground">&#9672;&#9672;&#9672;</span>
                </div>
                <Switch 
                  id="piano-toggle" 
                  checked={instruments.piano} 
                  onCheckedChange={() => toggleInstrument("piano")} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Label htmlFor="guitar-toggle" className="text-base font-medium mr-2">Guitar</Label>
                  <span className="text-muted-foreground">&#9672;&#9672;&#9672;</span>
                </div>
                <Switch 
                  id="guitar-toggle" 
                  checked={instruments.guitar} 
                  onCheckedChange={() => toggleInstrument("guitar")} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Label htmlFor="bass-toggle" className="text-base font-medium mr-2">Bass</Label>
                  <span className="text-muted-foreground">&#9672;&#9672;&#9672;</span>
                </div>
                <Switch 
                  id="bass-toggle" 
                  checked={instruments.bass} 
                  onCheckedChange={() => toggleInstrument("bass")} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Label htmlFor="drums-toggle" className="text-base font-medium mr-2">Drums</Label>
                  <span className="text-muted-foreground">&#9672;&#9672;&#9672;</span>
                </div>
                <Switch 
                  id="drums-toggle" 
                  checked={instruments.drums} 
                  onCheckedChange={() => toggleInstrument("drums")} 
                />
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
            playChord={playChord}
          />
        ))}
      </div>

      {/* Section controls */}
      <div className="flex gap-4 mt-6">
        <Button variant="outline" onClick={() => removeSection(sections.length - 1)}>
          <Trash className="mr-2 h-4 w-4" />
          Remove section
        </Button>
        
        <Button variant="outline" onClick={generateChords}>
          Generate chords
        </Button>
        
        <Button variant="ghost" onClick={addSection} className="ml-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add section
        </Button>
      </div>
    </div>
  );
};

export default ChordProgressionPlayer;
