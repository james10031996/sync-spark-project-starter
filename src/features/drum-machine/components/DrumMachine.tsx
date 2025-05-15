
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Square } from "lucide-react";

const DrumMachine: React.FC = () => {
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(90);
  const [volume, setVolume] = useState(80);

  const togglePlay = () => {
    setPlaying(!playing);
  };

  const handleBpmChange = (value: number[]) => {
    setBpm(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  return (
    <div className="drum-machine p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <Button 
            variant={playing ? "destructive" : "default"} 
            size="lg" 
            className="gap-2"
            onClick={togglePlay}
          >
            {playing ? (
              <>
                <Square size={18} /> Stop
              </>
            ) : (
              <>
                <Play size={18} /> Play
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1 min-w-[150px]">
            <span className="text-sm">Tempo: {bpm} BPM</span>
            <Slider
              value={[bpm]}
              min={60}
              max={180}
              step={1}
              onValueChange={handleBpmChange}
            />
          </div>

          <div className="flex flex-col gap-1 min-w-[150px]">
            <span className="text-sm">Volume: {volume}%</span>
            <Slider
              value={[volume]}
              min={0}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {Array(16).fill(0).map((_, i) => (
          <div 
            key={i}
            className="aspect-square bg-secondary/50 rounded-md flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors"
            onClick={() => console.log(`Drum pad ${i} clicked`)}
          >
            <span className="text-2xl font-bold text-secondary-foreground/70">
              {i + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DrumMachine;
