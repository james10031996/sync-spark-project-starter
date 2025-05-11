
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import ChordProgressionPlayer from "@/components/music/ChordProgressionPlayer";

const ChordProgressionPage: React.FC = () => {
  return (
    <div className="min-h-screen py-8 px-4 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="container max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Chord Progression Player</h1>
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </header>
        
        <ChordProgressionPlayer />
        
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Create and play chord progressions with multiple instruments.
            <br />
            Try different styles, add sections, and experiment with your own chord combinations.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Link to="/drum-machine">
              <Button variant="outline">Drum Machine</Button>
            </Link>
            <Link to="/metronome">
              <Button variant="outline">Metronome</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChordProgressionPage;
