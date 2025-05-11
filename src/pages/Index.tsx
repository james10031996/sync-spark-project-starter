
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold mb-6">Music Tools</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Interactive music tools for playing and creating music
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-xl mx-auto">
          <Link to="/chord-player">
            <Button variant="default" className="w-full text-lg py-6">
              Chord Player
            </Button>
          </Link>
          
          <Link to="/drum-machine">
            <Button variant="default" className="w-full text-lg py-6">
              Drum Machine
            </Button>
          </Link>
          
          <Link to="/metronome">
            <Button variant="default" className="w-full text-lg py-6">
              Metronome
            </Button>
          </Link>
        </div>
        
        <p className="mt-12 text-sm text-muted-foreground">
          All tools work with keyboard shortcuts and are fully responsive
        </p>
      </div>
    </div>
  );
};

export default Index;
