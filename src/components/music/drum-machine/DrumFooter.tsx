import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";



export const DrumFooter = () => {

      const [activeTab, setActiveTab] = useState("about");


  return (
    <div className="p-6">
     
        

        <Tabs className="w-full" defaultValue="pattern" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4 grid grid-cols-2">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="tutorial">Tutorial</TabsTrigger>
          </TabsList> 

          <TabsContent value="about">
            <div className="prose dark:prose-invert">
              <h3>About Drum Machine</h3>
              <p>
                The Drum Machine is a 16-step sequencer allowing you to create rhythm patterns with various drum sounds. 
                It's designed to help musicians, producers, and enthusiasts experiment with different drum patterns.
              </p>
              <p>
                This interactive tool enables you to:
              </p>
              <ul className="pl-6 list-disc space-y-1">
                <li>Create custom drum patterns step by step</li>
                <li>Play back patterns at different tempos</li>
                <li>Load preset patterns for various musical styles</li>
                <li>Adjust volume and individual sounds</li>
                <li>Visualize the playback with step indicators</li>
              </ul>
              <p>
                Whether you're creating beats for a song, learning about rhythm, or just having fun, the Drum Machine offers an intuitive interface for rhythm exploration.
              </p>
            </div>
          </TabsContent>

       

          <TabsContent value="tutorial">
            <div className="prose dark:prose-invert">
              <h3>Drum Machine Tutorial</h3>
              
              <div className="mb-4">
                <h4>Getting Started</h4>
                <p>
                  The Drum Machine is organized as a grid where rows represent different drum sounds (Kick, Snare, Hi-Hat, Clap) 
                  and columns represent time steps in the sequence.
                </p>
                <ol className="pl-6 list-decimal space-y-1">
                  <li>Click on any cell in the grid to toggle a sound at that step</li>
                  <li>Press the Start button to hear your pattern play</li>
                  <li>Use the Tempo slider to adjust the playback speed</li>
                </ol>
              </div>
              
              <div className="mb-4">
                <h4>Creating Patterns</h4>
                <p>
                  A standard drum pattern typically consists of:
                </p>
                <ul className="pl-6 list-disc space-y-1">
                  <li>Kick drum on beats 1 and 3 (first and ninth step)</li>
                  <li>Snare on beats 2 and 4 (fifth and thirteenth step)</li>
                  <li>Hi-hat on every other step for a consistent rhythm</li>
                </ul>
                <p>
                  Try loading the "Basic Beat" preset to see this pattern in action.
                </p>
              </div>
              
              <div>
                <h4>Tips for Better Beats</h4>
                <ul className="pl-6 list-disc space-y-1">
                  <li>Start with a simple kick and snare pattern before adding hi-hats</li>
                  <li>Remember that steps 1, 5, 9, and 13 represent the main beats in 4/4 time</li>
                  <li>Use the clap sound sparingly for emphasis</li>
                  <li>Experiment with different tempos to completely change the feel</li>
                  <li>Try the various preset patterns to learn different musical styles</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
  );
};
