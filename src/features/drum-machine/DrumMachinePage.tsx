
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DrumMachine } from "./components/DrumMachine";
import { motion } from "framer-motion";
import { Helmet } from 'react-helmet';

const DrumMachinePage: React.FC = () => {
  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-background to-accent/10">
      <Helmet>
        <title>Online Drum Machine | Free Beat Creator</title>
        <meta name="description" content="Create beats with our free online drum machine. Choose from multiple drum kits, adjust tempo, and record your beats in real-time." />
        <meta name="keywords" content="drum machine, beat maker, online drums, rhythm creator, free drum tool, beat sequencer, music production, drum patterns, drum loops, electronic drums, sampler, percussion sequencer" />
        <meta property="og:title" content="Online Drum Machine | Free Beat Creator" />
        <meta property="og:description" content="Create beats with our free online drum machine. Choose from multiple drum kits, adjust tempo, and record your beats." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://musictools.app/drum-machine" />
      </Helmet>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute top-4 right-4"
      >
        <ThemeToggle />
      </motion.div>
      
      <div className="container mx-auto">
        <motion.header 
          className="mb-8 flex justify-between items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1 
            className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Drum Machine
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link to="/">
              <Button 
                variant="outline" 
                className="transition-all hover:scale-105 border-primary/20 hover:border-primary/50 hover:bg-primary/5"
              >
                Back to Home
              </Button>
            </Link>
          </motion.div>
        </motion.header>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <DrumMachine />
        </motion.div>
        
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="text-muted-foreground">
            Create rhythms with our interactive drum machine.
            <br />
            Adjust tempo, change kits, and create complex patterns.
          </p>
          <motion.div 
            className="flex justify-center gap-4 mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <Link to="/chord-progression">
              <Button 
                variant="outline" 
                className="transition-all hover:scale-105 hover:bg-primary/10 border-primary/20"
              >
                Chord Progression Player
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default DrumMachinePage;
