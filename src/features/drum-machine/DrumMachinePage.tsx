
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Square } from "lucide-react";
import DrumMachine from './components/DrumMachine';

const DrumMachinePage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Drum Machine</h1>
        <p className="text-lg text-center mb-8 text-muted-foreground">
          Create your own beats with our interactive drum machine.
        </p>
        
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play size={20} className="text-primary" />
              <span>Beat Maker</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DrumMachine />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DrumMachinePage;
