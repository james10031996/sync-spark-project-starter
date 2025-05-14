
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import ChordProgressionPlayer from "./components/ChordProgressionPlayer";
import { motion } from "framer-motion";
import { Helmet } from 'react-helmet';

const ChordProgressionPage: React.FC = () => {
  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-background to-accent/10">
      <Helmet>
        <title>Chord Progression Player | Free Online Music Tool</title>
        <meta name="description" content="Create and play chord progressions with our free online chord progression player. Choose from different musical styles, instruments, and customize your sound." />
        <meta name="keywords" content="chord progression, chord player, online music tool, music production, songwriting, chord generator, music theory, music composition, free chord tool, music education" />
        <meta property="og:title" content="Chord Progression Player | Free Online Music Tool" />
        <meta property="og:description" content="Create custom chord progressions with various instruments and styles. Download your compositions as MP3." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://musictools.app/chord-progression" />
      </Helmet>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute top-4 right-4"
      >
        <ThemeToggle />
      </motion.div>
      
      <div className="container max-w-4xl mx-auto">
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
            Chord Progression Player
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
          <ChordProgressionPlayer />
        </motion.div>
        
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="text-muted-foreground">
            Create and play chord progressions with multiple instruments.
            <br />
            Try different styles, add sections, and experiment with your own chord combinations.
          </p>
          <motion.div 
            className="flex justify-center gap-4 mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <Link to="/drum-machine">
              <Button 
                variant="outline" 
                className="transition-all hover:scale-105 hover:bg-primary/10 border-primary/20"
              >
                Drum Machine
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChordProgressionPage;
