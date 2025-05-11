
import React, { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Play, Square } from "lucide-react";

const MetronomePage: React.FC = () => {
  const [tempo, setTempo] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatCount, setBeatCount] = useState(4);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [volume, setVolume] = useState(0.7);

  const audioContext = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Initialize audio context
  const initAudio = useCallback(() => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext.current;
  }, []);

  // Play click sound
  const playClick = useCallback((isAccent: boolean = false) => {
    if (!audioContext.current) return;
    
    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();
    
    // Set properties based on whether it's an accent
    oscillator.type = isAccent ? 'triangle' : 'sine';
    oscillator.frequency.value = isAccent ? 1000 : 800;
    gainNode.gain.value = volume;
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    
    // Start and stop oscillator
    oscillator.start();
    oscillator.stop(audioContext.current.currentTime + 0.05);
    
    // Visualize the beat
    setCurrentBeat(prev => (prev + 1) % beatCount);
  }, [beatCount, volume]);

  // Start metronome
  const startMetronome = useCallback(() => {
    const context = initAudio();
    
    if (context.state === 'suspended') {
      context.resume();
    }
    
    setIsPlaying(true);
    setCurrentBeat(0);
    
    // Clear existing interval
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    
    // Calculate interval from BPM
    const intervalMs = 60000 / tempo;
    let count = 0;
    
    // Start interval
    playClick(true); // Play first beat immediately (accent)
    
    intervalRef.current = window.setInterval(() => {
      count = (count + 1) % beatCount;
      playClick(count === 0); // Accent on the first beat
    }, intervalMs);
  }, [tempo, beatCount, playClick, initAudio]);

  // Stop metronome
  const stopMetronome = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(0);
  }, []);

  // Toggle play/stop
  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  }, [isPlaying, startMetronome, stopMetronome]);

  // Update interval when tempo changes
  useEffect(() => {
    if (isPlaying) {
      stopMetronome();
      startMetronome();
    }
  }, [tempo, isPlaying, startMetronome, stopMetronome]);

  // Add keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !(event.target instanceof HTMLInputElement)) {
        event.preventDefault();
        togglePlayback();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePlayback]);

  // Cleanup on unmount
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

  return (
    <div className="min-h-screen py-8 px-4 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="container max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Metronome</h1>
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Metronome</CardTitle>
              <CardDescription>Keep in time with adjustable tempo</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Visual metronome */}
              <div className="flex justify-center mb-8">
                <div className="grid grid-flow-col gap-2">
                  {Array.from({ length: beatCount }).map((_, i) => (
                    <div 
                      key={i}
                      className={`w-8 h-8 rounded-full transition-colors ${
                        currentBeat === i 
                          ? (i === 0 ? 'bg-primary' : 'bg-secondary')
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Tempo control */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="tempo">Tempo: {tempo} BPM</Label>
                  </div>
                  <Slider
                    id="tempo"
                    min={40}
                    max={240}
                    step={1}
                    value={[tempo]}
                    onValueChange={(values) => setTempo(values[0])}
                  />
                </div>
                
                {/* Beat count */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="beat-count">Time Signature</Label>
                    <Select value={beatCount.toString()} onValueChange={(value) => setBeatCount(Number(value))}>
                      <SelectTrigger id="beat-count">
                        <SelectValue placeholder="Select beats per measure" />
                      </SelectTrigger>
                      <SelectContent>
                        {[2, 3, 4, 5, 6, 7, 8].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}/4</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="volume">Volume</Label>
                    <Slider
                      id="volume"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[volume]}
                      onValueChange={(values) => setVolume(values[0])}
                    />
                  </div>
                </div>
                
                {/* Play button */}
                <Button 
                  className="w-full mt-6"
                  onClick={togglePlayback}
                  size="lg"
                >
                  {isPlaying ? (
                    <><Square className="mr-2 h-4 w-4" /> Stop</>
                  ) : (
                    <><Play className="mr-2 h-4 w-4" /> Start</>
                  )}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Press spacebar to start/stop
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">About Metronome</h2>
                <p className="mb-4">
                  A metronome helps musicians stay in rhythm while practicing or performing. 
                  It produces steady, precise beats at a selected tempo.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Set your desired tempo using the BPM slider</li>
                  <li>Select time signature (beats per measure)</li>
                  <li>Start/stop with the button or spacebar</li>
                  <li>The first beat of each measure is accented</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Common Tempos</h2>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setTempo(60)}
                    className="justify-start"
                  >
                    Largo (60 BPM)
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setTempo(76)}
                    className="justify-start"
                  >
                    Adagio (76 BPM)
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setTempo(108)}
                    className="justify-start"
                  >
                    Andante (108 BPM)
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setTempo(120)}
                    className="justify-start"
                  >
                    Moderato (120 BPM)
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setTempo(168)}
                    className="justify-start"
                  >
                    Allegro (168 BPM)
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setTempo(200)}
                    className="justify-start"
                  >
                    Presto (200 BPM)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetronomePage;
