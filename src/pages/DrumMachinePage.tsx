
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
  
  return (
    <div className="min-h-screen py-8 px-4 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="container max-w-5xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Drum Machine</h1>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowTutorial(!showTutorial)}
            >
              {showTutorial ? "Hide" : "Show"} Tutorial
            </Button>
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </header>
        
        {showTutorial && (
          <Card className="mb-6 animate-fade-in">
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
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <DrumMachine 
              initialBpm={bpm} 
              queryPattern={loadedPattern}
              className="w-full"
              onPatternChange={handlePatternChange}
            />
            
            <Card className="mt-6">
              <CardContent className="pt-6">
                <h3 className="font-medium mb-3">Share Your Pattern</h3>
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Enter pattern query string" 
                    value={patternQuery}
                    onChange={(e) => setPatternQuery(e.target.value)}
                  />
                  <Button onClick={copyShareURL}>Share</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Pattern automatically updates as you create your beat. Click Share to copy URL.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Tabs defaultValue="about">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="patterns">Patterns</TabsTrigger>
                <TabsTrigger value="embed">Embed</TabsTrigger>
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
                        className="justify-start"
                        onClick={() => setLoadedPattern("kick=1000100010001000&snare=0000100000001000&hihat=1010101010101010&clap=0000000000000000")}
                      >
                        Basic Rock Beat
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => setLoadedPattern("kick=1001000010010000&snare=0000100000001000&hihat=1111111111111111&clap=0000000010000000")}
                      >
                        Hip Hop Groove
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => setLoadedPattern("kick=1000000010000000&snare=0000100000001000&hihat=1010101010101010&clap=0000000000001000")}
                      >
                        Minimal Beat
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => setLoadedPattern("kick=1000001010100100&snare=0010100001000010&hihat=1010101010101010&clap=0000000000000000")}
                      >
                        Breakbeat
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
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="embed-code">Embed Code</Label>
                        <Input 
                          id="embed-code" 
                          readOnly 
                          value={`<DrumMachine initialBpm={${bpm}}${patternQuery ? ` queryPattern="${patternQuery}"` : ''} onPatternChange={(pattern) => console.log('Pattern updated:', pattern)} />`} 
                          onClick={(e) => (e.target as HTMLInputElement).select()}
                        />
                        <p className="text-xs text-muted-foreground">Click to select, then copy.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrumMachinePage;
