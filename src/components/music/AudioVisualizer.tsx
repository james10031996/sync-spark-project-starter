
import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  audioContext: AudioContext | null;
  isPlaying: boolean;
  className?: string;
  height?: number;
  barColor?: string;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  audioContext,
  isPlaying,
  className = '',
  height = 40,
  barColor = 'currentColor',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!audioContext) return;
    
    // Create analyzer if it doesn't exist
    if (!analyzerRef.current) {
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      
      // Connect analyzer to audio context destination
      const destination = audioContext.destination;
      analyzer.connect(destination);
      
      // Store analyzer
      analyzerRef.current = analyzer;
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioContext]);

  useEffect(() => {
    if (!isPlaying || !analyzerRef.current || !canvasRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyzer = analyzerRef.current;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!ctx) return;
      
      animationRef.current = requestAnimationFrame(draw);
      analyzer.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = barColor;

      const barWidth = canvas.width / bufferLength;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        const x = i * barWidth;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, barColor]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`w-full ${className}`} 
      height={height}
      style={{ height: `${height}px` }}
    />
  );
};

export default AudioVisualizer;
