
// Enhanced drum patterns for the drum machine
export interface DrumPattern {
  name: string;
  description: string;
  tempo: number;
  pattern: {
    kick: boolean[];
    snare: boolean[];
    hihat: boolean[];
    openhat: boolean[];
    clap: boolean[];
    tom: boolean[];
    crash: boolean[];
    percussion: boolean[];
  };
}

export const drumPatterns: DrumPattern[] = [
  {
    name: "Basic Rock",
    description: "A standard rock beat with kick on 1 & 3, snare on 2 & 4",
    tempo: 120,
    pattern: {
      kick:       [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
      snare:      [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      hihat:      [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      openhat:    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      clap:       [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      tom:        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      crash:      [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      percussion: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
    }
  },
  {
    name: "Four on the Floor",
    description: "Steady kick drum on every beat with snare on 2 & 4",
    tempo: 128,
    pattern: {
      kick:       [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      snare:      [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      hihat:      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      openhat:    [false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true],
      clap:       [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      tom:        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      crash:      [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      percussion: [false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true]
    }
  },
  {
    name: "Hip Hop",
    description: "Boom bap style beat with swing feel",
    tempo: 90,
    pattern: {
      kick:       [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false],
      snare:      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hihat:      [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      openhat:    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true],
      clap:       [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      tom:        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      crash:      [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      percussion: [false, false, true, false, false, true, false, false, true, false, false, false, false, true, false, false]
    }
  },
  {
    name: "Dance",
    description: "Energetic dance beat with steady kick and offbeat hi-hats",
    tempo: 130,
    pattern: {
      kick:       [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
      snare:      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hihat:      [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true],
      openhat:    [false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true],
      clap:       [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      tom:        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      crash:      [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      percussion: [true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false]
    }
  },
  {
    name: "Trap",
    description: "Modern trap beat with rapid hi-hats and 808-style kicks",
    tempo: 140,
    pattern: {
      kick:       [true, false, false, false, false, false, false, true, false, true, false, false, false, false, false, false],
      snare:      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hihat:      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      openhat:    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true],
      clap:       [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      tom:        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      crash:      [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      percussion: [false, false, false, true, false, true, false, false, true, false, false, false, false, true, false, false]
    }
  },
  {
    name: "Reggae",
    description: "Laid-back reggae beat with emphasis on 2 & 4",
    tempo: 80,
    pattern: {
      kick:       [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
      snare:      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hihat:      [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      openhat:    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      clap:       [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      tom:        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      crash:      [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      percussion: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false]
    }
  },
  {
    name: "Latin",
    description: "Energetic Latin rhythm with complex percussion patterns",
    tempo: 110,
    pattern: {
      kick:       [true, false, false, false, true, false, false, true, true, false, false, false, true, false, false, false],
      snare:      [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      hihat:      [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true],
      openhat:    [false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true],
      clap:       [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      tom:        [false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false],
      crash:      [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      percussion: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false]
    }
  },
  {
    name: "Waltz",
    description: "Classic 3/4 time waltz pattern",
    tempo: 90,
    pattern: {
      kick:       [true, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false],
      snare:      [false, false, false, true, false, false, false, false, false, true, false, false, false, false, false, true],
      hihat:      [false, false, true, false, false, true, false, false, true, false, false, true, false, false, true, false],
      openhat:    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      clap:       [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      tom:        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      crash:      [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      percussion: [false, false, false, false, true, false, false, false, false, false, true, false, false, false, false, true]
    }
  }
];
