
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChordInProgression } from "@/components/music/ChordProgressionPlayer";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Define root notes and chord types
const rootNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const chordTypes = [
  { id: "major", name: "Major", symbol: "" },
  { id: "minor", name: "Minor", symbol: "m" },
  { id: "7", name: "7th", symbol: "7" },
  { id: "maj7", name: "Major 7th", symbol: "maj7" },
  { id: "min7", name: "Minor 7th", symbol: "m7" },
  { id: "dim", name: "Diminished", symbol: "dim" },
  { id: "aug", name: "Augmented", symbol: "aug" },
  { id: "sus2", name: "Sus2", symbol: "sus2" },
  { id: "sus4", name: "Sus4", symbol: "sus4" },
];

interface ChordBlockProps {
  chord: ChordInProgression;
  isActive?: boolean;
  onChange: (chord: ChordInProgression) => void;
  onPlay: () => void;
}

export const ChordBlock: React.FC<ChordBlockProps> = ({
  chord,
  isActive = false,
  onChange,
  onPlay
}) => {
  const [isRootOpen, setIsRootOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  // Get chord display text
  const getChordDisplay = () => {
    const chordType = chordTypes.find(ct => ct.id === chord.type);
    return `${chord.root}${chordType?.symbol || ''}`;
  };

  return (
    <Card 
      className={`
        w-24 h-24 cursor-pointer transition-all duration-200 
        ${isActive ? 'bg-primary/10 scale-105 shadow-lg' : 'hover:bg-accent/50'}
      `}
      onClick={onPlay}
    >
      <CardContent className="p-0 h-full w-full flex items-center justify-center relative">
        {/* Chord display */}
        <div className="text-3xl font-medium">
          {getChordDisplay()}
        </div>
        
        {/* Root note selector (on long press or right click in full implementation) */}
        <DropdownMenu open={isRootOpen} onOpenChange={setIsRootOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="absolute top-0 left-0 h-8 w-8 p-0 opacity-0 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                setIsRootOpen(true);
              }}
            >
              ⋮
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[100px] max-h-[200px] overflow-y-auto">
            {rootNotes.map((note) => (
              <DropdownMenuItem 
                key={note}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ ...chord, root: note });
                  setIsRootOpen(false);
                }}
              >
                {note}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Chord type selector */}
        <DropdownMenu open={isTypeOpen} onOpenChange={setIsTypeOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="absolute top-0 right-0 h-8 w-8 p-0 opacity-0 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                setIsTypeOpen(true);
              }}
            >
              ⋮
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[150px] max-h-[200px] overflow-y-auto">
            {chordTypes.map((type) => (
              <DropdownMenuItem 
                key={type.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ ...chord, type: type.id });
                  setIsTypeOpen(false);
                }}
              >
                {type.name} ({type.symbol || 'Major'})
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Visual indicators at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-evenly p-1">
          <div className="w-1 h-1 bg-primary/30 rounded-full"></div>
          <div className="w-1 h-1 bg-primary/30 rounded-full"></div>
          <div className="w-1 h-1 bg-primary/30 rounded-full"></div>
          <div className="w-1 h-1 bg-primary/30 rounded-full"></div>
        </div>
      </CardContent>
    </Card>
  );
};
