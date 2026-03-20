import React from 'react';
import './Controls.css'; // Reuse glass-panel and styles

interface Props {
  octaves: number;
  onOctavesChange: (o: number) => void;
  tempo: number;
  onTempoChange: (t: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const PlaybackControls: React.FC<Props> = ({
  octaves, onOctavesChange,
  tempo, onTempoChange,
  isPlaying, onTogglePlay
}) => {
  return (
    <div className="controls-container glass-panel playback-panel">
      <div className="control-group">
        <label>Octaves</label>
        <select value={octaves} onChange={e => onOctavesChange(parseInt(e.target.value))} disabled={isPlaying}>
          {[1, 2, 3].map(n => <option key={n} value={n}>{n} Octave{n > 1 ? 's' : ''}</option>)}
        </select>
      </div>

      <div className="control-group">
        <label>Tempo (BPM)</label>
        <input 
          type="range" 
          min="40" max="200" step="5" 
          value={tempo} 
          onChange={e => onTempoChange(parseInt(e.target.value))} 
        />
        <span style={{color: 'white', fontWeight: 'bold'}}>{tempo} BPM</span>
      </div>

      <div className="control-group play-button-group">
        <button 
          className={`play-button ${isPlaying ? 'playing' : ''}`}
          onClick={onTogglePlay}
        >
          {isPlaying ? '■ Stop' : '▶ Auto-Play'}
        </button>
      </div>
    </div>
  );
};
