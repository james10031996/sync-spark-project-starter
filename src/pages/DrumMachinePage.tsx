
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

const DrumMachinePage: React.FC = () => {
  const [bpm, setBpm] = useState(120);
  const [patternQuery, setPatternQuery] = useState("");
  const [loadedPattern, setLoadedPattern] = useState("");
  
  // Check URL for pattern data on load
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const data = searchParams.get('data');
    
    if (data) {
      setLoadedPattern(data);
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
  
  return (
    <div className="min-h-screen py-8 px-4 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="container max-w-5xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Drum Machine</h1>
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <DrumMachine 
              initialBpm={bpm} 
              queryPattern={loadedPattern}
              className="w-full"
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
                  Enter a pattern query (e.g. kick=1010&snare=0101) or create 
                  one with the drum machine, then generate a sharable URL
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">About Drum Machine</h2>
                <p className="mb-2">
                  This is a simple 16-step drum sequencer. Toggle the pads to create your beat 
                  pattern, adjust the tempo with the slider, and press Start to hear your rhythm.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Create patterns by toggling drum pads</li>
                  <li>Adjust tempo with the BPM slider</li>
                  <li>Share your patterns with others via URL</li>
                  <li>Each column represents a 16th note in the beat</li>
                </ul>
              </CardContent>
            </Card>
            
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
                      value={`<DrumMachine initialBpm={${bpm}}${patternQuery ? ` queryPattern="${patternQuery}"` : ''} />`} 
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <p className="text-xs text-muted-foreground">Click to select, then copy.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrumMachinePage;
