
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChordBlock } from "@/components/music/ChordBlock";
import { Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChordInProgression, ChordSectionData } from "@/components/music/ChordProgressionPlayer";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface ChordSectionProps {
  section: ChordSectionData;
  sectionIndex: number;
  isPlaying: boolean;
  currentChord: number;
  updateChord: (chordIndex: number, chord: ChordInProgression) => void;
  playChord: (chord: ChordInProgression) => void;
  onAddChord: () => void;
  onRemoveSection: () => void;
}

export const ChordSection: React.FC<ChordSectionProps> = ({
  section,
  sectionIndex,
  isPlaying,
  currentChord,
  updateChord,
  playChord,
  onAddChord,
  onRemoveSection
}) => {
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <div className="relative bg-accent/10 p-4 rounded-lg border border-border/50 transition-all hover:border-border">
      <div className="absolute -right-2 -top-2 bg-primary/90 backdrop-blur px-2 py-0.5 rounded-full text-sm font-semibold z-10 text-primary-foreground shadow-sm">
        {sectionIndex + 1}
      </div>
      
      <div className="absolute right-2 top-2">
        <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              ⋮
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Section Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onRemoveSection}>
              <Trash className="mr-2 h-4 w-4" /> Remove Section
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {section.chords.map((chord, chordIndex) => (
          <ChordBlock
            key={`${section.id}-chord-${chordIndex}`}
            chord={chord}
            isActive={isPlaying && currentChord === chordIndex}
            onChange={(newChord) => updateChord(chordIndex, newChord)}
            onPlay={() => playChord(chord)}
          />
        ))}
        
        {/* Add button that now works */}
        {section.chords.length < 8 && (
          <Button 
            variant="ghost" 
            className="border-2 border-dashed border-muted-foreground/20 h-24 w-24 flex items-center justify-center hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
            onClick={onAddChord}
          >
            <Plus className="h-6 w-6 text-muted-foreground/50" />
          </Button>
        )}
      </div>
    </div>
  );
};
