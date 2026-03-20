import React from 'react';
import { KEY_CENTERS, SCALES, ARPEGGIOS } from '../utils/music';
import { PLAYING_POSITIONS, type PositionName } from '../utils/positions';
import './Controls.css';

interface Props {
  selectedKey: string;
  onKeyChange: (k: string) => void;
  selectedScale: string;
  onScaleChange: (s: string) => void;
  selectedArpeggio: string;
  onArpeggioChange: (a: string) => void;
  selectedPosition: PositionName;
  onPositionChange: (p: PositionName) => void;
  disabled?: boolean;
}

export const Controls: React.FC<Props> = ({
  selectedKey, onKeyChange,
  selectedScale, onScaleChange,
  selectedArpeggio, onArpeggioChange,
  selectedPosition, onPositionChange,
  disabled
}) => {
  return (
    <div className="controls-container glass-panel">
      <div className="control-group">
        <label>Key Center</label>
        <select value={selectedKey} onChange={e => onKeyChange(e.target.value)}>
          {KEY_CENTERS.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div className={`control-group ${disabled ? 'disabled-control' : ''}`}>
        <label>Scale</label>
        <select value={selectedScale} onChange={e => onScaleChange(e.target.value)} disabled={disabled}>
          {Object.keys(SCALES).map(s => <option key={s} value={s}>{s.replace(/([A-Z])/g, ' $1').trim()}</option>)}
        </select>
      </div>

      <div className={`control-group ${disabled ? 'disabled-control' : ''}`}>
        <label>Highlight Arpeggio</label>
        <select value={selectedArpeggio} onChange={e => onArpeggioChange(e.target.value)} disabled={disabled}>
          <option value="None">None</option>
          {Object.keys(ARPEGGIOS).map(a => <option key={a} value={a}>{a.replace(/([A-Z])/g, ' $1').trim()}</option>)}
        </select>
      </div>

      <div className="control-group">
        <label>Hand Position</label>
        <select value={selectedPosition} onChange={e => onPositionChange(e.target.value as PositionName)}>
          {PLAYING_POSITIONS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
        </select>
      </div>
    </div>
  );
};
