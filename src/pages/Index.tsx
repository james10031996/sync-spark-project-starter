
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative bg-gradient-to-br from-background to-accent/20">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-4 right-4">
        <ThemeToggle />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-center max-w-lg z-10">
        <motion.h1 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
        >
          Music Tools
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="text-xl text-muted-foreground mb-12"
        >
          Interactive music tools for playing and creating music
        </motion.p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-xl mx-auto">
          {[
            { name: "Chord Progression", path: "/chord-progression", delay: 0.7 },
            { name: "Drum Machine", path: "/drum-machine", delay: 0.8 },
            { name: "Metronome", path: "/metronome", delay: 0.9 }
          ].map((tool, index) => (
            <Link key={tool.path} to={tool.path}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: tool.delay,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="default" 
                  className="w-full text-lg py-6 bg-gradient-to-br from-primary/90 to-primary/70 hover:from-primary hover:to-primary/80 transition-all duration-300 shadow-lg"
                >
                  {tool.name}
                </Button>
              </motion.div>
            </Link>
          ))}
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.2 }}
          className="mt-12 text-sm text-muted-foreground"
        >
          All tools work with keyboard shortcuts and are fully responsive
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Index;
