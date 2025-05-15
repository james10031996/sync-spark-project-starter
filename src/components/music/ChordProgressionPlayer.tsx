import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Play, Download, Mic, Music, Square } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChordSection } from "./ChordSection";
import { toast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";

// Import types
import { ChordInProgression, ChordSectionData } from "@/features/chord-progression/types/audio";

// Import utilities
import { commonProgressions, availableInstruments } from "@/features/chord-progression/utils/audioUtils";
import { playChord } from "@/features/chord-progression/utils/chordPlayer";
import { playEnhancedDrumSound } from "@/features/chord-progression/utils/drumSounds";

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

  // Handle playing a chord with the current settings
  const handlePlayChord = (chord: ChordInProgression, sectionIndex: number = 0) => {
    if (!audioContext.current) {
      initAudioContext();
    }
    
    const sectionInstruments = sections[sectionIndex]?.instruments || [];
    const context = audioContext.current as AudioContext;
    
    playChord(
      chord, 
      sectionIndex, 
      context, 
      volume, 
      style, 
      sectionInstruments, 
      audioDestinationRef.current, 
      isRecording
    );
  };
  
  // Play the entire chord progression
  const playProgression = () => {
    if (playing) {
      stopProgression();
      return;
    }
    
    try {
      setPlaying(true);
      setCurrentSection(0);
      setCurrentChord(0);
      
      if (!audioContext.current) {
        initAudioContext();
      }
      
      // Start recording if needed
      if (isRecording) {
        startRecording();
      }
      
      // Calculate interval based on BPM
      const interval = (60 / bpm) * 1000;
      let sectionIndex = 0;
      let chordIndex = 0;
      
      // Play the first chord immediately
      if (sections[0]?.chords[0]) {
        handlePlayChord(sections[0].chords[0], 0);
      }
      
      // Set up interval to play chords in sequence
      intervalRef.current = window.setInterval(() => {
        const section = sections[sectionIndex];
        
        // Increment chord index
        chordIndex++;
        
        // Handle end of section
        if (chordIndex >= section.chords.length) {
          chordIndex = 0;
          
          // Move to next section
          sectionIndex++;
          
          // If end of all sections, stop or loop
          if (sectionIndex >= sections.length) {
            sectionIndex = 0;
            
            // If we've completed the full progression, stop playing
            if (!isRecording) {
              stopProgression();
              return;
            }
          }
        }
        
        setCurrentSection(sectionIndex);
        setCurrentChord(chordIndex);
        
        // Play the current chord
        if (sections[sectionIndex]?.chords[chordIndex]) {
          handlePlayChord(sections[sectionIndex].chords[chordIndex], sectionIndex);
        }
        
      }, interval);
      
    } catch (error) {
      console.error("Error playing progression:", error);
      stopProgression();
    }
  };
  
  // Stop playing the progression
  const stopProgression = () => {
    setPlaying(false);
    setCurrentSection(0);
    setCurrentChord(0);
    
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Stop recording if active
    if (isRecording && mediaRecorderRef.current?.state === "recording") {
      stopRecording();
    }
  };

  // Random chord generation based on style
  const generateRandomChords = () => {
    // For each section, generate random chords based on the selected style
    const newSections = sections.map(section => {
      return {
        ...section,
        chords: getRandomChordsForStyle(style)
      };
    });
    
    setSections(newSections);
    toast({
      title: "New Chords Generated",
      description: `Created new chord progression in ${style} style`,
      duration: 2000,
    });
  };
  
  // Generate random chords based on style
  const getRandomChordsForStyle = (style: string): ChordInProgression[] => {
    // Use common progression patterns as templates
    const progressionTypes = Object.keys(commonProgressions);
    const randomProgressionKey = progressionTypes[
      Math.floor(Math.random() * progressionTypes.length)
    ];
    
    // @ts-ignore - we know this exists in the object
    const randomProgression = commonProgressions[randomProgressionKey];
    
    if (randomProgression) {
      return [...randomProgression];
    }
    
    // Fallback: generate completely random chords
    return Array(4).fill(0).map(() => ({
      root: "C",
      type: "major"
    }));
  };
  
  // Update a chord in the progression
  const updateChord = (sectionIndex: number, chordIndex: number, chord: ChordInProgression) => {
    setSections(prevSections => {
      const newSections = [...prevSections];
      const newChords = [...newSections[sectionIndex].chords];
      newChords[chordIndex] = chord;
      newSections[sectionIndex] = { ...newSections[sectionIndex], chords: newChords };
      return newSections;
    });
  };
  
  // Add a chord to a section
  const addChord = (sectionIndex: number) => {
    setSections(prevSections => {
      const newSections = [...prevSections];
      const section = newSections[sectionIndex];
      const lastChord = section.chords[section.chords.length - 1] || { root: "C", type: "major" };
      
      // Add a new chord with the same properties as the last one
      newSections[sectionIndex] = {
        ...section,
        chords: [
          ...section.chords,
          { ...lastChord } // Clone the last chord
        ]
      };
      
      return newSections;
    });
  };
  
  // Add a new section
  const addSection = () => {
    const newSectionId = `section-${sections.length + 1}`;
    
    // Copy instruments and chord pattern from the last section
    const lastSection = sections[sections.length - 1];
    const lastSectionInstruments = lastSection?.instruments || ["piano", "bass"];
    
    setSections(prevSections => [
      ...prevSections,
      {
        id: newSectionId,
        chords: [
          { root: "C", type: "major" },
          { root: "G", type: "7" },
          { root: "A", type: "minor" },
          { root: "F", type: "major" },
        ],
        instruments: lastSectionInstruments,
      }
    ]);
  };
  
  // Remove a section
  const removeSection = (sectionIndex: number) => {
    if (sections.length <= 1) {
      toast({
        title: "Cannot Remove Section",
        description: "You need at least one section in the progression",
        variant: "destructive",
      });
      return;
    }
    
    setSections(prevSections => prevSections.filter((_, index) => index !== sectionIndex));
  };
  
  // Update section-specific instruments
  const updateSectionInstruments = (sectionIndex: number, instruments: string[]) => {
    setSections(prevSections => {
      const newSections = [...prevSections];
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        instruments
      };
      return newSections;
    });
  };

  // Start recording
  const startRecording = () => {
    if (!audioContext.current || !audioDestinationRef.current) {
      initAudioContext();
    }
    
    if (audioDestinationRef.current) {
      try {
        setIsRecording(true);
        setRecordedChunks([]);
        
        const mediaRecorder = new MediaRecorder(audioDestinationRef.current.stream);
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            setRecordedChunks(prev => [...prev, e.data]);
          }
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: 'audio/mp3' });
          const url = URL.createObjectURL(blob);
          
          // Clean up previous recording URL
          if (recordingUrlRef.current) {
            URL.revokeObjectURL(recordingUrlRef.current);
          }
          
          recordingUrlRef.current = url;
          
          // Create audio element for playback
          const audio = new Audio(url);
          setRecordedAudio(audio);
          setRecordingAvailable(true);
          
          toast({
            title: "Recording Complete",
            description: "Your chord progression has been recorded",
          });
        };
        
        mediaRecorder.start();
        
        toast({
          title: "Recording Started",
          description: "Recording your chord progression",
        });
        
      } catch (error) {
        console.error("Error starting recording:", error);
        toast({
          title: "Recording Error",
          description: "Could not start recording. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  // Play recorded audio
  const playRecording = () => {
    if (recordedAudio) {
      recordedAudio.currentTime = 0;
      recordedAudio.play();
      setIsPlayingRecording(true);
      
      // Listen for when playback ends
      recordedAudio.onended = () => {
        setIsPlayingRecording(false);
      };
    }
  };
  
  // Stop playing recorded audio
  const stopPlayingRecording = () => {
    if (recordedAudio) {
      recordedAudio.pause();
      recordedAudio.currentTime = 0;
      setIsPlayingRecording(false);
    }
  };
  
  // Download recorded audio as MP3
  const downloadRecording = () => {
    if (recordingUrlRef.current) {
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = recordingUrlRef.current;
      a.download = `chord-progression-${style}-${new Date().toISOString()}.mp3`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);
    }
  };
  
  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      // Clean up all timers and audio resources
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      
      if (recordingUrlRef.current) {
        URL.revokeObjectURL(recordingUrlRef.current);
      }
      
      if (audioContext.current) {
        audioContext.current.close().catch(console.error);
      }
    };
  }, []);
  
  return (
    <Card className="shadow-lg bg-background/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {/* Style and Controls */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-center mb-2">
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <Label htmlFor="style">Style</Label>
              <Select
                value={style}
                onValueChange={setStyle}
              >
                <SelectTrigger id="style" className="w-[180px]">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pop">Pop</SelectItem>
                  <SelectItem value="Rock">Rock</SelectItem>
                  <SelectItem value="Jazz">Jazz</SelectItem>
                  <SelectItem value="Blues">Blues</SelectItem>
                  <SelectItem value="Funk">Funk</SelectItem>
                  <SelectItem value="Latin">Latin</SelectItem>
                  <SelectItem value="50s">50's</SelectItem>
                  <SelectItem value="Soul">Soul</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <Label htmlFor="bpm">Tempo: {bpm} BPM</Label>
              <div className="w-[180px]">
                <Slider
                  id="bpm"
                  min={40}
                  max={200}
                  step={1}
                  value={[bpm]}
                  onValueChange={(values) => setBpm(values[0])}
                  className="cursor-pointer"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <Label htmlFor="volume">Volume: {volume}%</Label>
              <div className="w-[180px]">
                <Slider
                  id="volume"
                  min={0}
                  max={100}
                  step={1}
                  value={[volume]}
                  onValueChange={(values) => setVolume(values[0])}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Main controls */}
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            <Button
              onClick={playProgression}
              variant={playing ? "outline" : "default"}
              size="lg"
              className={`gap-2 ${playing ? "bg-red-100 hover:bg-red-200 border-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:border-red-900/50" : ""}`}
            >
              {playing ? (
                <>
                  <Square className="w-5 h-5" /> Stop
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" /> Play Progression
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={generateRandomChords}
            >
              <Music className="w-5 h-5" /> Generate Chords
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className={`gap-2 ${isRecording ? "bg-red-100 hover:bg-red-200 border-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:border-red-900/50 dark:text-red-400" : ""}`}
              onClick={() => {
                if (isRecording) {
                  stopRecording();
                } else {
                  if (!playing) {
                    startRecording();
                    playProgression();
                  } else {
                    startRecording();
                  }
                }
              }}
              disabled={isPlayingRecording}
            >
              <Mic className="w-5 h-5" /> {isRecording ? "Stop Recording" : "Record"}
            </Button>
            
            {recordingAvailable && (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={isPlayingRecording ? stopPlayingRecording : playRecording}
                >
                  {isPlayingRecording ? (
                    <>
                      <Square className="w-5 h-5" /> Stop
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" /> Play Recording
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={downloadRecording}
                >
                  <Download className="w-5 h-5" /> Download MP3
                </Button>
              </>
            )}
          </div>
          
          {/* Sections */}
          <div className="flex flex-col gap-4">
            {sections.map((section, sectionIndex) => (
              <ChordSection
                key={section.id}
                section={section}
                sectionIndex={sectionIndex}
                isPlaying={playing && currentSection === sectionIndex}
                currentChord={currentChord}
                updateChord={(chordIndex, chord) => updateChord(sectionIndex, chordIndex, chord)}
                playChord={(chord) => handlePlayChord(chord, sectionIndex)}
                onAddChord={() => addChord(sectionIndex)}
                onRemoveSection={() => removeSection(sectionIndex)}
                allInstruments={availableInstruments}
                updateSectionInstruments={(instruments) => updateSectionInstruments(sectionIndex, instruments)}
                sectionRepeat={1}  // Default value (repeat functionality removed)
                updateSectionRepeat={() => {}} // Empty function as repeat is removed
              />
            ))}
            
            {sections.length < 4 && (
              <Button
                variant="ghost"
                className="border-2 border-dashed border-muted-foreground/20 py-8 hover:border-primary/30 hover:bg-primary/5 transition-all"
                onClick={addSection}
              >
                <Plus className="mr-2 h-5 w-5" /> Add Section
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChordProgressionPlayer;
