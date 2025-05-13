import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Play, Pause, Download, Mic } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MetronomePageProps {
  className?: string;
}

const MetronomePage: React.FC<MetronomePageProps> = ({ className = "" }) => {
  const [bpm, setBpm] = useState<number>(120);
  const [playing, setPlaying] = useState<boolean>(false);
  const [beat, setBeat] = useState<number>(4);
  const [subdivision, setSubdivision] = useState<number>(1);
  const [accentColor, setAccentColor] = useState<string>("#FF0000");
  const [subdivisionColor, setSubdivisionColor] = useState<string>("#888888");
  const [volume, setVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingAvailable, setRecordingAvailable] = useState<boolean>(false);

  const audioContext = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const beatRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

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

  // Play a tick sound
  const playTick = () => {
    if (!audioContext.current) return;

    const osc = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    // Set volume based on mute state
    gainNode.gain.value = isMuted ? 0 : volume / 100;

    osc.type = "sine";
    osc.frequency.value = beatRef.current === 0 ? 880 : 440; // Higher pitch for the first beat

    osc.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    
    // Connect gainNode to recording destination if recording
    if (audioDestinationRef.current && isRecording) {
      gainNode.connect(audioDestinationRef.current);
    }

    osc.start();
    osc.stop(audioContext.current.currentTime + 0.1);
  };

  // Play a subdivision sound
  const playSubdivisionTick = () => {
    if (!audioContext.current) return;

    const osc = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    // Set volume based on mute state
    gainNode.gain.value = isMuted ? 0 : (volume / 100) * 0.5; // Quieter subdivision tick

    osc.type = "triangle";
    osc.frequency.value = 660; // Different pitch for subdivision

    osc.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    
    // Connect gainNode to recording destination if recording
    if (audioDestinationRef.current && isRecording) {
      gainNode.connect(audioDestinationRef.current);
    }

    osc.start();
    osc.stop(audioContext.current.currentTime + 0.05);
  };

  // Start/stop recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  // Start recording
  const startRecording = () => {
    if (!audioDestinationRef.current) {
      initAudioContext(); // Initialize audio context if not already done
    }
    
    if (audioDestinationRef.current) {
      const recordedChunks: Blob[] = [];
      
      try {
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
        if (!playing) {
          startMetronome();
        }
        
        toast({
          title: "Recording Started",
          description: "The metronome is now being recorded",
        });
      } catch (err) {
        console.error("Error starting recording:", err);
        toast({
          title: "Recording Failed",
          description: "Could not start recording. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  // Download recorded audio
  const downloadRecording = () => {
    if (recordedChunks.length === 0) return;
    
    const blob = new Blob(recordedChunks, { type: 'audio/mp3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = `metronome-${bpm}bpm.mp3`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: `Metronome audio has been downloaded as MP3`,
    });
  };

  // Start/stop metronome
  const toggleMetronome = () => {
    if (playing) {
      stopMetronome();
    } else {
      startMetronome();
    }
  };

  // Start metronome
  const startMetronome = () => {
    initAudioContext();
    setPlaying(true);
    beatRef.current = 0;

    if (audioContext.current) {
      const interval = 60000 / bpm; // Milliseconds per beat
      timerRef.current = window.setInterval(() => {
        playTick();
        beatRef.current = (beatRef.current + 1) % beat;

        // Play subdivisions
        if (subdivision > 1) {
          const subdivisionInterval = interval / subdivision;
          for (let i = 1; i < subdivision; i++) {
            setTimeout(() => {
              playSubdivisionTick();
            }, subdivisionInterval * i);
          }
        }
      }, interval);
    }
  };

  // Stop metronome
  const stopMetronome = () => {
    setPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Also stop recording if it's ongoing
    if (isRecording) {
      stopRecording();
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  return (
    <div className={`min-h-screen py-8 px-4 bg-background ${className} animate-fade-in`}>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="container max-w-3xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Metronome</h1>
          <Link to="/">
            <Button variant="outline" className="transition-all hover:scale-105">Back to Home</Button>
          </Link>
        </header>

        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">BPM</h2>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" onClick={() => setBpm(prev => Math.max(1, prev - 5))}>
                -5
              </Button>
              <Button variant="outline" size="icon" onClick={() => setBpm(prev => Math.max(1, prev - 1))}>
                -1
              </Button>
              <span className="text-lg font-medium">{bpm}</span>
              <Button variant="outline" size="icon" onClick={() => setBpm(prev => prev + 1)}>
                +1
              </Button>
              <Button variant="outline" size="icon" onClick={() => setBpm(prev => prev + 5)}>
                +5
              </Button>
            </div>
          </div>
          <Slider
            min={1}
            max={300}
            step={1}
            value={[bpm]}
            onValueChange={(value) => setBpm(value[0])}
          />

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Beat</h2>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" onClick={() => setBeat(prev => Math.max(1, prev - 1))}>
                -
              </Button>
              <span className="text-lg font-medium">{beat}</span>
              <Button variant="outline" size="icon" onClick={() => setBeat(prev => prev + 1)}>
                +
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Subdivision</h2>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" onClick={() => setSubdivision(prev => Math.max(1, prev - 1))}>
                -
              </Button>
              <span className="text-lg font-medium">{subdivision}</span>
              <Button variant="outline" size="icon" onClick={() => setSubdivision(prev => prev + 1)}>
                +
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Accent Color</h2>
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="h-8 w-16"
            />
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Subdivision Color</h2>
            <input
              type="color"
              value={subdivisionColor}
              onChange={(e) => setSubdivisionColor(e.target.value)}
              className="h-8 w-16"
            />
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Volume</h2>
            <div className="flex items-center space-x-4">
              <span className="text-lg font-medium">{volume}</span>
            </div>
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[volume]}
            onValueChange={(value) => setVolume(value[0])}
          />

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Mute</h2>
            <Switch checked={isMuted} onCheckedChange={setIsMuted} />
          </div>
        </Card>

        <div className="mt-8 flex justify-center space-x-4">
          <Button variant={playing ? "destructive" : "default"} onClick={toggleMetronome}>
            {playing ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {playing ? "Stop" : "Start"}
          </Button>
          
          {/* Recording controls */}
          <Button variant="outline" onClick={toggleRecording}>
            {isRecording ? <Mic className="mr-2 h-4 w-4 animate-pulse" /> : <Mic className="mr-2 h-4 w-4" />}
            {isRecording ? "Stop Recording" : "Start Recording"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={downloadRecording}
            disabled={!recordingAvailable}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Recording
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MetronomePage;
