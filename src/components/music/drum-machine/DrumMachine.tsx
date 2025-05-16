import React, { useState, useEffect, useRef, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Play, Square } from "lucide-react";
import { useDrumKeyboardControls } from "@/hooks/useDrumKeyboardControls";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createEnhancedDrumSound } from "./audioUtilsForDrumMachine";

// Define drum sounds with enhanced options
const DRUM_SOUNDS = [
  { id: "kick", name: "Kick", color: "bg-red-500" },
  { id: "snare", name: "Snare", color: "bg-blue-500" },
  { id: "hihat", name: "Hi-Hat", color: "bg-green-500" },
  { id: "clap", name: "Clap", color: "bg-yellow-500" },
   { id: "tom", name: "Tom", color: "bg-purple-500" },              // Deep tom
  { id: "ride", name: "Ride", color: "bg-cyan-500" },       // Metallic ride
  { id: "piano", name: "Key", color: "bg-pink-400" },            // Soft piano key
  { id: "synth", name: "Synth", color: "bg-indigo-400" },     // Sharp synth hit
];

// Number of steps in the sequencer
const STEPS = 16;

// Create initial empty pattern
const createEmptyPattern = () => {
  return DRUM_SOUNDS.map(sound => Array(STEPS).fill(false));
};

// Expanded predefined patterns
const DRUM_PATTERNS = {
  basic: [
    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // kick
    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // snare
    [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false], // hihat
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true], // clap
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], //tom
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], //ride
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],  //piano
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false] // clap
  ],
  rock: [
    [true, false, false, false, false, false, true, false, true, false, false, false, false, false, true, false], // kick
    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // snare
    [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], // hihat
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false], // clap
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], //tom
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], //ride
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],  //piano
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false] // clap
  
  ],
  funk: [
    [true, false, false, true, false, false, true, false, false, false, true, false, false, true, false, false], // kick
    [false, false, true, false, false, false, false, false, true, false, false, false, false, false, true, false], // snare
    [true, false, true, false, true, true, true, false, true, false, true, false, true, true, true, false], // hihat
    [false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true], // clap
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], //tom
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], //ride
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],  //piano
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false] // clap
  ],
  hiphop: [
    [true, false, false, false, false, false, false, false, true, false, false, false, false, true, false, false], // kick
    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // snare
    [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], // hihat
    [false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false], // clap
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], //tom
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], //ride
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],  //piano
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false] // clap
  ],
  electro: [
    [true, false, false, false, false, false, true, false, true, false, false, false, false, false, true, false], // kick
    [false, false, false, false, true, false, false, false, false, false, false, true, true, false, false, false], // snare
    [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], // hihat
    [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true], // clap
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], //tom
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], //ride
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],  //piano
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false] // clap
  ],
  jazz: [
    [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false], // kick
    [false, false, true, false, true, false, false, false, true, false, false, false, true, false, true, false], // snare
    [true, true, false, true, true, true, false, true, true, true, false, true, true, true, false, true], // hihat
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // clap
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], //tom
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], //ride
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],  //piano
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false] // clap
  ],
  // New patterns
  latin: [
    [true, false, false, false, true, false, true, false, true, false, false, false, true, false, true, false], // kick
    [false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false], // snare
    [false, true, true, true, false, true, true, true, false, true, true, true, false, true, true, true], // hihat
    [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], // clap
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], //tom
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], //ride
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],  //piano
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false] // clap
  ],
  reggae: [
    [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false], // kick
    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // snare
    [false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true], // hihat
    [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], // clap
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], //tom
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], //ride
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],  //piano
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false] // clap
  ],
  trap: [
    [true, false, false, false, false, false, false, true, false, false, true, false, false, false, false, false], // kick
    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // snare
    [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], // hihat (fast)
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true], // clap
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], //tom
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], //ride
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],  //piano
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false] // clap
  ],
  breakbeat: [
    [true, false, false, false, false, true, false, false, true, false, false, false, false, true, true, false], // kick
    [false, false, true, false, true, false, false, true, false, false, true, false, true, false, false, false], // snare
    [true, false, true, true, false, true, true, false, true, false, true, true, false, true, true, false], // hihat
    [false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, true], // clap
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], //tom
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], //ride
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],  //piano
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false] // clap
  ],
  dubstep: [
    [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, true], // kick
    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // snare
    [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], // hihat
    [false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false], // clap
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], //tom
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], //ride
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],  //piano
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false] // clap
  ]
};

