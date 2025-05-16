
import React from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import ChordProgressionPlayer from "@/components/music/ChordProgressionPlayer/ChordProgressionPlayer";
import { motion } from "framer-motion";
import { ChordProgressionFooter } from "@/components/music/ChordProgressionPlayer/ChordProgressionFooter";
import { CardFooter } from "@/components/ui/card";


const ChordProgressionPage: React.FC = () => {
  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-background to-accent/10">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute top-4 right-4"
      >
        <ThemeToggle />
      </motion.div>
      
      <div className="container max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <ChordProgressionPlayer />
<CardFooter className="border-2 border-black-500 rounded-xl flex flex-col px-0">
  <ChordProgressionFooter className="p-6"/>
</CardFooter>


        </motion.div>
      </div>
    </div>
  );
};

export default ChordProgressionPage;
