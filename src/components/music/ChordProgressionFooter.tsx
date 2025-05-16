
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChordProgressionFooterProps {
  className?: string;
}

export const ChordProgressionFooter: React.FC<ChordProgressionFooterProps> = ({ 
  className = "" 
}) => {
  const [activeTab, setActiveTab] = useState("about");

  return (
    <Tabs className={`w-full ${className}`} value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="w-full mb-4 grid grid-cols-3">
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="pattern">Pattern</TabsTrigger>
        <TabsTrigger value="tutorial">Tutorial</TabsTrigger>
      </TabsList>

      <TabsContent value="about">
        <div className="prose dark:prose-invert">
          <h3>About Chord Progression Player</h3>
          <p>
            The Chord Progression Player is a tool designed to help musicians, songwriters, and music enthusiasts experiment with different chord progressions and musical styles.
          </p>
          <p>
            This interactive tool allows you to:
          </p>
          <ul className="pl-6 list-disc space-y-1">
            <li>Play common chord progressions across various musical genres</li>
            <li>Choose from different musical styles such as Pop, Jazz, and Blues</li>
            <li>Customize the instrumentation to hear how progressions sound with different instruments</li>
            <li>Adjust the tempo (BPM) to match your preferred playing speed</li>
            <li>Generate style-specific chord progressions with appropriate instrumentation</li>
          </ul>
        </div>
      </TabsContent>

      <TabsContent value="pattern">
        <div className="prose dark:prose-invert">
          <h3>Musical Patterns</h3>
          
          <div className="mb-4">
            <h4>Pop</h4>
            <p>
              Pop music typically features catchy melodies, simple chord progressions, and a verse-chorus structure. 
              Common chord progressions include I-V-vi-IV (C-G-Am-F in C major).
            </p>
            <p>
              <strong>Recommended instruments:</strong> Piano, Electric Guitar, Bass
            </p>
          </div>
          
          <div className="mb-4">
            <h4>Jazz</h4>
            <p>
              Jazz uses extended harmony with seventh, ninth and thirteenth chords. The ii-V-I progression 
              (Dm7-G7-CMaj7 in C major) is fundamental to jazz harmony.
            </p>
            <p>
              <strong>Recommended instruments:</strong> Piano, Bass, Organ
            </p>
          </div>
          
          <div>
            <h4>Blues</h4>
            <p>
              Blues commonly uses a 12-bar structure with dominant seventh chords. The I-IV-V progression 
              (C7-F7-G7 in C) is the backbone of blues.
            </p>
            <p>
              <strong>Recommended instruments:</strong> Electric Guitar, Bass, Piano
            </p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="tutorial">
        <div className="prose dark:prose-invert">
          <h3>Chord Progression Tutorial</h3>
          
          <div className="mb-4">
            <h4>Basics of Chord Progressions</h4>
            <p>
              A chord progression is a sequence of chords played in a specific order. In Western music, chord progressions provide the harmonic foundation for melodies and are often what gives a song its distinctive feel.
            </p>
          </div>
          
          <div className="mb-4">
            <h4>Common Progressions</h4>
            <ul className="pl-6 space-y-2">
              <li>
                <strong>I-IV-V (1-4-5):</strong> The foundation of blues and rock music. In C major, this would be C-F-G.
              </li>
              <li>
                <strong>I-V-vi-IV (1-5-6-4):</strong> Extremely common in pop music. In C major: C-G-Am-F.
              </li>
              <li>
                <strong>ii-V-I (2-5-1):</strong> The backbone of jazz. In C major: Dm7-G7-Cmaj7.
              </li>
            </ul>
          </div>
          
          <div className="mb-4">
            <h4>Understanding Roman Numerals</h4>
            <p>
              In music theory, Roman numerals indicate the position of a chord within a scale:
            </p>
            <ul className="pl-6 list-disc space-y-1">
              <li>Uppercase (I, IV, V) represents major chords</li>
              <li>Lowercase (ii, iii, vi) represents minor chords</li>
              <li>Numbers relate to the scale degree (I = 1st note of scale, etc.)</li>
            </ul>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ChordProgressionFooter;
