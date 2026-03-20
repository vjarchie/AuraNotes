import React from 'react';
import './Controls.css'; // Reuse glass-panel and styles
import './Playback.css';

interface Props {
  octaves: number;
  onOctavesChange: (o: number) => void;
  tempo: number;
  onTempoChange: (t: number) => void;
  volume: number;
  onVolumeChange: (v: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const PlaybackControls: React.FC<Props> = ({
  octaves, onOctavesChange,
  tempo, onTempoChange,
  volume, onVolumeChange,
  isPlaying, onTogglePlay
}) => {
  return (
    <>
      <div className="controls-container glass-panel playback-panel">
        <div className="control-group">
          <label>Octaves</label>
          <select 
            value={octaves} 
            onChange={e => onOctavesChange(parseInt(e.target.value))} 
            disabled={isPlaying}
          >
            {[1, 2, 3].map(n => (
              <option key={n} value={n}>{n} Octave{n > 1 ? 's' : ''}</option>
            ))}
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

      <div className="controls-container glass-panel" style={{ padding: '1.5rem 2rem', marginTop: '1rem' }}>
        <div className="control-group" style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          gap: '1rem'
        }}>
          <label style={{ minWidth: '120px', margin: 0 }}>Master Volume</label>
          <input 
            type="range" 
            min="0" max="1" step="0.05" 
            value={volume} 
            onChange={e => onVolumeChange(parseFloat(e.target.value))}
            style={{ flex: 1, margin: 0 }} 
          />
          <span style={{color: 'white', fontWeight: 'bold', minWidth: '40px', textAlign: 'right'}}>
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </>
  );
};
