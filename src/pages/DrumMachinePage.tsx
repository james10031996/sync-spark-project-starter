
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DrumMachine from "@/components/music/DrumMachine";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

const DrumMachinePage: React.FC = () => {
  const [bpm, setBpm] = useState(120);
  const [patternQuery, setPatternQuery] = useState("");
  const [loadedPattern, setLoadedPattern] = useState("");
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Check URL for pattern data on load
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const data = searchParams.get('data');
    
    if (data) {
      setLoadedPattern(data);
      setPatternQuery(data);
      toast({
        title: "Pattern Loaded",
        description: "Drum pattern was loaded from URL",
      });
    }
  }, []);
  
  // Function to generate a sharable URL
  const generateShareURL = () => {
    const url = new URL(window.location.href.split('?')[0]);
    url.searchParams.set('data', patternQuery);
    return url.toString();
  };
  
  // Copy URL to clipboard
  const copyShareURL = () => {
    const url = generateShareURL();
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "URL Copied",
        description: "Sharable URL copied to clipboard",
      });
    });
  };
  
  // Handle pattern updates from the drum machine
  const handlePatternChange = (pattern: string) => {
    setPatternQuery(pattern);
  };

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
                  <li>Share your creation by copying the URL</li>
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
              queryPattern={loadedPattern}
              className="w-full"
              onPatternChange={handlePatternChange}
            />
            
            <motion.div variants={fadeIn}>
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-3">Share Your Pattern</h3>
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Enter pattern query string" 
                      value={patternQuery}
                      onChange={(e) => setPatternQuery(e.target.value)}
                      className="transition-all duration-300 focus:ring-2"
                    />
                    <Button 
                      onClick={copyShareURL}
                      className="transition-all duration-300 hover:scale-105"
                    >
                      Share
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Pattern automatically updates as you create your beat. Click Share to copy URL.
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about" className="transition-all duration-200">About</TabsTrigger>
                <TabsTrigger value="patterns" className="transition-all duration-200">Patterns</TabsTrigger>
                <TabsTrigger value="embed" className="transition-all duration-200">Embed</TabsTrigger>
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
                      <li>Share your patterns with others via URL</li>
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
              
              <TabsContent value="embed" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">Embed This Component</h2>
                    <p className="mb-4 text-sm text-muted-foreground">
                      You can easily embed this drum machine into your own project:
                    </p>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="embed-bpm">Default BPM</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            id="embed-bpm"
                            min={60}
                            max={200}
                            step={1}
                            value={[bpm]}
                            onValueChange={(values) => setBpm(values[0])}
                            className="flex-1"
                          />
                          <span className="w-12 text-right">{bpm}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="embed-pattern">Default Pattern (Optional)</Label>
                        <Input 
                          id="embed-pattern" 
                          placeholder="e.g. kick=1010&snare=0101" 
                          value={patternQuery}
                          onChange={(e) => setPatternQuery(e.target.value)}
                          className="transition-all duration-300"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="embed-code">Embed Code</Label>
                        <Input 
                          id="embed-code" 
                          readOnly 
                          value={`<DrumMachine initialBpm={${bpm}}${patternQuery ? ` queryPattern="${patternQuery}"` : ''} onPatternChange={(pattern) => console.log('Pattern updated:', pattern)} />`} 
                          onClick={(e) => (e.target as HTMLInputElement).select()}
                          className="font-mono text-sm transition-all duration-300"
                        />
                        <p className="text-xs text-muted-foreground">Click to select, then copy.</p>
                      </div>
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
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default DrumMachinePage;
