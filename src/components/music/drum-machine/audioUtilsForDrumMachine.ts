// Enhanced drum sound generation functions
export const createEnhancedDrumSound = async (type: string, context: AudioContext): Promise<AudioBuffer> => {
  // Create a buffer for the sound
  let buffer: AudioBuffer;
  const sampleRate = context.sampleRate;
  
  switch (type) {


    case "tom": {
  buffer = context.createBuffer(2, sampleRate * 0.6, sampleRate);
  const dataLeft = buffer.getChannelData(0);
  const dataRight = buffer.getChannelData(1);

  for (let i = 0; i < dataLeft.length; i++) {
    const t = i / sampleRate;
    const freq = 120 * Math.exp(-6 * t); // tom pitch drop
    const sound = Math.sin(2 * Math.PI * freq * t) * Math.exp(-5 * t);
    dataLeft[i] = sound;
    dataRight[i] = sound * 0.98; // slight stereo diff
  }
  break;
}

case "ride": {
  buffer = context.createBuffer(2, sampleRate * 1.2, sampleRate);
  const dataLeft = buffer.getChannelData(0);
  const dataRight = buffer.getChannelData(1);

  for (let i = 0; i < dataLeft.length; i++) {
    const t = i / sampleRate;
    const metallic = Math.sin(2 * Math.PI * 8000 * t + Math.random()) * Math.exp(-2 * t);
    const shimmer = (Math.random() * 2 - 1) * Math.exp(-5 * t) * 0.2;
    dataLeft[i] = metallic + shimmer;
    dataRight[i] = (metallic + shimmer) * 0.97;
  }
  break;
}

case "piano": {
  buffer = context.createBuffer(2, sampleRate * 1, sampleRate);
  const dataLeft = buffer.getChannelData(0);
  const dataRight = buffer.getChannelData(1);

  for (let i = 0; i < dataLeft.length; i++) {
    const t = i / sampleRate;
    const note = Math.sin(2 * Math.PI * 261.63 * t) * Math.exp(-4 * t); // Middle C
    dataLeft[i] = note;
    dataRight[i] = note * 0.98;
  }
  break;
}

case "synth": {
  buffer = context.createBuffer(2, sampleRate * 0.5, sampleRate);
  const dataLeft = buffer.getChannelData(0);
  const dataRight = buffer.getChannelData(1);

  for (let i = 0; i < dataLeft.length; i++) {
    const t = i / sampleRate;
    const stab = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-8 * t); // A4
    dataLeft[i] = stab;
    dataRight[i] = stab * 1.02;
  }
  break;
}


    case "kick": {
  buffer = context.createBuffer(1, sampleRate * 0.5, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate;
    data[i] = Math.sin(2 * Math.PI * 100 * t) * Math.exp(-10 * t);
  }
  break;
}

    case "snare": {
      // Completely redesigned snare to be distinctly different from clap
      buffer = context.createBuffer(2, sampleRate * 0.4, sampleRate);
      const dataLeft = buffer.getChannelData(0);
      const dataRight = buffer.getChannelData(1);
      
      // Create a snare with more "crack" and drum body resonance
      for (let i = 0; i < dataLeft.length; i++) {
        const t = i / sampleRate;
        
        // Sharper initial attack 
        const snapEnv = Math.exp(-200 * t);
        const snap = (Math.random() * 2 - 1) * snapEnv * 0.9;
        
        // Drum body component with specific resonant frequencies
        const bodyEnv = Math.exp(-35 * t);
        const body1 = Math.sin(2 * Math.PI * 180 * t) * bodyEnv * 0.5;
        const body2 = Math.sin(2 * Math.PI * 330 * t) * bodyEnv * 0.3;
        
        // Noise component with different filtering than clap
        const noise = (Math.random() * 2 - 1);
        const noiseHP = noise - (Math.random() * 2 - 1) * 0.2;
        const noiseEnv = Math.exp(-t * 20);
        
        // Create a "metal snare" character with higher frequency content
        const metallic = Math.sin(2 * Math.PI * 900 * t + Math.random()) * Math.exp(-50 * t) * 0.2;
        
        // Combine for true snare character (very different from clap)
        dataLeft[i] = snap * 0.7 + (body1 + body2) * 0.6 + noiseHP * noiseEnv * 0.5 + metallic;
        
        // Slight stereo variation for width
        dataRight[i] = snap * 0.68 + (body1 * 0.96 + body2 * 1.04) * 0.6 + 
          noiseHP * noiseEnv * 0.52 * (1 + (Math.random() * 0.05 - 0.025)) + metallic * 0.98;
      }
      break;
    }
    case "clap": {
      // Keep clap distinct with more "human hand" character
      buffer = context.createBuffer(2, sampleRate * 0.5, sampleRate);
      const dataLeft = buffer.getChannelData(0);
      const dataRight = buffer.getChannelData(1);
      
      for (let i = 0; i < dataLeft.length; i++) {
        const t = i / sampleRate;
        let env = 0;
        
        // Create multiple staggered transients for "clap" character
        if (t < 0.001) env = t / 0.001;
        else if (t < 0.006) env = 1 - (t - 0.001) / 0.005;
        else if (t < 0.007) env = 0;
        else if (t < 0.008) env = (t - 0.007) / 0.001;
        else if (t < 0.015) env = 1 - (t - 0.008) / 0.007;
        else if (t < 0.016) env = 0;
        else if (t < 0.017) env = (t - 0.016) / 0.001;
        else if (t < 0.025) env = 1 - (t - 0.017) / 0.008;
        else if (t < 0.026) env = 0;
        else if (t < 0.027) env = (t - 0.026) / 0.001;
        
        // More room reverb character - distinctly different from snare
        if (t >= 0.027) env = Math.exp(-(t - 0.027) * 9) * 0.9;
        
        // Higher frequency content for hand clap character
        let noise = 0;
        for (let j = 0; j < 12; j++) {
          noise += Math.sin(2 * Math.PI * (3000 + j * 500) * t * (1 + Math.random() * 0.1)) * 0.08;
        }
        noise += (Math.random() * 2 - 1) * 0.3;
        
        // Apply envelope and compression
        const signal = noise * env;
        const compressed = signal * (1 - Math.max(0, signal - 0.7) * 0.4);
        
        // Very wide stereo for clap character
        dataLeft[i] = compressed * 0.95;
        dataRight[i] = (Math.random() * 2 - 1) * env * 0.9; // Extremely wide stereo
      }
      break;
    }
    case "hihat": {
      // Enhanced hi-hat with more sizzle
      buffer = context.createBuffer(2, sampleRate * 0.2, sampleRate);
      const dataLeft = buffer.getChannelData(0);
      const dataRight = buffer.getChannelData(1);
      
      // Create a better filtered noise
      for (let i = 0; i < dataLeft.length; i++) {
        const t = i / sampleRate;
        
        // Generate metallic noise with more harmonics
        let noise = 0;
        // Add multiple frequency bands for a more metallic sound
        for (let j = 0; j < 8; j++) {
          const freq = 7500 + j * 1500; // Higher frequencies for more sizzle
          noise += Math.sin(2 * Math.PI * freq * t + Math.random() * 0.3) * 0.08;
        }
        
        // Add more white noise
        noise += (Math.random() * 2 - 1) * 0.6;
        
        // Apply snappier envelope
        const env = Math.exp(-t * (t < 0.003 ? 30 : 100));
        
        // Output with more stereo width
        dataLeft[i] = noise * env;
        dataRight[i] = (Math.random() * 2 - 1) * env * 0.6; // More stereo separation
      }
      break;
    }
    default: {
      // Default to a simple tone
      buffer = context.createBuffer(2, sampleRate * 0.2, sampleRate);
      const dataLeft = buffer.getChannelData(0);
      const dataRight = buffer.getChannelData(1);
      
      for (let i = 0; i < dataLeft.length; i++) {
        const t = i / sampleRate;
        const signal = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-10 * t);
        dataLeft[i] = signal;
        dataRight[i] = signal;
      }
    }
  }
  
  return buffer;
};