// Parse pattern from query string
const parsePatternFromQuery = (queryString: string): boolean[][] => {
  try {
    // Expected format: kick=1010&snare=0101&hihat=1100&clap=0011
    const params = new URLSearchParams(queryString);
    const patterns = createEmptyPattern();
    
    DRUM_SOUNDS.forEach((sound, soundIndex) => {
      const pattern = params.get(sound.id);
      if (pattern) {
        // Convert string pattern to boolean array
        [...pattern].forEach((step, stepIndex) => {
          if (stepIndex < STEPS) {
            patterns[soundIndex][stepIndex] = step === "1";
          }
        });
      }
    });
    
    return patterns;
  } catch (e) {
    console.error("Error parsing pattern from query", e);
    return createEmptyPattern();
  }
};

// Generate query string from pattern
const generatePatternQuery = (pattern: boolean[][]): string => {
  const params = new URLSearchParams();
  
  DRUM_SOUNDS.forEach((sound, soundIndex) => {
    const patternString = pattern[soundIndex]
      .map(step => step ? "1" : "0")
      .join("");
    
    params.append(sound.id, patternString);
  });
  
  return params.toString();
};

interface DrumMachineProps {
  className?: string;
  initialBpm?: number;
  queryPattern?: string;
  onPatternChange?: (pattern: string) => void;
  audioDestination?: MediaStreamAudioDestinationNode | null;
  onBpmChange?: (bpm: number) => void;
}

