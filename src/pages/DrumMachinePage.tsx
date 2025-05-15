import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import DrumMachine from "@/components/music/DrumMachine";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Play, Pause, Download, Mic, Square } from "lucide-react";

const DrumMachinePage: React.FC = () => {
  const [bpm, setBpm] = useState(120);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [loadedPattern, setLoadedPattern] = useState("");
  
  // References for recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio context
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioDestinationRef.current = audioContextRef.current.createMediaStreamDestination();
    }
  };
  
  // Start recording
  const startRecording = () => {
    initAudioContext();
    
    if (audioDestinationRef.current) {
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(audioDestinationRef.current.stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length === 0) {
          toast({
            title: "Recording Error",
            description: "No audio was recorded. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        setRecordedBlob(audioBlob);
        
        // Create a new audio element for playback
        if (audioElementRef.current) {
          audioElementRef.current.pause();
        }
        
        const audioURL = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioURL);
        
        // Store the audio element reference
        audioElementRef.current = audio;
        
        // Add onended event to reset isPlayingRecording state
        audio.onended = () => {
          setIsPlayingRecording(false);
        };
        
        toast({
          title: "Recording Complete",
          description: "Your drum beat has been recorded",
        });
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Recording your drum patterns",
      });
    } else {
      toast({
        title: "Recording Error",
        description: "Could not initialize audio recording",
        variant: "destructive",
      });
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  // Toggle recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  // Play recorded audio
  const playRecording = () => {
    if (recordedBlob && audioElementRef.current) {
      // Reset the current time to start from the beginning
      audioElementRef.current.currentTime = 0;
      
      // Play the recording
      audioElementRef.current.play()
        .then(() => {
          setIsPlayingRecording(true);
        })
        .catch((error) => {
          console.error("Error playing recording:", error);
          toast({
            title: "Playback Error",
            description: "There was an error playing your recording",
            variant: "destructive",
          });
        });
    } else if (recordedBlob) {
      // Create a new audio element if it doesn't exist
      const audioURL = URL.createObjectURL(recordedBlob);
      const audio = new Audio(audioURL);
      
      // Store the audio element reference
      audioElementRef.current = audio;
      
      // Add onended event to reset isPlayingRecording state
      audio.onended = () => {
        setIsPlayingRecording(false);
      };
      
      // Play the audio
      audio.play()
        .then(() => {
          setIsPlayingRecording(true);
        })
        .catch((error) => {
          console.error("Error playing recording:", error);
          toast({
            title: "Playback Error",
            description: "There was an error playing your recording",
            variant: "destructive",
          });
        });
    }
  };
  
  // Stop playing recording
  const stopPlayingRecording = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      setIsPlayingRecording(false);
    }
  };
  
  // Toggle play/pause recorded audio
  const togglePlayRecording = () => {
    if (isPlayingRecording) {
      stopPlayingRecording();
    } else {
      playRecording();
    }
  };
  
  // Download recorded audio
  const downloadRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `drum-beat-${new Date().getTime()}.mp3`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Download Started",
        description: "Your drum beat is being downloaded",
      });
    } else {
      toast({
        title: "No Recording",
        description: "Please record something first",
        variant: "destructive",
      });
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, []);

  // Animation variants for page elements
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <div className="min-h-screen py-8 px-4 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <motion.div 
        className="container max-w-5xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        <motion.header 
          className="mb-8 flex justify-between items-center"
          variants={fadeIn}
        >
          <h1 className="text-3xl font-bold">Drum Machine</h1>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowTutorial(!showTutorial)}
              className="transition-all duration-300 hover:bg-primary/10"
            >
              {showTutorial ? "Hide" : "Show"} Tutorial
            </Button>
            <Link to="/">
              <Button variant="outline" className="transition-all duration-300 hover:bg-primary/10">
                Back to Home
              </Button>
            </Link>
          </div>
        </motion.header>
        
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-2">Quick Tutorial</h2>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Click on the grid cells to toggle drum sounds at specific steps</li>
                  <li>Use the "Start" button to play your pattern</li>
                  <li>Adjust the tempo with the BPM slider</li>
                  <li>Try the "Basic Beat" button for a simple pattern to start</li>
                  <li>Use the recording controls to capture your drum patterns</li>
                </ol>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            className="lg:col-span-2"
            variants={fadeIn}
          >
            <DrumMachine 
              initialBpm={bpm} 
              className="w-full"
              audioDestination={audioDestinationRef.current}
              onBpmChange={(newBpm) => setBpm(newBpm)}
            />
            
            <motion.div variants={fadeIn} className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-3">Recording Controls</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant={isRecording ? "destructive" : "default"}
                      onClick={toggleRecording}
                      className="flex items-center gap-2"
                    >
                      <Mic className={`h-4 w-4 ${isRecording ? "animate-pulse" : ""}`} />
                      {isRecording ? "Stop Recording" : "Record"}
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={togglePlayRecording}
                      disabled={!recordedBlob}
                      className="flex items-center gap-2"
                    >
                      {isPlayingRecording ? <Stop className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isPlayingRecording ? "Stop Playback" : "Play Recording"}
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={downloadRecording}
                      disabled={!recordedBlob}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download MP3
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {recordedBlob 
                      ? "Recording is ready to play or download" 
                      : "Record your drum patterns to download them as MP3"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="space-y-6"
            variants={fadeIn}
          >
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="about" className="transition-all duration-200">About</TabsTrigger>
                <TabsTrigger value="patterns" className="transition-all duration-200">Patterns</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">About Drum Machine</h2>
                    <p className="mb-2">
                      This is a 16-step drum sequencer. Toggle the pads to create your beat 
                      pattern, adjust the tempo with the slider, and press Start to hear your rhythm.
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Create patterns by toggling drum pads</li>
                      <li>Adjust tempo with the BPM slider</li>
                      <li>Control volume with the volume slider</li>
                      <li>Record your patterns and download as MP3</li>
                      <li>Use keyboard shortcuts: Spacebar to play/stop</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="patterns" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">Pattern Library</h2>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Try these pre-made patterns by clicking on them:
                    </p>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <Button 
                        variant="outline" 
                        className="justify-start transition-colors duration-200 hover:bg-primary/10"
                        onClick={() => setLoadedPattern("kick=1000100010001000&snare=0000100000001000&hihat=1010101010101010&clap=0000000000000000")}
                      >
                        Basic Rock Beat
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start transition-colors duration-200 hover:bg-primary/10"
                        onClick={() => setLoadedPattern("kick=1001000010010000&snare=0000100000001000&hihat=1111111111111111&clap=0000000010000000")}
                      >
                        Hip Hop Groove
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start transition-colors duration-200 hover:bg-primary/10"
                        onClick={() => setLoadedPattern("kick=1000000010000000&snare=0000100000001000&hihat=1010101010101010&clap=0000000000001000")}
                      >
                        Minimal Beat
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start transition-colors duration-200 hover:bg-primary/10"
                        onClick={() => setLoadedPattern("kick=1000001010100100&snare=0010100001000010&hihat=1010101010101010&clap=0000000000000000")}
                      >
                        Breakbeat
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start transition-colors duration-200 hover:bg-primary/10"
                        onClick={() => setLoadedPattern("kick=1000100000001000&snare=0000100010001000&hihat=1111111111111111&clap=0001000000000000")}
                      >
                        Dance Beat
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start transition-colors duration-200 hover:bg-primary/10"
                        onClick={() => setLoadedPattern("kick=1000100010001000&snare=0010001000100010&hihat=1010101010101010&clap=0000100000001000")}
                      >
                        Reggae Rhythm
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start transition-colors duration-200 hover:bg-primary/10"
                        onClick={() => setLoadedPattern("kick=1000001010000010&snare=0001100000011000&hihat=0101010101010101&clap=0000000000010000")}
                      >
                        Trap Pattern
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start transition-colors duration-200 hover:bg-primary/10"
                        onClick={() => setLoadedPattern("kick=1000010000100100&snare=0001000100010001&hihat=0110110001101100&clap=0000100000001000")}
                      >
                        Latin Groove
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start transition-colors duration-200 hover:bg-primary/10"
                        onClick={() => setLoadedPattern("kick=1010000010100000&snare=0000101000001010&hihat=1111111111111111&clap=0101010101010101")}
                      >
                        EDM Buildup
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <motion.div variants={fadeIn}>
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Keyboard Controls</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Space:</strong> Start/Stop playback</li>
                    <li><strong>C:</strong> Clear pattern</li>
                    <li><strong>B:</strong> Create basic beat</li>
                    <li><strong>Arrow Up/Down:</strong> Adjust tempo</li>
                    <li><strong>R:</strong> Start/Stop recording</li>
                    <li><strong>P:</strong> Play recorded audio</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* SEO Meta Tags added for better search visibility */}
      <head>
        <title>Online Drum Machine - Create and Record Drum Beats | MusicTools.app</title>
        <meta name="description" content="Create, play and record your own drum beats with our free online drum machine. Features 16-step sequencer, recording functionality, and pre-made patterns." />
        <meta name="keywords" content="drum machine, beat maker, drum sequencer, online drums, rhythm maker, drum patterns, beat sequencer, music production tool, free drum machine, drum recording app" />
        <meta property="og:title" content="Online Drum Machine - Create and Record Drum Beats" />
        <meta property="og:description" content="Create custom drum patterns with our free online 16-step sequencer. Save and download your beats as MP3." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://musictools.app/drum-machine" />
      </head>
    </div>
  );
};

export default DrumMachinePage;
