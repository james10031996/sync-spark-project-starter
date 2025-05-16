
import React, { useState, useEffect, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Play } from "lucide-react";

// Define the root notes and chord types
const rootNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const chordTypes = [
  { id: "major", name: "Major", intervals: [0, 4, 7] },
  { id: "minor", name: "Minor", intervals: [0, 3, 7] },
  { id: "7", name: "7th", intervals: [0, 4, 7, 10] },
  { id: "maj7", name: "Major 7th", intervals: [0, 4, 7, 11] },
  { id: "min7", name: "Minor 7th", intervals: [0, 3, 7, 10] },
  { id: "dim", name: "Diminished", intervals: [0, 3, 6] },
  { id: "aug", name: "Augmented", intervals: [0, 4, 8] },
  { id: "sus2", name: "Sus2", intervals: [0, 2, 7] },
  { id: "sus4", name: "Sus4", intervals: [0, 5, 7] },
];

// Note frequencies (A4 = 440Hz)
const getNoteFrequency = (note: string, octave: number) => {
  const noteIndex = rootNotes.indexOf(note);
  // A4 is the reference note (440 Hz)
  const a4Index = rootNotes.indexOf("A") + (4 * 12);
  const noteOffset = noteIndex + (octave * 12) - a4Index;
  return 440 * Math.pow(2, noteOffset / 12);
};

interface ChordPlayerProps {
  defaultRoot?: string;
  defaultChord?: string;
  className?: string;
}

const ChordPlayer: React.FC<ChordPlayerProps> = ({
  defaultRoot = "C",
  defaultChord = "major",
  className = "",
}) => {
  const [rootNote, setRootNote] = useState(defaultRoot);
  const [chordType, setChordType] = useState(defaultChord);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);
  const oscillators = useRef<OscillatorNode[]>([]);

  // Initialize audio context on first user interaction
  const initAudioContext = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext.current;
  };

  // Create chord notes based on root and chord type
  const getChordNotes = () => {
    const chord = chordTypes.find(c => c.id === chordType) || chordTypes[0];
    const rootIndex = rootNotes.indexOf(rootNote);
    return chord.intervals.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      return rootNotes[noteIndex];
    });
  };

  // Get human-readable chord formula
  const getChordFormula = () => {
    const notes = getChordNotes();
    return notes.join("-");
  };

  // Play the chord
  const playChord = () => {
    const context = initAudioContext();
    stopChord(); // Stop any playing notes
    
    const chord = chordTypes.find(c => c.id === chordType) || chordTypes[0];
    const rootIndex = rootNotes.indexOf(rootNote);
    
    // Base octave for different chord types (adjust for better sound)
    const baseOctave = chordType === "dim" || chordType === "aug" ? 3 : 4;
    
    // Create oscillators for each note in the chord
    const oscs = chord.intervals.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      const octaveOffset = Math.floor((rootIndex + interval) / 12);
      const note = rootNotes[noteIndex];
      const frequency = getNoteFrequency(note, baseOctave + octaveOffset);
      
      const osc = context.createOscillator();
      const gain = context.createGain();
      
      osc.type = "sine";
      osc.frequency.value = frequency;
      
      // Add slight attack and release for more natural sound
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 2);
      
      osc.connect(gain);
      gain.connect(context.destination);
      
      osc.start(context.currentTime);
      osc.stop(context.currentTime + 2);
      
      return osc;
    });
    
    oscillators.current = oscs;
    setIsPlaying(true);
    
    // Reset playing state after chord finishes
    setTimeout(() => setIsPlaying(false), 2000);
  };

  // Stop any playing chord
  const stopChord = () => {
    if (oscillators.current.length > 0) {
      oscillators.current.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {
          // Oscillator might have already stopped
        }
      });
      oscillators.current = [];
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space bar or Enter plays the chord
      if ((e.code === "Space" || e.code === "Enter") && !e.repeat) {
        e.preventDefault();
        playChord();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [rootNote, chordType]);

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      stopChord();
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  return (
    <Card className={`w-full max-w-md shadow-md ${className}`}>
      <CardHeader>
        <CardTitle>Chord Player</CardTitle>
        <CardDescription>Play various chords with adjustable root note</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="root-note">Root Note</Label>
            <Select value={rootNote} onValueChange={setRootNote}>
              <SelectTrigger id="root-note">
                <SelectValue placeholder="Select root note" />
              </SelectTrigger>
              <SelectContent>
                {rootNotes.map(note => (
                  <SelectItem key={note} value={note}>{note}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="chord-type">Chord Type</Label>
            <Select value={chordType} onValueChange={setChordType}>
              <SelectTrigger id="chord-type">
                <SelectValue placeholder="Select chord type" />
              </SelectTrigger>
              <SelectContent>
                {chordTypes.map(chord => (
                  <SelectItem key={chord.id} value={chord.id}>{chord.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mb-6 text-center py-2 bg-muted/40 rounded-md">
          <div className="text-lg font-semibold">
            {rootNote}{chordType === "major" ? "" : chordType}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {getChordFormula()}
          </div>
        </div>
        
        <Button 
          className="w-full flex items-center justify-center py-6 text-lg"
          onClick={playChord} 
          disabled={isPlaying}
        >
          <Play className="mr-2 h-5 w-5" />
          {isPlaying ? "Playing..." : "Play Chord"}
        </Button>
        <div className="text-xs text-center mt-2 text-muted-foreground">
          Press Space or Enter to play
        </div>
      </CardContent>
    </Card>
  );
};

export default ChordPlayer;
