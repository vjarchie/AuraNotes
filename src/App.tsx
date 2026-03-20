import { useState, useMemo, useEffect, useRef } from 'react';
import { Controls } from './components/Controls';
import { Fingerboard } from './components/Fingerboard';
import { PlaybackControls } from './components/PlaybackControls';
import { SheetViewer } from './components/SheetViewer';
import { SCALES, ARPEGGIOS, getPitchClassesInScale, getFrequency } from './utils/music';
import { getLowestTonicPitch, getScaleSequence } from './utils/playback';
import { PLAYING_POSITIONS, isNotePlayableInPosition, type PositionName } from './utils/positions';
import './App.css';
import './components/Playback.css';

const getAudioContext = (() => {
  let ctx: AudioContext | null = null;
  return () => {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
})();

function App() {
  const [selectedKey, setSelectedKey] = useState<string>('G');
  const [selectedScale, setSelectedScale] = useState<string>('Major');
  const [selectedArpeggio, setSelectedArpeggio] = useState<string>('None');
  const [selectedPosition, setSelectedPosition] = useState<PositionName>('1st Position');

  // Auto-play state
  const [octaves, setOctaves] = useState(1);
  const [tempo, setTempo] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingNotePitch, setPlayingNotePitch] = useState<number | null>(null);

  const playbackTimerRef = useRef<number | null>(null);

  const activePitchClasses = useMemo(() => {
    let pitchClasses = new Set<number>();
    
    const scaleIntervals = SCALES[selectedScale as keyof typeof SCALES];
    if (scaleIntervals) {
      getPitchClassesInScale(selectedKey, scaleIntervals).forEach(pc => pitchClasses.add(pc));
    }

    if (selectedArpeggio !== 'None') {
      const arpeggioIntervals = ARPEGGIOS[selectedArpeggio as keyof typeof ARPEGGIOS];
      if (arpeggioIntervals) {
        pitchClasses = new Set(getPitchClassesInScale(selectedKey, arpeggioIntervals));
      }
    }

    return pitchClasses;
  }, [selectedKey, selectedScale, selectedArpeggio]);

  const playbackSequence = useMemo(() => {
    const scaleIntervals = SCALES[selectedScale as keyof typeof SCALES];
    if (!scaleIntervals) return [];
    
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const flats = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    let rootClass = names.indexOf(selectedKey);
    if (rootClass === -1) rootClass = flats.indexOf(selectedKey);
    
    const basePitch = getLowestTonicPitch(rootClass);
    return getScaleSequence(basePitch, scaleIntervals, octaves);
  }, [selectedKey, selectedScale, octaves]);

  // Auto Playback Engine
  useEffect(() => {
    if (isPlaying) {
      let index = 0;
      const intervalMs = (60 / tempo) * 1000;
      
      playbackTimerRef.current = window.setInterval(() => {
        if (index >= playbackSequence.length) {
          index = 0; // Loop the sequence indefinitely until stopped
        }
        
        const currentPitch = playbackSequence[index];
        setPlayingNotePitch(currentPitch);
        playSynthTone(getFrequency(currentPitch));
        shiftPositionIfNeeded(currentPitch);

        index++;
      }, intervalMs);
      
    } else {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
      // If not playing rhythmically, we don't clear playingNotePitch immediately 
      // if we want it to stay highlighted after click. But typical auto-play stops clear it.
      if (isPlaying === false) setPlayingNotePitch(null); 
    }
    
    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, tempo, playbackSequence]);

  const shiftPositionIfNeeded = (pitch: number) => {
    setSelectedPosition(prev => {
       const frets = [pitch - 76, pitch - 69, pitch - 62, pitch - 55];
       const isPlayable = frets.some(f => f >= 0 && isNotePlayableInPosition(f, prev));
       if (isPlayable) return prev;

       for (const pos of PLAYING_POSITIONS) {
         if (pos.name === 'All') continue;
         const canPlay = frets.some(f => f >= 0 && isNotePlayableInPosition(f, pos.name));
         if (canPlay) return pos.name;
       }
       return prev;
    });
  };

  const handleNoteClick = (pitch: number) => {
    // If auto-playing, stop it to take manual control
    if (isPlaying) setIsPlaying(false);
    setPlayingNotePitch(pitch);
    playSynthTone(getFrequency(pitch));
  };

  const playSynthTone = (freq: number) => {
    try {
      const audioCtx = getAudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sawtooth';
      oscillator.frequency.value = freq;

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 1.5);
    } catch (e) {
      console.error("Audio playback error", e);
    }
  };

  return (
    <div className="app-layout">
      <header className="app-header glass-panel">
        <h1>Aura Notes</h1>
        <p>Interactive Fingerboard & Scale Explorer</p>
      </header>

      <main className="app-content">
        <Controls 
          selectedKey={selectedKey} onKeyChange={setSelectedKey}
          selectedScale={selectedScale} onScaleChange={setSelectedScale}
          selectedArpeggio={selectedArpeggio} onArpeggioChange={setSelectedArpeggio}
          selectedPosition={selectedPosition} onPositionChange={setSelectedPosition}
        />
        
        <PlaybackControls 
           octaves={octaves} onOctavesChange={setOctaves}
           tempo={tempo} onTempoChange={setTempo}
           isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)}
        />

        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
          <Fingerboard 
            activePitchClasses={activePitchClasses}
            rootNote={selectedKey}
            position={selectedPosition}
            playingNotePitch={playingNotePitch}
            onNoteClick={handleNoteClick}
          />
          <SheetViewer notePitch={playingNotePitch} rootKey={selectedKey} scale={selectedScale} />
        </div>
      </main>
    </div>
  );
}

export default App;
