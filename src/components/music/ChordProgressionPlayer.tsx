
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
import { Slider } from "@/components/ui/slider";
import { ChordProgressionFooter } from "@/components/music/ChordProgressionFooter";
import { useChordPlayer } from "@/components/music/hooks/useChordPlayer";
import { 
  ChordInProgression, 
  ChordSectionData, 
  availableInstruments, 
  rootNotes,
  chordTypes
} from "@/components/music/types/chordTypes";

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
  
  // Audio context and timer references
  const intervalRef = useRef<number | null>(null);
  const { playChord, initAudioContext } = useChordPlayer(volume);

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
      handlePlayChord(sections[0].chords[0], 0);
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
                handlePlayChord(sections[0].chords[0], 0);
              }
              return 0;
            } else {
              // Play first chord of next section
              if (sections[nextSection].chords.length > 0) {
                handlePlayChord(sections[nextSection].chords[0], nextSection);
              }
              return nextSection;
            }
          });
          return 0;
        } else {
          // Play next chord in current section
          handlePlayChord(sections[currentSection].chords[nextChord], currentSection);
          return nextChord;
        }
      });
    }, msPerChord);
  };

  // Handle playing a chord with section-specific or global instruments
  const handlePlayChord = (chord: ChordInProgression, sectionIndex: number = 0) => {
    const section = sections[sectionIndex];
    const instrumentsToUse = section.instruments && section.instruments.length > 0
      ? section.instruments
      : Object.keys(activeInstruments).filter(inst => activeInstruments[inst]);
      
    playChord(chord, instrumentsToUse, pattern);
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
        // Generate random chords for each section
        const randomChords: ChordInProgression[] = [];
        
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

  // Update instruments for a specific section
  const updateSectionInstruments = (sectionIndex: number, instruments: string[]) => {
    setSections(prevSections => {
      const updatedSections = [...prevSections];
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        instruments: instruments
      };
      return updatedSections;
    });
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
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
              <ChordSection
                key={section.id}
                section={section}
                sectionIndex={sectionIndex}
                isPlaying={playing && currentSection === sectionIndex}
                currentChord={currentChord}
                updateChord={(chordIndex, newChord) => updateChord(sectionIndex, chordIndex, newChord)}
                playChord={(chord) => handlePlayChord(chord, sectionIndex)}
                onAddChord={() => addChordToSection(sectionIndex)}
                onRemoveSection={() => removeSection(sectionIndex)}
                allInstruments={availableInstruments}
                updateSectionInstruments={(instruments) => updateSectionInstruments(sectionIndex, instruments)}
                sectionRepeat={1}
                updateSectionRepeat={() => {}}
              />
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
          <ChordProgressionFooter />
        </CardFooter>
      </Card>
    </div>
  );
};

export default ChordProgressionPlayer;
