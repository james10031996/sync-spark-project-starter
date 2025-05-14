
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChordBlock } from "@/components/music/ChordBlock";
import { Plus, Trash, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChordInProgression, ChordSectionData } from '../types';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChordSectionProps {
  section: ChordSectionData;
  sectionIndex: number;
  isPlaying: boolean;
  currentChord: number;
  updateChord: (chordIndex: number, chord: ChordInProgression) => void;
  playChord: (chord: ChordInProgression) => void;
  onAddChord: () => void;
  onRemoveSection: () => void;
  allInstruments: Record<string, { name: string, type: string }>;
  updateSectionInstruments: (instruments: string[]) => void;
  sectionRepeat: number;
  updateSectionRepeat: (repeats: number) => void;
}

export const ChordSection: React.FC<ChordSectionProps> = ({
  section,
  sectionIndex,
  isPlaying,
  currentChord,
  updateChord,
  playChord,
  onAddChord,
  onRemoveSection,
  allInstruments,
  updateSectionInstruments,
  sectionRepeat,
  updateSectionRepeat
}) => {
  const [showMenu, setShowMenu] = useState(false);
  
  // Filter only available instruments by type
  const getAvailableInstruments = () => {
    const instrumentsByType: Record<string, Record<string, { name: string }>> = {};
    
    // Only include instruments that are actually functional
    const functionalInstruments = [
      "piano", "acousticPiano", "electricPiano", "organ", "synth",
      "guitar", "acousticGuitar", "electricGuitar", 
      "bass", "acousticBass", "electricBass",
      "drums", "strings", "brass", "saxophone", "flute"
    ];
    
    Object.entries(allInstruments).forEach(([id, details]) => {
      // Only add instruments that are actually functional
      if (functionalInstruments.includes(id)) {
        if (!instrumentsByType[details.type]) {
          instrumentsByType[details.type] = {};
        }
        instrumentsByType[details.type][id] = { name: details.name };
      }
    });
    
    return instrumentsByType;
  };
  
  const instrumentsByType = getAvailableInstruments();
  
  // Check if an instrument is active for this section
  const isInstrumentActive = (instrumentId: string) => {
    return section.instruments?.includes(instrumentId) || false;
  };

  // Toggle an instrument for this section
  const toggleSectionInstrument = (instrumentId: string) => {
    const currentInstruments = section.instruments || [];
    const newInstruments = isInstrumentActive(instrumentId) 
      ? currentInstruments.filter(id => id !== instrumentId)
      : [...currentInstruments, instrumentId];
    
    updateSectionInstruments(newInstruments);
  };
  
  return (
    <div className="relative bg-accent/10 p-4 rounded-lg border border-border/50 transition-all hover:border-border animate-fade-in">
      <div className="absolute -right-2 -top-2 bg-primary/90 backdrop-blur px-2 py-0.5 rounded-full text-sm font-semibold z-10 text-primary-foreground shadow-sm">
        {sectionIndex + 1}
      </div>
      
      <div className="flex justify-between mb-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowMenu(true)}>
                <Music className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {section.instruments && section.instruments.length > 0 
                    ? `${section.instruments.length} instruments selected` 
                    : "No instruments selected"}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Section-specific instruments</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="flex items-center gap-2">
          <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                ⋮
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Section {sectionIndex + 1} Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {Object.entries(instrumentsByType).map(([type, instruments]) => (
                <DropdownMenuGroup key={type}>
                  <DropdownMenuLabel className="text-xs">{type.charAt(0).toUpperCase() + type.slice(1)}</DropdownMenuLabel>
                  {Object.entries(instruments).map(([id, { name }]) => (
                    <DropdownMenuItem 
                      key={id}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSectionInstrument(id);
                      }}
                      className={isInstrumentActive(id) ? "bg-primary/20" : ""}
                    >
                      {isInstrumentActive(id) ? "✓ " : ""}{name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              ))}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onRemoveSection}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" /> Remove Section
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
