
import React from "react";
import DrumMachine from "@/components/music/drum-machine/DrumMachine";
import { motion } from "framer-motion";

const DrumMachinePage: React.FC = () => {
  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-background to-accent/10">
     
      <div className="container max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-4"
        >
          <DrumMachine />
          
        </motion.div>
      </div>
    </div>
  );
};

export default DrumMachinePage;
