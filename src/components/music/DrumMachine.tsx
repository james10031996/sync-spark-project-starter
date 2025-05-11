
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Play, Stop } from "lucide-react";

// Define drum sounds
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
}

const DrumMachine: React.FC<DrumMachineProps> = ({
  className = "",
  initialBpm = 120,
  queryPattern = "",
}) => {
  // Get pattern from query if provided, otherwise use empty pattern
  const initialPattern = queryPattern 
    ? parsePatternFromQuery(queryPattern) 
    : createEmptyPattern();
  
  const [pattern, setPattern] = useState<boolean[][]>(initialPattern);
  const [playing, setPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [bpm, setBpm] = useState(initialBpm);
  
  const audioContext = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const soundBuffers = useRef<Record<string, AudioBuffer>>({});
  
  // Initialize audio context
  const initAudio = useCallback(async () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Wait for all sounds to be loaded
      await Promise.all(
        DRUM_SOUNDS.map(async (sound) => {
          // Generate simple drum sounds since we're not loading samples
          const buffer = await createDrumSound(sound.id, audioContext.current!);
          soundBuffers.current[sound.id] = buffer;
        })
      );
    }
    return audioContext.current;
  }, []);
  
  // Generate drum sounds programmatically
  const createDrumSound = async (type: string, context: AudioContext): Promise<AudioBuffer> => {
    // Create a buffer for the sound
    let buffer: AudioBuffer;
    const sampleRate = context.sampleRate;
    
    switch (type) {
      case "kick": {
        // Simple kick drum (low frequency sine wave with fast decay)
        buffer = context.createBuffer(1, sampleRate * 0.5, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate;
          const frequency = 120 * Math.exp(-20 * t);
          data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-15 * t);
        }
        break;
      }
      case "snare": {
        // Simple snare (noise + mid tone)
        buffer = context.createBuffer(1, sampleRate * 0.3, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate;
          // Noise component
          const noise = Math.random() * 2 - 1;
          // Tone component
          const tone = Math.sin(2 * Math.PI * 250 * t);
          data[i] = (noise * 0.7 + tone * 0.3) * Math.exp(-15 * t);
        }
        break;
      }
      case "hihat": {
        // Simple hi-hat (filtered noise with fast decay)
        buffer = context.createBuffer(1, sampleRate * 0.1, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate;
          const noise = Math.random() * 2 - 1;
          data[i] = noise * Math.exp(-70 * t);
        }
        break;
      }
      case "clap": {
        // Simple clap (filtered noise with specific envelope)
        buffer = context.createBuffer(1, sampleRate * 0.2, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate;
          const noise = Math.random() * 2 - 1;
          // Specific clap envelope
          let env = Math.exp(-20 * t);
          if (t > 0.005) env += Math.exp(-20 * (t - 0.005)) * 0.6;
          if (t > 0.01) env += Math.exp(-20 * (t - 0.01)) * 0.3;
          data[i] = noise * env * 0.7;
        }
        break;
      }
      default: {
        // Default to a simple tone
        buffer = context.createBuffer(1, sampleRate * 0.2, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate;
          data[i] = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-10 * t);
        }
      }
    }
    
    return buffer;
  };
  
  // Play a drum sound
  const playSound = useCallback((soundId: string) => {
    if (!audioContext.current || !soundBuffers.current[soundId]) return;
    
    const source = audioContext.current.createBufferSource();
    source.buffer = soundBuffers.current[soundId];
    
    const gainNode = audioContext.current.createGain();
    gainNode.gain.value = 0.6; // Prevent clipping when multiple sounds play
    
    source.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    source.start();
  }, []);
  
  // Toggle a step in the pattern
  const toggleStep = (soundIndex: number, stepIndex: number) => {
    const newPattern = [...pattern];
    newPattern[soundIndex] = [...newPattern[soundIndex]];
    newPattern[soundIndex][stepIndex] = !newPattern[soundIndex][stepIndex];
    setPattern(newPattern);
  };
  
  // Start the sequencer
  const startSequencer = async () => {
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
    
    // Start the sequencer loop
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
  };
  
  // Stop the sequencer
  const stopSequencer = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPlaying(false);
    setCurrentStep(-1);
  };
  
  // Update interval when BPM changes
  useEffect(() => {
    if (playing) {
      stopSequencer();
      startSequencer();
    }
  }, [bpm]);
  
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
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle>Drum Machine</CardTitle>
        <CardDescription>16-step sequencer drum machine</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Step indicator */}
        <div className="grid grid-cols-16 gap-1 mb-4">
          {Array.from({ length: STEPS }).map((_, stepIndex) => (
            <div 
              key={`step-${stepIndex}`}
              className={`h-2 rounded-full ${currentStep === stepIndex 
                ? 'bg-primary' 
                : stepIndex % 4 === 0 
                  ? 'bg-muted-foreground/30' 
                  : 'bg-muted-foreground/10'
              }`}
            />
          ))}
        </div>
        
        {/* Drum pads */}
        <div className="space-y-2">
          {DRUM_SOUNDS.map((sound, soundIndex) => (
            <div key={sound.id} className="flex items-center">
              <div className="w-16 mr-2 text-sm font-medium">{sound.name}</div>
              <div className="flex-1 grid grid-cols-16 gap-1">
                {Array.from({ length: STEPS }).map((_, stepIndex) => (
                  <button
                    key={`${sound.id}-${stepIndex}`}
                    className={`h-10 rounded-md border transition-colors
                      ${pattern[soundIndex][stepIndex] 
                        ? `${sound.color} border-primary` 
                        : 'bg-secondary/30 border-muted hover:bg-muted/50'
                      }
                      ${currentStep === stepIndex ? 'ring-2 ring-primary ring-offset-1' : ''}
                    `}
                    onClick={() => toggleStep(soundIndex, stepIndex)}
                    aria-label={`Toggle ${sound.name} at step ${stepIndex + 1}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Controls */}
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
              onValueChange={(values) => setBpm(values[0])}
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          size="lg" 
          onClick={playing ? stopSequencer : startSequencer}
          className="w-full"
        >
          {playing ? (
            <><Stop className="mr-2 h-4 w-4" /> Stop</>
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
`;
document.head.appendChild(style);

export default DrumMachine;
