
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChordBlock } from "@/components/music/ChordProgressionPlayer/ChordBlock";
import { Plus, Trash, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChordInProgression, ChordSectionData } from "@/components/music/ChordProgressionPlayer/types/chordTypes";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuLabel, 
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
  
  // Group instruments by type for easier selection
  const instrumentsByType: Record<string, Record<string, { name: string }>> = {};
  Object.entries(allInstruments).forEach(([id, details]) => {
    if (!instrumentsByType[details.type]) {
      instrumentsByType[details.type] = {};
    }
    instrumentsByType[details.type][id] = { name: details.name };
  });
  
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
        {sectionIndex + 1} {sectionRepeat > 1 && `(x${sectionRepeat})`}
      </div>
      
      <div className="mb-3 grid grid-cols-1 md:grid-cols-2">
        <div>
          {/* Replace the tooltip trigger with a dropdown menu */}
          <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <Music className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {section.instruments && section.instruments.length > 0 
                    ? `${section.instruments.length} instruments selected` 
                    : "Default instruments"}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Section Instruments</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(instrumentsByType).map(([type, instruments]) => (
                <DropdownMenuGroup key={type}>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">{type}</DropdownMenuLabel>
                  {Object.entries(instruments).map(([id, info]) => (
                    <DropdownMenuItem 
                      key={id} 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSectionInstrument(id);
                      }}
                    >
                      {info.name}
                      <div className={`w-3 h-3 rounded-full ${isInstrumentActive(id) ? 'bg-primary' : 'bg-muted'}`} />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="">
          <div className="flex items-center space-x-2 mr-3">
            <Label className="text-sm">Repeats:</Label>
            <Select 
              value={sectionRepeat.toString()} 
              onValueChange={(val) => updateSectionRepeat(parseInt(val))}
            >
              <SelectTrigger className="w-16 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map(num => (
                  <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
