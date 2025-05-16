
// Define chord types for the progression player
export const chordTypes = [
  { id: "major", name: "Major", symbol: "" },
  { id: "minor", name: "Minor", symbol: "m" },
  { id: "7", name: "7th", symbol: "7" },
  { id: "maj7", name: "Major 7th", symbol: "maj7" },
  { id: "min7", name: "Minor 7th", symbol: "m7" },
  { id: "dim", name: "Diminished", symbol: "dim" },
  { id: "aug", name: "Augmented", symbol: "aug" },
  { id: "sus2", name: "Sus2", symbol: "sus2" },
  { id: "sus4", name: "Sus4", symbol: "sus4" },
];

// Root notes
export const rootNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Define a chord in the progression
export interface ChordInProgression {
  root: string;
  type: string;
}

// Define a section of chords
export interface ChordSectionData {
  id: string;
  chords: ChordInProgression[];
  instruments?: string[]; // Instruments specific to this section
}

// Common chord progressions for auto-generation
export const commonProgressions = {
  'Pop I-V-vi-IV': [
    { root: 'C', type: 'major' },
    { root: 'G', type: 'major' },
    { root: 'A', type: 'minor' },
    { root: 'F', type: 'major' },
  ],
  'Jazz ii-V-I': [
    { root: 'D', type: 'minor' },
    { root: 'G', type: '7' },
    { root: 'C', type: 'maj7' },
    { root: 'C', type: 'maj7' },
  ],
  '50s I-vi-IV-V': [
    { root: 'C', type: 'major' },
    { root: 'A', type: 'minor' },
    { root: 'F', type: 'major' },
    { root: 'G', type: 'major' },
  ],
  'Blues I-IV-V': [
    { root: 'C', type: '7' },
    { root: 'F', type: '7' },
    { root: 'G', type: '7' },
    { root: 'C', type: '7' },
  ]
};

// Define all available instruments
export const availableInstruments: Record<string, { name: string; type: string }> = {
  piano: { name: "Piano", type: "keyboard" },
  acousticGuitar: { name: "Acoustic Guitar", type: "string" },
  electricGuitar: { name: "Electric Guitar", type: "string" },
  bass: { name: "Bass", type: "string" },
  strings: { name: "Strings", type: "orchestral" },
  synth: { name: "Synth", type: "keyboard" },
  organ: { name: "Organ", type: "keyboard" },
};
