import React from 'react';
import { VIOLIN_STRINGS, generateStringNotes, getNoteName, getPitchClass } from '../utils/music';
import { isNotePlayableInPosition, getFingerBounds, type PositionName } from '../utils/positions';
import './Fingerboard.css';

interface Props {
  activePitchClasses: Set<number>;
  rootNote: string;
  position: PositionName;
  playingNotePitch?: number | null;
  onNoteClick: (pitch: number) => void;
}

export const Fingerboard: React.FC<Props> = ({ activePitchClasses, rootNote, position, playingNotePitch, onNoteClick }) => {
  const rootPitchClass = getPitchClass(rootNote);
  const strings = VIOLIN_STRINGS;
  const numFrets = 15; // Extends roughly a 7th position capability

  return (
    <div className="fingerboard-wrapper">
      <div className="fingerboard-grid">
        
        {/* Render Finger Position Overlays behind notes */}
        {position !== 'All' && [1, 2, 3, 4].map(finger => {
          const bounds = getFingerBounds(finger, position);
          if (!bounds) return null;
          // Row calculation: Header = 1, Fret 0 = 2, Fret N = N + 2
          const gridRowStart = bounds.start + 2;
          const gridRowEnd = bounds.end + 3; // css grid end is exclusive

          return (
            <div 
              key={`overlay-${finger}`} 
              className={`finger-overlay finger-overlay-${finger}`} 
              style={{ gridRow: `${gridRowStart} / ${gridRowEnd}`, gridColumn: '2 / 6' }}
            >
              <div className="finger-overlay-label">Finger<br />{finger}</div>
            </div>
          );
        })}

        {/* Render String column headers (G, D, A, E) */}
        {strings.map((stringInfo, idx) => (
          <div key={`header-${stringInfo.name}`} className="grid-header" style={{ gridColumn: idx + 2, gridRow: 1 }}>
            {stringInfo.name}
          </div>
        ))}

        {/* Render Vertical String Lines */}
        {strings.map((stringInfo, idx) => (
           <div 
             key={`line-${stringInfo.name}`} 
             className={`vertical-string-line string-thickness-${idx + 1}`} 
             style={{ gridColumn: idx + 2, gridRow: `2 / span ${numFrets + 1}` }}
           ></div>
        ))}

        {/* Render Nut Fret Line (0th Fret horizontal separator) */}
        <div className="nut-line" style={{ gridColumn: '2 / 6', gridRow: `2 / 3` }}></div>
        
        {/* Render Actual Notes */}
        {strings.map((stringInfo, colIdx) => {
          const notes = generateStringNotes(stringInfo.pitch, numFrets);
          
          return notes.map((note, fretIdx) => {
            const pitchClass = note.pitch % 12;
            const inScale = activePitchClasses.has(pitchClass);
            
            // Do not render note if not in the active scale (except open strings which always exist but gray out)
            if (!inScale && fretIdx !== 0) {
                return null;
            }

            const isPlayable = isNotePlayableInPosition(fretIdx, position);
            const isRoot = rootPitchClass === pitchClass;
            const noteDisplayName = getNoteName(note.pitch, rootNote);
            
            const isPlaying = playingNotePitch === note.pitch;
            
            let markerClass = 'note-marker';
            
            if (inScale && isPlayable) {
                markerClass += ' active';
                if (isRoot) markerClass += ' root';
            } else if (inScale && !isPlayable && fretIdx !== 0) {
                markerClass += ' scale-greyed';
            }
            
            if (isPlaying) {
                markerClass += ' playback-active';
            }
            
            if (fretIdx === 0) {
                markerClass += ` open-string ${inScale ? 'active' : ''} ${isRoot ? 'root' : ''}`;
                if (!inScale) markerClass += ' open-string-inactive';
            }

            return (
              <div 
                key={`${stringInfo.name}-${fretIdx}`} 
                className="fret-cell"
                style={{ gridColumn: colIdx + 2, gridRow: fretIdx + 2 }}
              >
                <div 
                  className={markerClass}
                  onClick={() => onNoteClick(note.pitch)}
                  title={`${noteDisplayName} (Pitch: ${note.pitch})`}
                >
                  <span className="note-label">{noteDisplayName}</span>
                </div>
              </div>
            );
          });
        })}
        
      </div>
    </div>
  );
};
