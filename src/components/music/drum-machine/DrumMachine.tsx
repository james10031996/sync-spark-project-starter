import React, { useState, useEffect, useRef, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Play, Square } from "lucide-react";
import { useDrumKeyboardControls } from "@/hooks/useDrumKeyboardControls";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createEnhancedDrumSound } from "./audioUtilsForDrumMachine";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define drum sounds with enhanced options
const DRUM_SOUNDS = [
  { id: "kick", name: "Kick", color: "bg-red-500" },
  { id: "snare", name: "Snare", color: "bg-blue-500" },
  { id: "hihat", name: "Hi-Hat", color: "bg-green-500" },
  { id: "clap", name: "Clap", color: "bg-yellow-500" },
  { id: "tom", name: "Tom", color: "bg-purple-500" },              // Deep tom
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
  
  // Load a predefined pattern - Fixed to apply pattern immediately without requiring another click
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
  

  
const [open, setOpen] = useState(false);

const drumPatterns = [
  { name: "Basic Beat", key: "basic", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
  { name: "Rock Beat", key: "rock", color: "bg-red-50 text-red-700 hover:bg-red-100" },
  { name: "Funk Groove", key: "funk", color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" },
  { name: "Hip-Hop Beat", key: "hiphop", color: "bg-green-50 text-green-700 hover:bg-green-100" },
  { name: "Electro Beat", key: "electro", color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" },
  { name: "Jazz Rhythm", key: "jazz", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
  { name: "Latin Groove", key: "latin", color: "bg-pink-50 text-pink-700 hover:bg-pink-100" },
  { name: "Reggae Rhythm", key: "reggae", color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
  { name: "Trap Beat", key: "trap", color: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
  { name: "Breakbeat", key: "breakbeat", color: "bg-lime-50 text-lime-700 hover:bg-lime-100" },
  { name: "Dubstep Beat", key: "dubstep", color: "bg-teal-50 text-teal-700 hover:bg-teal-100" },
];

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
              className="relative px-4 py-2 rounded-lg text-white bg-gradient-to-r from-violet-600 to-purple-700 overflow-hidden hover:brightness-125 transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]"
            >
              Clear Pattern
            </Button>
            <Button 
              size="lg"
              onClick={togglePlayback}
              className={`px-4 py-2 rounded-lg transition-all hover:scale-105 mb-6
                ${
                  playing
                    ? 'bg-gradient-to-r from-red-500 to-red-700 text-white hover:brightness-110 '
                    : 'bg-gradient-to-r from-purple-500 to-violet-700 text-white animate-pulse hover:animate-none'
                }`}
            >
              {playing ? (
                <>
                  <Square className="md:mr-2 h-4 w-4" /> Stop
                </>
              ) : (
                <>
                  <Play className="md:mr-2 h-4 w-4" /> Start
                </>
              )}
            </Button>

            {/* Beat pattern selection dialog - FIXED to apply pattern immediately on click */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="relative px-4 py-2 rounded-lg text-white bg-gradient-to-r from-violet-600 to-purple-700 overflow-hidden hover:brightness-125 transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]" onClick={() => setOpen(true)}>Select Beat</Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Select a Beat Pattern</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  {drumPatterns.map((pattern) => (
                    <Button
                      key={pattern.key}
                      onClick={() => {
                        // Apply pattern immediately - fixed the double-click issue
                        loadPattern(pattern.key);
                        setOpen(false); // close modal after selection
                      }}
                      className={`w-full ${pattern.color} border border-muted shadow-sm`}
                      variant="outline"
                    >
                      {pattern.name}
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

          </div>
        </div>
      </CardContent>
      
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
