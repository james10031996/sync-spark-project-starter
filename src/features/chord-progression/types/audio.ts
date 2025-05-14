
// Define types for the chord progression functionality

// Define chord types 
export interface ChordType {
  id: string;
  name: string;
  symbol: string;
}

// Define a chord in the progression
export interface ChordInProgression {
  root: string;
  type: string;
  instruments?: string[]; // Array of instrument IDs to play this chord with
}

// Define a section of chords
export interface ChordSectionData {
  id: string;
  chords: ChordInProgression[];
  instruments?: string[]; // Section-level instruments
}

// Define types for instruments
export interface Instrument {
  name: string;
  type: string;
}
