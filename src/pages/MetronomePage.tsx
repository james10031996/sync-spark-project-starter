import React, { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Play, Square, Download, Record, Volume2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const MetronomePage: React.FC = () => {
  const [tempo, setTempo] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatCount, setBeatCount] = useState(4);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingAvailable, setRecordingAvailable] = useState(false);

  const audioContext = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  // Initialize audio context
  const initAudio = useCallback(() => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create audio destination for recording
      if (audioContext.current && !audioDestinationRef.current) {
        audioDestinationRef.current = audioContext.current.createMediaStreamDestination();
      }
    }
    return audioContext.current;
  }, []);

  // Play enhanced click sound
  const playClick = useCallback((isAccent: boolean = false) => {
    if (!audioContext.current) return;
    
    const now = audioContext.current.currentTime;
    
    // Create oscillator with a more pleasant sound
    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();
    const filterNode = audioContext.current.createBiquadFilter();
    
    // Set properties based on whether it's an accent
    oscillator.type = isAccent ? 'triangle' : 'sine';
    oscillator.frequency.value = isAccent ? 1100 : 800;
    
    // Set up filter for a more pleasant sound
    filterNode.type = 'lowpass';
    filterNode.frequency.value = isAccent ? 4000 : 2000;
    filterNode.Q.value = 1.0;
    
    // Set up gain envelope for a more natural click
    gainNode.gain.value = 0;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.001);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    
    // Connect nodes
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    
    // Connect to recording destination if recording
    if (audioDestinationRef.current && isRecording) {
      gainNode.connect(audioDestinationRef.current);
    }
    
    // Start and stop oscillator
    oscillator.start();
    oscillator.stop(now + 0.1);
    
    // Add a subtle percussion element for accents
    if (isAccent) {
      const noiseBuffer = createNoiseBuffer(audioContext.current);
      const noiseSource = audioContext.current.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      
      const noiseGain = audioContext.current.createGain();
      noiseGain.gain.value = volume * 0.3;
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      
      const noiseFilter = audioContext.current.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 5000;
      
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioContext.current.destination);
      
      if (audioDestinationRef.current && isRecording) {
        noiseGain.connect(audioDestinationRef.current);
      }
      
      noiseSource.start();
      noiseSource.stop(now + 0.05);
    }
    
    // Visualize the beat
    setCurrentBeat(prev => (prev + 1) % beatCount);
  }, [beatCount, volume, isRecording]);

  // Create noise buffer for percussion sounds
  const createNoiseBuffer = (context: AudioContext): AudioBuffer => {
    const bufferSize = context.sampleRate * 0.05;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
  };

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

  // Start recording
  const startRecording = useCallback(() => {
    if (!audioDestinationRef.current) return;
    
    const recordedChunks: Blob[] = [];
    
    const mediaRecorder = new MediaRecorder(audioDestinationRef.current.stream);
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      setRecordedChunks(recordedChunks);
      setRecordingAvailable(true);
      toast({
        title: "Recording Complete",
        description: "Your metronome recording is ready to download",
      });
    };
    
    mediaRecorder.start();
    setIsRecording(true);
    
    // Start playing if not already
    if (!isPlaying) {
      startMetronome();
    }
    
    toast({
      title: "Recording Started",
      description: "The metronome is now being recorded",
    });
  }, [audioDestinationRef, isPlaying, startMetronome]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  // Download recorded audio
  const downloadRecording = useCallback(() => {
    if (recordedChunks.length === 0) return;
    
    const blob = new Blob(recordedChunks, { type: 'audio/mp3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = `metronome-${tempo}bpm.mp3`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: `Metronome at ${tempo} BPM has been downloaded`,
    });
  }, [recordedChunks, tempo]);

  // Toggle recording
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      // Initialize audio before recording
      initAudio();
      startRecording();
    }
  }, [isRecording, stopRecording, startRecording, initAudio]);

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
          <Card className="animate-fade-in">
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
                          ? (i === 0 ? 'bg-primary animate-pulse' : 'bg-secondary')
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
                    className="transition-all hover:scale-[1.01]"
                  />
                </div>
                
                {/* Beat count */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="beat-count">Time Signature</Label>
                    <Select value={beatCount.toString()} onValueChange={(value) => setBeatCount(Number(value))}>
                      <SelectTrigger id="beat-count" className="transition-all hover:border-primary">
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
                    <Label htmlFor="volume" className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" /> Volume
                    </Label>
                    <Slider
                      id="volume"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[volume]}
                      onValueChange={(values) => setVolume(values[0])}
                      className="transition-all hover:scale-[1.01]"
                    />
                  </div>
                </div>
                
                {/* Play button */}
                <Button 
                  className="w-full mt-6 transition-transform hover:scale-[1.01]"
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
              
              {/* Recording controls */}
              <div className="mt-6 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Recording</Label>
                  <ToggleGroup type="single" value={isRecording ? "recording" : ""}>
                    <ToggleGroupItem 
                      value="recording"
                      aria-label="Toggle recording"
                      onClick={toggleRecording}
                      className={isRecording ? "bg-red-500 text-white animate-pulse" : ""}
                    >
                      <Record className="h-4 w-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                
                <Button
                  variant="outline"
                  className="w-full mt-4 transition-all hover:bg-primary/10"
                  onClick={downloadRecording}
                  disabled={!recordingAvailable}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Recording
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card className="animate-fade-in">
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
                  <li>Record and download your metronome as MP3</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-in">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Common Tempos</h2>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setTempo(60)}
                    className="justify-start transition-all hover:bg-primary/10"
                  >
                    Largo (60 BPM)
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setTempo(76)}
                    className="justify-start transition-all hover:bg-primary/10"
                  >
                    Adagio (76 BPM)
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setTempo(108)}
                    className="justify-start transition-all hover:bg-primary/10"
                  >
                    Andante (108 BPM)
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setTempo(120)}
                    className="justify-start transition-all hover:bg-primary/10"
                  >
                    Moderato (120 BPM)
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setTempo(168)}
                    className="justify-start transition-all hover:bg-primary/10"
                  >
                    Allegro (168 BPM)
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setTempo(200)}
                    className="justify-start transition-all hover:bg-primary/10"
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
