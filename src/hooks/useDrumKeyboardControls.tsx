
import { useEffect, useCallback } from 'react';

interface DrumKeyboardControlsProps {
  playing: boolean;
  startStop: () => void;
  clearPattern: () => void;
  createBasicPattern: () => void;
  adjustBpm: (amount: number) => void;
  toggleRecording?: () => void;
  togglePlayRecording?: () => void;
}

export const useDrumKeyboardControls = ({
  playing,
  startStop,
  clearPattern,
  createBasicPattern,
  adjustBpm,
  toggleRecording,
  togglePlayRecording
}: DrumKeyboardControlsProps) => {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return; // Don't trigger when typing in form elements
    }
    
    switch (event.code) {
      case 'Space':
        event.preventDefault();
        startStop();
        break;
      case 'KeyC':
        clearPattern();
        break;
      case 'KeyB':
        createBasicPattern();
        break;
      case 'ArrowUp':
        adjustBpm(5);
        break;
      case 'ArrowDown':
        adjustBpm(-5);
        break;
      case 'KeyR':
        if (toggleRecording) {
          toggleRecording();
        }
        break;
      case 'KeyP':
        if (togglePlayRecording) {
          togglePlayRecording();
        }
        break;
    }
  }, [startStop, clearPattern, createBasicPattern, adjustBpm, toggleRecording, togglePlayRecording]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  return {
    isPlaying: playing
  };
};
