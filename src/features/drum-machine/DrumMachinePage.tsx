
import React from 'react';
import { DrumMachine } from "./components/DrumMachine";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const DrumMachinePage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Drum Machine</CardTitle>
          <CardDescription>
            Create your own beats with this 16-step drum sequencer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DrumMachine />
        </CardContent>
      </Card>
    </div>
  );
};

export default DrumMachinePage;
