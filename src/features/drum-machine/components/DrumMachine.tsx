
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Play, Square } from "lucide-react";
import { useDrumKeyboardControls } from "../hooks/useDrumKeyboardControls";

// Define drum sounds with enhanced options
const DRUM_SOUNDS = [
  { id: "kick", name: "Kick", color: "bg-red-500" },
  { id: "snare", name: "Snare", color: "bg-blue-500" },
  { id: "hihat", name: "Hi-Hat", color: "bg-green-500" },
  { id: "clap", name: "Clap", color: "bg-yellow-500" }
];

// Number of steps in the sequencer
const STEPS = 16;

// Create initial empty pattern
const createEmptyPattern = () => {
  return DRUM_SOUNDS.map(sound => Array(STEPS).fill(false));
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
  
  // Generate enhanced drum sounds programmatically
  const createEnhancedDrumSound = async (type: string, context: AudioContext): Promise<AudioBuffer> => {
    // Create a buffer for the sound
    let buffer: AudioBuffer;
    const sampleRate = context.sampleRate;
    
    switch (type) {
      case "kick": {
        // Enhanced kick drum with sub frequencies and better attack
        buffer = context.createBuffer(2, sampleRate * 0.6, sampleRate);
        const dataLeft = buffer.getChannelData(0);
        const dataRight = buffer.getChannelData(1);
        
        for (let i = 0; i < dataLeft.length; i++) {
          const t = i / sampleRate;
          // Main frequency sweep
          const frequency = 120 * Math.exp(-25 * t);
          // Add punch at the start
          const punchEnv = Math.exp(-200 * t);
          const punch = Math.sin(2 * Math.PI * 180 * t) * punchEnv * 0.5;
          // Add sub bass
          const subFreq = 60 * Math.exp(-15 * t);
          const sub = Math.sin(2 * Math.PI * subFreq * t) * 0.6;
          
          const mainSound = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-15 * t);
          
          // Combine components
          const combined = mainSound * 0.7 + punch * 0.2 + sub * 0.3;
          
          // Apply envelope
          const env = Math.exp(-8 * t);
          
          // Slight stereo variation
          dataLeft[i] = combined * env;
          dataRight[i] = combined * env * 0.98; // Slight stereo effect
        }
        break;
      }
      case "snare": {
        // Enhanced snare with body and noise components
        buffer = context.createBuffer(2, sampleRate * 0.4, sampleRate);
        const dataLeft = buffer.getChannelData(0);
        const dataRight = buffer.getChannelData(1);
        
        for (let i = 0; i < dataLeft.length; i++) {
          const t = i / sampleRate;
          
          // Body component (tone)
          let toneEnv = Math.exp(-30 * t);
          const tone1 = Math.sin(2 * Math.PI * 180 * t) * toneEnv * 0.5;
          const tone2 = Math.sin(2 * Math.PI * 330 * t) * toneEnv * 0.3;
          
          // Noise component with filter simulation
          const noise = (Math.random() * 2 - 1);
          const noiseHP = noise - (Math.random() * 2 - 1) * 0.2; // Crude highpass
          const noiseEnv = Math.exp(-t * 20);
          
          // Combine components
          dataLeft[i] = (tone1 + tone2) * 0.3 + noiseHP * noiseEnv * 0.7;
          
          // Slight stereo variation for realism
          dataRight[i] = (tone1 + tone2) * 0.32 + noiseHP * noiseEnv * 0.68 * 
            (1 + (Math.random() * 0.05 - 0.025)); // Small random variation
        }
        break;
      }
      case "hihat": {
        // Enhanced hi-hat with better filtering and resonance
        buffer = context.createBuffer(2, sampleRate * 0.2, sampleRate);
        const dataLeft = buffer.getChannelData(0);
        const dataRight = buffer.getChannelData(1);
        
        // Create a bandpass filtered noise
        for (let i = 0; i < dataLeft.length; i++) {
          const t = i / sampleRate;
          
          // Generate filtered noise
          let noise = 0;
          // Add multiple frequency bands for a more metallic sound
          for (let j = 0; j < 5; j++) {
            const freq = 5000 + j * 2000; // Different bands from 5-13kHz
            noise += Math.sin(2 * Math.PI * freq * t + Math.random() * 0.2) * 0.1;
          }
          
          // Add some white noise
          noise += (Math.random() * 2 - 1) * 0.5;
          
          // Apply envelope - very fast attack and decay
          const env = Math.exp(-t * (t < 0.005 ? 20 : 80));
          
          // Output with stereo width
          dataLeft[i] = noise * env;
          dataRight[i] = noise * env * 0.95; // Slight stereo effect
        }
        break;
      }
      case "clap": {
        // Enhanced clap with multiple transients
        buffer = context.createBuffer(2, sampleRate * 0.4, sampleRate);
        const dataLeft = buffer.getChannelData(0);
        const dataRight = buffer.getChannelData(1);
        
        for (let i = 0; i < dataLeft.length; i++) {
          const t = i / sampleRate;
          let env = 0;
          
          // Create multiple "clap" transients
          if (t < 0.001) env = t / 0.001;
          else if (t < 0.008) env = 1 - (t - 0.001) / 0.007;
          else if (t < 0.009) env = 0;
          else if (t < 0.011) env = (t - 0.009) / 0.002;
          else if (t < 0.02) env = 1 - (t - 0.011) / 0.009;
          else if (t < 0.021) env = 0;
          else if (t < 0.022) env = (t - 0.021) / 0.001;
          else if (t < 0.03) env = 1 - (t - 0.022) / 0.008;
          else if (t < 0.031) env = 0;
          else if (t < 0.032) env = (t - 0.031) / 0.001;
          
          // Long decay
          if (t >= 0.032) env = Math.exp(-(t - 0.032) * 15) * 0.8;
          
          // Band-limited noise
          let noise = 0;
          for (let j = 0; j < 10; j++) {
            // Focus on mid-high frequencies
            noise += Math.sin(2 * Math.PI * (1000 + j * 1000) * t * (1 + Math.random() * 0.1)) * 0.1;
          }
          noise += (Math.random() * 2 - 1) * 0.3;
          
          // Apply envelope and compress a bit
          const signal = noise * env;
          const compressed = signal * (1 - Math.max(0, signal - 0.8) * 0.5);
          
          // Subtle stereo spreading
          dataLeft[i] = compressed;
          dataRight[i] = compressed * (1 + (Math.random() * 0.1 - 0.05));
        }
        break;
      }
      default: {
        // Default to a simple tone
        buffer = context.createBuffer(2, sampleRate * 0.2, sampleRate);
        const dataLeft = buffer.getChannelData(0);
        const dataRight = buffer.getChannelData(1);
        
        for (let i = 0; i < dataLeft.length; i++) {
          const t = i / sampleRate;
          const signal = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-10 * t);
          dataLeft[i] = signal;
          dataRight[i] = signal;
        }
      }
    }
    
    return buffer;
  };
  
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
  
  // Create a simple pattern
  const createBasicPattern = useCallback(() => {
    const newPattern = createEmptyPattern();
    
    // Kick on beats 1 and 9 (first beat of each bar)
    newPattern[0][0] = true;
    newPattern[0][8] = true;
    
    // Snare on beats 5 and 13 (2nd and 4th beats)
    newPattern[1][4] = true;
    newPattern[1][12] = true;
    
    // Hi-hat on every other step
    for (let i = 0; i < STEPS; i += 2) {
      newPattern[2][i] = true;
    }
    
    setPattern(newPattern);
    if (onPatternChange) {
      onPatternChange(generatePatternQuery(newPattern));
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
    createBasicPattern,
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
                onClick={() => playSound(sound.id)}
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
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={clearPattern}
              className="transition-all duration-200 hover:bg-destructive/10"
            >
              Clear Pattern
            </Button>
            <Button 
              variant="outline" 
              onClick={createBasicPattern}
              className="transition-all duration-200 hover:bg-primary/10"
            >
              Basic Beat
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          size="lg" 
          onClick={togglePlayback}
          className={`w-full transition-all duration-300 ${playing ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'}`}
        >
          {playing ? (
            <><Square className="mr-2 h-4 w-4" /> Stop</>
          ) : (
            <><Play className="mr-2 h-4 w-4" /> Start</>
          )}
        </Button>
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
