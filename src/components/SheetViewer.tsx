import React, { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Accidental, TickContext } from 'vexflow';
import { getNoteName } from '../utils/music';
import './SheetViewer.css';

interface Props {
  notePitch: number | null; 
  rootKey: string;
  scale: string;
}

export const SheetViewer: React.FC<Props> = ({ notePitch, rootKey, scale }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    if (notePitch === null) {
      containerRef.current.innerHTML = '<div class="empty-sheet">Play or click a note</div>';
      return;
    }

    containerRef.current.innerHTML = '';

    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    renderer.resize(200, 160);
    
    const context = renderer.getContext();
    context.setFont('Arial', 10, '');

    const stave = new Stave(20, 20, 150);
    stave.addClef('treble');
    
    let vexKey = rootKey;
    if (scale.toLowerCase().includes('minor')) vexKey += 'm';
    
    try {
      stave.addKeySignature(vexKey);
    } catch (e) {
      console.warn("Key signature unsupported:", vexKey);
    }
    
    stave.setContext(context).draw();

    const name = getNoteName(notePitch, rootKey); 
    const noteClass = name.toLowerCase();
    
    // Middle C (pitch 60) is C4 in scientific pitch notation, which maps correctly to VexFlow's c/4.
    const octave = Math.floor(notePitch / 12) - 1;
    const vexNoteStr = `${noteClass}/${octave}`;

    try {
      const note = new StaveNote({ keys: [vexNoteStr], duration: "q", clef: "treble" });
      const accidentalMatch = name.match(/[#b]/);
      if (accidentalMatch) {
         note.addModifier(new Accidental(accidentalMatch[0]));
      }

      const tickContext = new TickContext();
      note.setContext(context).setStave(stave);
      tickContext.addTickable(note);
      tickContext.preFormat().setX(50);
      note.draw();
      
      // Make svg background fully transparent so glassmorphism shows
      const svg = containerRef.current.querySelector('svg');
      if (svg) {
        svg.style.backgroundColor = "transparent";
      }
    } catch (e) {
      console.warn("VexFlow error rendering note:", vexNoteStr, e);
      containerRef.current.innerHTML = '<div class="empty-sheet">Note out of standard ledger range</div>';
    }

  }, [notePitch, rootKey]);

  return (
    <div className="sheet-viewer-container glass-panel">
      <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: 'var(--accent-color)', textTransform: 'uppercase' }}>
        Active Note ({rootKey} {scale})
      </h3>
      <div ref={containerRef} className="vexflow-canvas"></div>
    </div>
  );
};
