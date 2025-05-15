
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Music, Plus } from "lucide-react";
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
  ]
};

// Define all available instruments (simplified to ones that sound good)
const availableInstruments: Record<string, { name: string; type: string }> = {
  piano: { name: "Piano", type: "keyboard" },
  acousticGuitar: { name: "Acoustic Guitar", type: "string" },
  electricGuitar: { name: "Electric Guitar", type: "string" },
  bass: { name: "Bass", type: "string" },
  strings: { name: "Strings", type: "orchestral" },
  synth: { name: "Synth", type: "keyboard" },
  organ: { name: "Organ", type: "keyboard" },
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
  const [pattern, setPattern] = useState<string>("Pop");
  const [activeInstruments, setActiveInstruments] = useState<Record<string, boolean>>({
    piano: true,
    acousticGuitar: false,
    electricGuitar: false,
    bass: true,
    strings: false,
    synth: false,
    organ: false
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

  // Play a chord with improved sound
  const playChord = (chord: ChordInProgression, sectionIndex: number = 0) => {
    try {
      const context = initAudioContext();
      const masterGain = context.createGain();
      masterGain.gain.value = volume / 100;
      masterGain.connect(context.destination);
      
      // Determine which instruments to use
      const instrumentsToUse = Object.keys(activeInstruments).filter(inst => activeInstruments[inst]);
      
      if (instrumentsToUse.length === 0) {
        // If no instruments are selected, default to piano
        instrumentsToUse.push('piano');
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
      
      // Create tones for each instrument
      instrumentsToUse.forEach(instrumentId => {
        const instrumentSettings = getInstrumentSettings(instrumentId, pattern);
        
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
            i * 0.02
          );
        });
      });
      
    } catch (error) {
      console.error("Error playing chord:", error);
    }
  };
  
  // Get instrument-specific settings
  const getInstrumentSettings = (instrumentId: string, patternStyle: string) => {
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
    };
    
    // Customize based on instrument
    switch(instrumentId) {
      case "piano":
        return {
          ...baseSettings,
          waveform: "triangle",
          octave: 4,
          attack: 0.01,
          release: 1.2,
          filterFreq: 5000
        };
      case "acousticGuitar":
        return {
          ...baseSettings,
          waveform: "triangle",
          octave: 3,
          attack: 0.04,
          release: 0.9,
          filterFreq: 5000
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
          waveform: patternStyle === "Blues" ? "sawtooth" : "triangle",
          octave: 2,
          attack: 0.06,
          release: 1.0,
          filterFreq: 2000
        };
      case "strings":
        return {
          ...baseSettings,
          waveform: "sine",
          octave: 4,
          attack: 0.2,
          release: 2.0,
          filterFreq: 4000
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
      case "organ":
        return {
          ...baseSettings,
          waveform: "sine",
          octave: 4,
          attack: 0.005,
          release: 0.8,
          filterFreq: 7000,
          sustain: 0.8
        };
      default:
        return baseSettings;
    }
  };
  
  // Create instrument-specific tones with improved sound quality
  const createInstrumentTone = (
    context: AudioContext,
    frequency: number,
    masterGain: GainNode,
    instrumentId: string,
    settings: any,
    delay: number = 0
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
    
    // Apply ADSR envelope
    const now = context.currentTime;
    const attackTime = Math.max(0.001, settings.attack);
    const releaseTime = Math.max(0.001, settings.release);
    
    gain.gain.setValueAtTime(0, now + delay);
    gain.gain.linearRampToValueAtTime(settings.sustain, now + delay + attackTime);
    gain.gain.setValueAtTime(settings.sustain * 0.8, now + delay + settings.decay);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + releaseTime);
    
    // Connect nodes
    osc.connect(filter);
    filter.connect(gain);
    
    // Add reverb for certain instruments
    if (["piano", "strings", "synth"].includes(instrumentId)) {
      const reverbGain = context.createGain();
      reverbGain.gain.value = 0.2;
      
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
    
    return { osc, gain }; // Return for potential cleanup
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
    const newSectionId = `section-${sections.length + 1}`;
    const newSection: ChordSectionData = {
      id: newSectionId,
      chords: [
        { root: "C", type: "major" },
        { root: "G", type: "major" },
        { root: "A", type: "minor" },
        { root: "F", type: "major" },
      ],
    };
    
    setSections((prevSections) => [...prevSections, newSection]);
    
    toast({
      title: "Section added",
      description: "A new chord section has been added to your progression.",
    });
  };

  // Remove a section
  const removeSection = (sectionIndex: number) => {
    setSections((prevSections) => {
      // Don't remove if it's the last section
      if (prevSections.length <= 1) {
        toast({
          title: "Cannot remove section",
          description: "You need at least one section in your progression.",
          variant: "destructive"
        });
        return prevSections;
      }
      
      const updatedSections = [...prevSections];
      updatedSections.splice(sectionIndex, 1);
      
      toast({
        title: "Section removed",
        description: "The chord section has been removed from your progression.",
      });
      
      return updatedSections;
    });
  };

  // Generate random chord progression based on selected pattern
  const generateChords = () => {
    setSections(prevSections => {
      return prevSections.map(section => {
        // Generate a random chord progression based on pattern
        let randomChords: ChordInProgression[] = [];
        
        // Generate 4 random chords
        for (let i = 0; i < 4; i++) {
          randomChords.push({
            root: rootNotes[Math.floor(Math.random() * rootNotes.length)],
            type: chordTypes[Math.floor(Math.random() * chordTypes.length)].id
          });
        }
        
        return {
          ...section,
          chords: randomChords
        };
      });
    });
    
    toast({
      title: `${pattern} progression generated`,
      description: "Random chord progressions have been created for all sections.",
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

        <Select value={pattern} onValueChange={setPattern}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Pattern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pop">Pop</SelectItem>
            <SelectItem value="Jazz">Jazz</SelectItem>
            <SelectItem value="Blues">Blues</SelectItem>
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

      {/* Main content */}
      <Card className="p-4 mb-6">
        <CardContent className="space-y-8 pt-2">
          {/* Chord Sections */}
          <div className="space-y-6">
            {sections.map((section, sectionIndex) => (
              <div key={section.id} className="border rounded-lg p-4 bg-card/50">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Section {sectionIndex + 1}</h3>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => addChordToSection(sectionIndex)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Chord
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-destructive hover:bg-destructive/10" 
                      onClick={() => removeSection(sectionIndex)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                {/* Chords display */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {section.chords.map((chord, chordIndex) => (
                    <div 
                      key={chordIndex} 
                      className={`p-3 rounded-md border text-center transition-all ${
                        playing && currentSection === sectionIndex && currentChord === chordIndex 
                          ? 'bg-primary/20 border-primary scale-105' 
                          : 'bg-card border-border'
                      }`}
                      onClick={() => playChord(chord, sectionIndex)}
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
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full border-dashed" 
              onClick={addSection}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Section
            </Button>
          </div>
          
          {/* Instruments */}
          <div>
            <h3 className="text-sm font-medium mb-3">Active Instruments</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2">
              {Object.entries(availableInstruments).map(([id, info]) => (
                <div key={id} className="flex items-center justify-between">
                  <Label htmlFor={`${id}-toggle`} className="text-sm font-medium cursor-pointer">{info.name}</Label>
                  <Switch 
                    id={`${id}-toggle`} 
                    checked={activeInstruments[id] || false} 
                    onCheckedChange={() => toggleInstrument(id)} 
                    className="transition-all data-[state=checked]:bg-primary"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col pt-6 px-0">
          <Tabs className="w-full" defaultValue="about" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-4 grid grid-cols-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="tutorial">Tutorial</TabsTrigger>
            </TabsList>

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
                  <li>Choose from different musical styles such as Pop, Jazz, and Blues</li>
                  <li>Customize the instrumentation to hear how progressions sound with different instruments</li>
                  <li>Adjust the tempo (BPM) to match your preferred playing speed</li>
                  <li>Generate style-specific chord progressions with appropriate instrumentation</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="style">
              <div className="prose dark:prose-invert">
                <h3>Musical Styles</h3>
                
                <div className="mb-4">
                  <h4>Pop</h4>
                  <p>
                    Pop music typically features catchy melodies, simple chord progressions, and a verse-chorus structure. 
                    Common chord progressions include I-V-vi-IV (C-G-Am-F in C major).
                  </p>
                  <p>
                    <strong>Recommended instruments:</strong> Piano, Electric Guitar, Bass
                  </p>
                </div>
                
                <div className="mb-4">
                  <h4>Jazz</h4>
                  <p>
                    Jazz uses extended harmony with seventh, ninth and thirteenth chords. The ii-V-I progression 
                    (Dm7-G7-CMaj7 in C major) is fundamental to jazz harmony.
                  </p>
                  <p>
                    <strong>Recommended instruments:</strong> Piano, Bass, Organ
                  </p>
                </div>
                
                <div>
                  <h4>Blues</h4>
                  <p>
                    Blues commonly uses a 12-bar structure with dominant seventh chords. The I-IV-V progression 
                    (C7-F7-G7 in C) is the backbone of blues.
                  </p>
                  <p>
                    <strong>Recommended instruments:</strong> Electric Guitar, Bass, Piano
                  </p>
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
              </div>
            </TabsContent>
          </Tabs>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ChordProgressionPlayer;
