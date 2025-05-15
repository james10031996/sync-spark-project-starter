
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import DrumMachine from "@/components/music/DrumMachine";
import { motion } from "framer-motion";
import { Square } from "lucide-react"; // Replace Stop with Square

const DrumMachinePage: React.FC = () => {
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
          className="mt-4"
        >
          <DrumMachine />
        </motion.div>
      </div>
    </div>
  );
};

export default DrumMachinePage;
