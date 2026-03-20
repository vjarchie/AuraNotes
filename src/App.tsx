import { useState, useMemo, useEffect, useRef } from 'react';
import { Controls } from './components/Controls';
import { Fingerboard } from './components/Fingerboard';
import { PlaybackControls } from './components/PlaybackControls';
import { SheetViewer } from './components/SheetViewer';
import { SCALES, ARPEGGIOS, getPitchClassesInScale } from './utils/music';
import { getLowestTonicPitch, getScaleSequence } from './utils/playback';
import { PLAYING_POSITIONS, isNotePlayableInPosition, type PositionName } from './utils/positions';
import { getSampler } from './utils/sampler';
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

  const [octaves, setOctaves] = useState(1);
  const [tempo, setTempo] = useState(60);
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingNotePitch, setPlayingNotePitch] = useState<number | null>(null);

  const playbackTimerRef = useRef<number | null>(null);

  const activePitchClasses = useMemo(() => {
    if (selectedKey === 'None') {
      return new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    }

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
    if (selectedKey === 'None') return [];

    let intervals = SCALES[selectedScale as keyof typeof SCALES];
    if (selectedArpeggio !== 'None') {
      intervals = ARPEGGIOS[selectedArpeggio as keyof typeof ARPEGGIOS];
    }
    
    if (!intervals) return [];
    
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const flats = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    let rootClass = names.indexOf(selectedKey);
    if (rootClass === -1) rootClass = flats.indexOf(selectedKey);
    
    const basePitch = getLowestTonicPitch(rootClass);
    return getScaleSequence(basePitch, intervals, octaves);
  }, [selectedKey, selectedScale, selectedArpeggio, octaves]);

  useEffect(() => {
    if (isPlaying) {
      let index = 0;
      const intervalMs = (60 / tempo) * 1000;
      
      playbackTimerRef.current = window.setInterval(() => {
        if (index >= playbackSequence.length) {
          index = 0; 
        }
        
        const currentPitch = playbackSequence[index];
        setPlayingNotePitch(currentPitch);
        playSynthTone(currentPitch);
        shiftPositionIfNeeded(currentPitch);

        index++;
      }, intervalMs);
      
    } else {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
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
         const canPlay = frets.   some(f => f >= 0 && isNotePlayableInPosition(f, pos.name));
         if (canPlay) return pos.name;
       }
       return prev;
    });
  };

  const handleNoteClick = (pitch: number) => {
    if (isPlaying) setIsPlaying(false);
    setPlayingNotePitch(pitch);
    playSynthTone(pitch);
  };

  const playSynthTone = (pitch: number) => {
    try {
      const audioCtx = getAudioContext();
      const sampler = getSampler(audioCtx);
      sampler.setVolume(volume);
      sampler.play(pitch);
    } catch (e) {
      console.error("Audio playback error", e);
    }
  };

  return (
    <div className="app-layout">
      
      {/* Left Pane - Purely visual instrument representation */}
      <div className="left-pane">
        <Fingerboard 
          activePitchClasses={activePitchClasses}
          rootNote={selectedKey}
          position={selectedPosition}
          playingNotePitch={playingNotePitch}
          onNoteClick={handleNoteClick}
        />
      </div>

      {/* Right Pane - Operations and Dashboard */}
      <div className="right-pane">
        <header className="app-header glass-panel">
          <div className="logo-container">
            <img src="./logo.png" alt="Aura Notes" className="app-logo" />
          </div>
          <p>Interactive Fingerboard & Scale Explorer</p>
        </header>

        <Controls 
          selectedKey={selectedKey} onKeyChange={setSelectedKey}
          selectedScale={selectedScale} onScaleChange={setSelectedScale}
          selectedArpeggio={selectedArpeggio} onArpeggioChange={setSelectedArpeggio}
          selectedPosition={selectedPosition} onPositionChange={setSelectedPosition}
          disabled={selectedKey === 'None'}
        />
        
        <PlaybackControls 
           octaves={octaves} onOctavesChange={setOctaves}
           tempo={tempo} onTempoChange={setTempo}
           volume={volume} onVolumeChange={setVolume}
           isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)}
        />

        <SheetViewer notePitch={playingNotePitch} rootKey={selectedKey} scale={selectedScale} />
      </div>

    </div>
  );
}

export default App;
