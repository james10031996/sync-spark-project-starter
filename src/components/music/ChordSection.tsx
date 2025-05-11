
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChordBlock } from "@/components/music/ChordBlock";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChordInProgression, ChordSectionData } from "@/components/music/ChordProgressionPlayer";

interface ChordSectionProps {
  section: ChordSectionData;
  sectionIndex: number;
  isPlaying: boolean;
  currentChord: number;
  updateChord: (chordIndex: number, chord: ChordInProgression) => void;
  playChord: (chord: ChordInProgression) => void;
}

export const ChordSection: React.FC<ChordSectionProps> = ({
  section,
  sectionIndex,
  isPlaying,
  currentChord,
  updateChord,
  playChord
}) => {
  return (
    <div className="relative">
      <div className="absolute -right-4 -top-4 bg-muted/70 backdrop-blur px-2 py-1 rounded-full text-sm font-medium z-10">
        ×{sectionIndex + 1}
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
        
        {/* Optional: Add button to add more chords to a section */}
        {section.chords.length < 8 && (
          <Button 
            variant="ghost" 
            className="border-2 border-dashed border-muted-foreground/20 h-24 w-24 flex items-center justify-center"
            onClick={() => {
              // In a real implementation, this would add a new chord to the section
              // For now, just show a placeholder
            }}
          >
            <Plus className="h-6 w-6 text-muted-foreground/50" />
          </Button>
        )}
      </div>
    </div>
  );
};
