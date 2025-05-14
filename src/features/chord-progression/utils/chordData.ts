
// Shared data for the chord progression player

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
  'Blues I-IV-V': [
    { root: 'C', type: '7' },
    { root: 'F', type: '7' },
    { root: 'G', type: '7' },
    { root: 'C', type: '7' },
  ],
  '50s I-vi-IV-V': [
    { root: 'C', type: 'major' },
    { root: 'A', type: 'minor' },
    { root: 'F', type: 'major' },
    { root: 'G', type: 'major' },
  ],
  'Funk I-IV-V': [
    { root: 'D', type: '7' },
    { root: 'G', type: '7' },
    { root: 'A', type: '7' },
    { root: 'D', type: '7' },
  ],
  'Rock I-V-VI-IV': [
    { root: 'E', type: 'major' },
    { root: 'B', type: 'major' },
    { root: 'C#', type: 'minor' },
    { root: 'A', type: 'major' },
  ],
  'Latin i-bVII-bVI-V': [
    { root: 'A', type: 'minor' },
    { root: 'G', type: 'major' },
    { root: 'F', type: 'major' },
    { root: 'E', type: '7' },
  ],
  'Soul ii-V-I': [
    { root: 'D', type: 'min7' },
    { root: 'G', type: '7' },
    { root: 'C', type: 'maj7' },
    { root: 'C', type: 'maj7' },
  ],
};

// Define available instruments
export const availableInstruments: Record<string, { name: string; type: string }> = {
  piano: { name: "Piano", type: "keyboard" },
  acousticPiano: { name: "Acoustic Piano", type: "keyboard" },
  electricPiano: { name: "Electric Piano", type: "keyboard" },
  organ: { name: "Organ", type: "keyboard" },
  synth: { name: "Synth", type: "keyboard" },
  guitar: { name: "Guitar", type: "string" },
  acousticGuitar: { name: "Acoustic Guitar", type: "string" },
  electricGuitar: { name: "Electric Guitar", type: "string" },
  bass: { name: "Bass", type: "string" },
  acousticBass: { name: "Acoustic Bass", type: "string" },
  electricBass: { name: "Electric Bass", type: "string" },
  drums: { name: "Drums", type: "percussion" },
  strings: { name: "Strings", type: "orchestral" },
  brass: { name: "Brass", type: "orchestral" },
  saxophone: { name: "Saxophone", type: "woodwind" },
  flute: { name: "Flute", type: "woodwind" },
};
