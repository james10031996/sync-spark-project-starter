
import React, { useState } from "react";
import { Link } from "react-router-dom";
import ChordPlayer from "@/components/music/ChordPlayer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";

const ChordPlayerPage: React.FC = () => {
  const [rootNote, setRootNote] = useState("C");
  const [chordType, setChordType] = useState("major");
  
  return (
    <div className="min-h-screen py-8 px-4 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="container max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Chord Player</h1>
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ChordPlayer 
              defaultRoot={rootNote} 
              defaultChord={chordType} 
              className="mx-auto"
            />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">About Chord Player</h2>
                <p className="mb-4">
                  This chord player lets you hear what different chords sound like. 
                  Select a root note and chord type, then press the Play button or use 
                  the spacebar to hear the chord.
                </p>
                <p>
                  The displayed chord formula shows you which notes make up the selected chord.
                  Chords are built using specific intervals from the root note that give them
                  their characteristic sound.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Embed This Component</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  You can easily embed this chord player into your own project with custom defaults:
                </p>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="embed-root">Default Root Note</Label>
                      <Select value={rootNote} onValueChange={setRootNote}>
                        <SelectTrigger id="embed-root">
                          <SelectValue placeholder="Select root note" />
                        </SelectTrigger>
                        <SelectContent>
                          {["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].map(note => (
                            <SelectItem key={note} value={note}>{note}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="embed-chord">Default Chord Type</Label>
                      <Select value={chordType} onValueChange={setChordType}>
                        <SelectTrigger id="embed-chord">
                          <SelectValue placeholder="Select chord type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="major">Major</SelectItem>
                          <SelectItem value="minor">Minor</SelectItem>
                          <SelectItem value="7">7th</SelectItem>
                          <SelectItem value="maj7">Major 7th</SelectItem>
                          <SelectItem value="min7">Minor 7th</SelectItem>
                          <SelectItem value="dim">Diminished</SelectItem>
                          <SelectItem value="aug">Augmented</SelectItem>
                          <SelectItem value="sus2">Sus2</SelectItem>
                          <SelectItem value="sus4">Sus4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="embed-code">Embed Code</Label>
                    <Input 
                      id="embed-code" 
                      readOnly 
                      value={`<ChordPlayer defaultRoot="${rootNote}" defaultChord="${chordType}" />`} 
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

export default ChordPlayerPage;