const DrumMachine: React.FC<DrumMachineProps> = ({
  className = "",
  initialBpm = 120,
  queryPattern = "",
  onPatternChange,
  audioDestination,
  onBpmChange,
}) => {
  // Get pattern from query if provided, otherwise use empty pattern
  const initialPattern = queryPattern 
    ? parsePatternFromQuery(queryPattern) 
    : createEmptyPattern();
  
  const [pattern, setPattern] = useState<boolean[][]>(initialPattern);
  const [playing, setPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [bpm, setBpm] = useState(initialBpm);
  const [volume, setVolume] = useState(0.6);
  const [loadedPattern, setLoadedPattern] = useState("");
  const [activeTab, setActiveTab] = useState("pattern");
  
  const audioContext = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const soundBuffers = useRef<Record<string, AudioBuffer>>({});
  
  // Initialize audio context with higher quality settings
  const initAudio = useCallback(async () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 48000, // Higher sample rate for better quality
        latencyHint: 'interactive'
      });
      
      // Wait for all sounds to be loaded
      await Promise.all(
        DRUM_SOUNDS.map(async (sound) => {
          // Generate enhanced drum sounds
          const buffer = await createEnhancedDrumSound(sound.id, audioContext.current!);
          soundBuffers.current[sound.id] = buffer;
        })
      );
    }
    return audioContext.current;
  }, []);
  
  // Play a drum sound with enhanced processing
  const playSound = useCallback((soundId: string) => {
    if (!audioContext.current || !soundBuffers.current[soundId]) return;
    
    const source = audioContext.current.createBufferSource();
    source.buffer = soundBuffers.current[soundId];
    
    // Create gain for volume control
    const gainNode = audioContext.current.createGain();
    gainNode.gain.value = volume;
    
    // Add a compressor for punch
    const compressor = audioContext.current.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    
    // Create a subtle stereo effect using a stereo panner
    const panner = audioContext.current.createStereoPanner();
    panner.pan.value = (soundId === "hihat" || soundId === "clap") ? 0.2 : -0.1;
    
    // Connect the audio graph
    source.connect(gainNode);
    gainNode.connect(compressor);
    compressor.connect(panner);
    
    // Connect to main output
    panner.connect(audioContext.current.destination);
    
    // Connect to recording destination if provided
    if (audioDestination) {
      panner.connect(audioDestination);
    }
    
    source.start();
  }, [volume, audioDestination]);
  
  // Toggle a step in the pattern
  const toggleStep = useCallback((soundIndex: number, stepIndex: number) => {
    setPattern(prevPattern => {
      const newPattern = [...prevPattern];
      newPattern[soundIndex] = [...newPattern[soundIndex]];
      newPattern[soundIndex][stepIndex] = !newPattern[soundIndex][stepIndex];
      
      // Notify parent component of pattern changes if callback provided
      if (onPatternChange) {
        onPatternChange(generatePatternQuery(newPattern));
      }
      
      return newPattern;
    });
  }, [onPatternChange]);
  
  // Clear the pattern
  const clearPattern = useCallback(() => {
    const newPattern = createEmptyPattern();
    setPattern(newPattern);
    if (onPatternChange) {
      onPatternChange(generatePatternQuery(newPattern));
    }
  }, [onPatternChange]);
  
  // Load a predefined pattern
  const loadPattern = useCallback((patternName: string) => {
    if (DRUM_PATTERNS[patternName as keyof typeof DRUM_PATTERNS]) {
      const newPattern = DRUM_PATTERNS[patternName as keyof typeof DRUM_PATTERNS];
      setPattern(newPattern);
      setLoadedPattern(patternName); // Track which pattern is currently loaded
      if (onPatternChange) {
        onPatternChange(generatePatternQuery(newPattern));
      }
      
      // Show feedback when a pattern is loaded
      console.log(`Loaded ${patternName} pattern`);
    }
  }, [onPatternChange]);
  
  // Start the sequencer with enhanced timing
  const startSequencer = useCallback(async () => {
    await initAudio();
    
    if (audioContext.current?.state === 'suspended') {
      await audioContext.current.resume();
    }
     
    setPlaying(true);
    setCurrentStep(-1);
    
    // Stop any existing interval
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    
    // Calculate interval based on BPM (beats per minute)
    // Each step is a 16th note, so multiply by 4 to get 16th notes per minute
    const stepsPerMinute = bpm * 4;
    const intervalMs = 60000 / stepsPerMinute;
    
    // Use more accurate timing with audioContext time if available
    let lastStepTime = audioContext.current ? audioContext.current.currentTime : 0;
    
    // Start the sequencer loop with enhanced timing
    intervalRef.current = window.setInterval(() => {
      setCurrentStep(step => {
        const nextStep = (step + 1) % STEPS;
        
        // Play all triggered sounds at this step
        DRUM_SOUNDS.forEach((sound, soundIndex) => {
          if (pattern[soundIndex][nextStep]) {
            playSound(sound.id);
          }
        });
        
        return nextStep;
      });
    }, intervalMs);
  }, [bpm, initAudio, pattern, playSound]);
  
  // Stop the sequencer
  const stopSequencer = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPlaying(false);
    setCurrentStep(-1);
  }, []);
  
  // Toggle between play and stop
  const togglePlayback = useCallback(() => {
    if (playing) {
      stopSequencer();
    } else {
      startSequencer();
    }
  }, [playing, startSequencer, stopSequencer]);
  
  // Adjust BPM by a certain amount
  const adjustBpm = useCallback((amount: number) => {
    setBpm(prev => {
      const newBpm = Math.min(Math.max(prev + amount, 60), 200);
      if (onBpmChange) {
        onBpmChange(newBpm);
      }
      return newBpm;
    });
  }, [onBpmChange]);
  
  // Handle direct BPM change
  const handleBpmChange = useCallback((value: number[]) => {
    const newBpm = value[0];
    setBpm(newBpm);
    if (onBpmChange) {
      onBpmChange(newBpm);
    }
  }, [onBpmChange]);
  
  // Update interval when BPM changes
  useEffect(() => {
    if (playing) {
      stopSequencer();
      startSequencer();
    }
  }, [bpm, playing, startSequencer, stopSequencer]);
  
  // Setup keyboard controls
  useDrumKeyboardControls({
    playing,
    startStop: togglePlayback,
    clearPattern,
    createBasicPattern: () => loadPattern('basic'),
    adjustBpm
  });
  
  // Update pattern when queryPattern prop changes
  useEffect(() => {
    if (queryPattern) {
      setPattern(parsePatternFromQuery(queryPattern));
    }
  }, [queryPattern]);
  
  // Update pattern when loadedPattern state changes
  useEffect(() => {
    if (loadedPattern) {
      setPattern(parsePatternFromQuery(loadedPattern));
    }
  }, [loadedPattern]);
  
  // Generate pattern string when pattern changes
  useEffect(() => {
    if (onPatternChange) {
      onPatternChange(generatePatternQuery(pattern));
    }
  }, [pattern, onPatternChange]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  // Process query parameters if they exist
  useEffect(() => {
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const data = params.get('data');
      if (data) {
        setPattern(parsePatternFromQuery(data));
      }
    }
  }, []);
  
  // Visualize sound when playing - enhanced with visual feedback
  const playTestSound = (soundId: string) => {
    playSound(soundId);
  };
  
  return (
    <Card className={`w-full ${className} transition-all duration-300`}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Drum Machine
          {playing && (
            <span className="text-sm font-normal px-2 py-0.5 bg-primary/20 rounded-full animate-pulse transition-all">
              Playing
            </span>
          )}
        </CardTitle>
        <CardDescription>16-step sequencer drum machine</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Step indicator with smoother animations */}
        <div className="grid grid-cols-16 gap-1 mb-4">
          {Array.from({ length: STEPS }).map((_, stepIndex) => (
            <div 
              key={`step-${stepIndex}`}
              className={`h-2 rounded-full transition-all duration-150 ${
                currentStep === stepIndex 
                  ? 'bg-primary scale-y-125' 
                  : stepIndex % 4 === 0 
                    ? 'bg-muted-foreground/30' 
                    : 'bg-muted-foreground/10'
              }`}
            />
          ))}
        </div>
        
        {/* Drum pads with enhanced visual feedback */}
        <div className="space-y-2">
          {DRUM_SOUNDS.map((sound, soundIndex) => (
            <div key={sound.id} className="flex items-center">
              <div 
                className="w-16 mr-2 text-sm font-medium cursor-pointer hover:text-primary transition-colors group flex items-center justify-start"
                onClick={() => playTestSound(sound.id)}
                title="Click to test sound"
              >
                <span className="transition-transform duration-200 group-hover:scale-110">{sound.name}</span>
              </div>
              <div className="flex-1 grid grid-cols-16 gap-1">
                {Array.from({ length: STEPS }).map((_, stepIndex) => (
                  <button
                    key={`${sound.id}-${stepIndex}`}
                    className={`h-10 rounded-md border transition-all duration-200
                      ${pattern[soundIndex][stepIndex] 
                        ? `${sound.color} border-primary shadow-md hover:brightness-110` 
                        : 'bg-secondary/30 border-muted hover:bg-muted/50'
                      }
                      ${currentStep === stepIndex && playing ? 'ring-2 ring-primary ring-offset-1 scale-105' : ''}
                      ${currentStep === stepIndex && pattern[soundIndex][stepIndex] && playing ? 'animate-pulse' : ''}
                      hover:scale-105
                    `}
                    onClick={() => toggleStep(soundIndex, stepIndex)}
                    aria-label={`Toggle ${sound.name} at step ${stepIndex + 1}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Controls with enhanced UI */}
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="tempo">Tempo: {bpm} BPM</Label>
            </div>
            <Slider
              id="tempo"
              min={60}
              max={200}
              step={1}
              value={[bpm]}
              onValueChange={handleBpmChange}
              className="transition-all duration-200"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="volume">Volume: {Math.round(volume * 100)}%</Label>
            </div>
            <Slider
              id="volume"
              min={0}
              max={1}
              step={0.01}
              value={[volume]}
              onValueChange={(values) => setVolume(values[0])}
              className="transition-all duration-200"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={clearPattern}
              className="transition-all duration-200 hover:bg-destructive/10"
            >
              Clear Pattern
            </Button>
            <Button 
          size="lg" 
          onClick={togglePlayback}
          className={`w-full transition-all duration-300 ${playing ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'} mb-6`}
        >
          {playing ? (
            <><Square className="mr-2 h-4 w-4" /> Stop</>
          ) : (
            <><Play className="mr-2 h-4 w-4" /> Start</>
          )}
        </Button>
            <Button 
              variant="outline" 
              onClick={() => loadPattern('basic')}
              className="transition-all duration-200 hover:bg-primary/10"
            >
              Basic Beat
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col pt-6">
        

        <Tabs className="w-full" defaultValue="pattern" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4 grid grid-cols-3">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="pattern">Patterns</TabsTrigger>
            <TabsTrigger value="tutorial">Tutorial</TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <div className="prose dark:prose-invert">
              <h3>About Drum Machine</h3>
              <p>
                The Drum Machine is a 16-step sequencer allowing you to create rhythm patterns with various drum sounds. 
                It's designed to help musicians, producers, and enthusiasts experiment with different drum patterns.
              </p>
              <p>
                This interactive tool enables you to:
              </p>
              <ul className="pl-6 list-disc space-y-1">
                <li>Create custom drum patterns step by step</li>
                <li>Play back patterns at different tempos</li>
                <li>Load preset patterns for various musical styles</li>
                <li>Adjust volume and individual sounds</li>
                <li>Visualize the playback with step indicators</li>
              </ul>
              <p>
                Whether you're creating beats for a song, learning about rhythm, or just having fun, the Drum Machine offers an intuitive interface for rhythm exploration.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="pattern">
            <div>
              <h3 className="text-lg font-medium mb-3">Preset Patterns</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Button 
                  variant="outline" 
                  onClick={() => loadPattern('basic')}
                  className="transition-all duration-200"
                >
                  Basic Beat
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => loadPattern('rock')}
                  className="transition-all duration-200"
                >
                  Rock Beat
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => loadPattern('funk')}
                  className="transition-all duration-200"
                >
                  Funk Groove
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => loadPattern('hiphop')}
                  className="transition-all duration-200"
                >
                  Hip-Hop Beat
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => loadPattern('electro')}
                  className="transition-all duration-200"
                >
                  Electro Beat
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => loadPattern('jazz')}
                  className="transition-all duration-200"
                >
                  Jazz Rhythm
                </Button>
                
                {/* New patterns */}
                <Button 
                  variant="outline" 
                  onClick={() => loadPattern('latin')}
                  className="transition-all duration-200"
                >
                  Latin Groove
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => loadPattern('reggae')}
                  className="transition-all duration-200"
                >
                  Reggae Rhythm
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => loadPattern('trap')}
                  className="transition-all duration-200"
                >
                  Trap Beat
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => loadPattern('breakbeat')}
                  className="transition-all duration-200"
                >
                  Breakbeat
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => loadPattern('dubstep')}
                  className="transition-all duration-200"
                >
                  Dubstep Beat
                </Button>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Keyboard Shortcuts</h3>
                <div className="grid grid-cols-2 gap-y-2">
                  <div className="text-sm">
                    <span className="bg-secondary px-2 py-1 rounded mr-2 font-mono">Space</span>
                    <span>Play/Stop</span>
                  </div>
                  <div className="text-sm">
                    <span className="bg-secondary px-2 py-1 rounded mr-2 font-mono">C</span>
                    <span>Clear pattern</span>
                  </div>
                  <div className="text-sm">
                    <span className="bg-secondary px-2 py-1 rounded mr-2 font-mono">B</span>
                    <span>Basic beat</span>
                  </div>
                  <div className="text-sm">
                    <span className="bg-secondary px-2 py-1 rounded mr-2 font-mono">↑/↓</span>
                    <span>Adjust tempo</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tutorial">
            <div className="prose dark:prose-invert">
              <h3>Drum Machine Tutorial</h3>
              
              <div className="mb-4">
                <h4>Getting Started</h4>
                <p>
                  The Drum Machine is organized as a grid where rows represent different drum sounds (Kick, Snare, Hi-Hat, Clap) 
                  and columns represent time steps in the sequence.
                </p>
                <ol className="pl-6 list-decimal space-y-1">
                  <li>Click on any cell in the grid to toggle a sound at that step</li>
                  <li>Press the Start button to hear your pattern play</li>
                  <li>Use the Tempo slider to adjust the playback speed</li>
                </ol>
              </div>
              
              <div className="mb-4">
                <h4>Creating Patterns</h4>
                <p>
                  A standard drum pattern typically consists of:
                </p>
                <ul className="pl-6 list-disc space-y-1">
                  <li>Kick drum on beats 1 and 3 (first and ninth step)</li>
                  <li>Snare on beats 2 and 4 (fifth and thirteenth step)</li>
                  <li>Hi-hat on every other step for a consistent rhythm</li>
                </ul>
                <p>
                  Try loading the "Basic Beat" preset to see this pattern in action.
                </p>
              </div>
              
              <div>
                <h4>Tips for Better Beats</h4>
                <ul className="pl-6 list-disc space-y-1">
                  <li>Start with a simple kick and snare pattern before adding hi-hats</li>
                  <li>Remember that steps 1, 5, 9, and 13 represent the main beats in 4/4 time</li>
                  <li>Use the clap sound sparingly for emphasis</li>
                  <li>Experiment with different tempos to completely change the feel</li>
                  <li>Try the various preset patterns to learn different musical styles</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardFooter>
    </Card>
  );
};

// Add custom CSS for the 16-column grid
const style = document.createElement('style');
style.textContent = `
  .grid-cols-16 {
    grid-template-columns: repeat(16, minmax(0, 1fr));
  }
  
  /* Smooth animations */
  @keyframes glow {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.2); }
  }
  
  .animate-glow {
    animation: glow 1s infinite;
  }
`;
document.head.appendChild(style);

export default DrumMachine;
