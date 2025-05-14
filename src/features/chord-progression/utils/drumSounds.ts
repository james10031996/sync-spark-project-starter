
// Drum sound utilities

// Play snare drum with style variations
export const playSnare = (
  context: AudioContext, 
  masterGain: GainNode, 
  volume: number, 
  brushed: boolean, 
  style: string
) => {
  const now = context.currentTime;
  
  // Create noise for snare
  const noiseBuffer = context.createBuffer(1, context.sampleRate * 0.2, context.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  for (let i = 0; i < output.length; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  const noise = context.createBufferSource();
  noise.buffer = noiseBuffer;
  
  // Create filter and envelope for snare sound
  const filter = context.createBiquadFilter();
  
  if (brushed) {
    filter.type = "bandpass";
    filter.frequency.value = 2000;
    filter.Q.value = 0.5;
  } else {
    filter.type = "highpass";
    filter.frequency.value = 1000;
  }
  
  const snareGain = context.createGain();
  snareGain.gain.setValueAtTime(volume, now);
  
  // Different decay based on style and brushed parameter
  if (brushed) {
    snareGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
  } else {
    snareGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  }
  
  // Add a body tone for realistic snare
  const osc = context.createOscillator();
  osc.type = "triangle";
  osc.frequency.value = 180;
  
  const oscGain = context.createGain();
  oscGain.gain.setValueAtTime(volume * 0.5, now);
  oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  
  // Connect all nodes
  noise.connect(filter);
  filter.connect(snareGain);
  snareGain.connect(masterGain);
  
  osc.connect(oscGain);
  oscGain.connect(masterGain);
  
  // Start and stop
  noise.start(now);
  noise.stop(now + 0.2);
  osc.start(now);
  osc.stop(now + 0.2);
};

// Play hi-hat with style variations
export const playHiHat = (
  context: AudioContext, 
  masterGain: GainNode, 
  volume: number, 
  open: boolean, 
  style: string
) => {
  const now = context.currentTime;
  
  // Create noise for hi-hat
  const noiseBuffer = context.createBuffer(1, context.sampleRate * 0.2, context.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  for (let i = 0; i < output.length; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  const noise = context.createBufferSource();
  noise.buffer = noiseBuffer;
  
  // Create filter for hi-hat sound
  const filter = context.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 7000;
  
  const hihatGain = context.createGain();
  hihatGain.gain.setValueAtTime(volume, now);
  
  // Different decay based on open/closed and style
  if (open) {
    hihatGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
  } else {
    hihatGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
  }
  
  // Connect nodes
  noise.connect(filter);
  filter.connect(hihatGain);
  hihatGain.connect(masterGain);
  
  // Start and stop
  noise.start(now);
  noise.stop(now + (open ? 0.4 : 0.1));
};

// Play conga with style variations (for Latin style)
export const playConga = (
  context: AudioContext, 
  masterGain: GainNode, 
  volume: number, 
  style: string
) => {
  const now = context.currentTime;
  
  // Create oscillator for conga
  const osc = context.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 200 + Math.random() * 50;
  osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
  
  const congaGain = context.createGain();
  congaGain.gain.setValueAtTime(volume, now);
  congaGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
  
  // Connect nodes
  osc.connect(congaGain);
  congaGain.connect(masterGain);
  
  // Start and stop
  osc.start(now);
  osc.stop(now + 0.3);
};

// Enhanced drum sounds based on style
export const playEnhancedDrumSound = (
  context: AudioContext, 
  masterGain: GainNode, 
  volume: number,
  style: string,
  styleVariations: any = {}
) => {
  // Time offset for creating rhythmic patterns
  const now = context.currentTime;
  const kickVolume = 0.8 * (volume / 100);
  const snareVolume = 0.6 * (volume / 100);
  const hihatVolume = 0.4 * (volume / 100);
  
  // Improved kick drum
  const kickOsc = context.createOscillator();
  const kickGain = context.createGain();
  
  // Style-specific kick drum
  if (style === "Rock") {
    kickOsc.frequency.value = 80;
    kickOsc.type = "square";
  } else if (style === "Jazz") {
    kickOsc.frequency.value = 110;
    kickOsc.type = "sine";
  } else {
    kickOsc.frequency.value = 100;
    kickOsc.type = "triangle";
  }
  
  kickOsc.frequency.exponentialRampToValueAtTime(0.01, now + 0.4);
  
  kickGain.gain.setValueAtTime(kickVolume, now);
  kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
  
  kickOsc.connect(kickGain);
  kickGain.connect(masterGain);
  
  kickOsc.start(now);
  kickOsc.stop(now + 0.4);
  
  // Style-specific drum patterns
  switch(style) {
    case "Rock":
      // Heavy kick and snare
      setTimeout(() => {
        playSnare(context, masterGain, snareVolume * 1.2, false, style);
      }, 250);
      break;
    case "Funk":
      // Syncopated hi-hat pattern
      setTimeout(() => {
        playHiHat(context, masterGain, hihatVolume * 0.7, false, style);
      }, 100);
      setTimeout(() => {
        playHiHat(context, masterGain, hihatVolume, false, style);
      }, 200);
      setTimeout(() => {
        playSnare(context, masterGain, snareVolume, false, style);
      }, 250);
      setTimeout(() => {
        playHiHat(context, masterGain, hihatVolume * 0.7, false, style);
      }, 350);
      break;
    case "Jazz":
      // Brushed snare and light hi-hat
      setTimeout(() => {
        playHiHat(context, masterGain, hihatVolume * 0.5, false, style);
      }, 125);
      setTimeout(() => {
        playSnare(context, masterGain, snareVolume * 0.7, true, style);
      }, 250);
      setTimeout(() => {
        playHiHat(context, masterGain, hihatVolume * 0.4, false, style);
      }, 375);
      break;
    case "Latin":
      // Percussion heavy
      setTimeout(() => {
        playConga(context, masterGain, 0.4 * (volume / 100), style);
      }, 150);
      setTimeout(() => {
        playHiHat(context, masterGain, hihatVolume * 0.6, false, style);
      }, 250);
      setTimeout(() => {
        playConga(context, masterGain, 0.3 * (volume / 100), style);
      }, 350);
      break;
    default:
      // Simple kick and hihat
      setTimeout(() => {
        playHiHat(context, masterGain, hihatVolume, false, style);
      }, 200);
  }
};
