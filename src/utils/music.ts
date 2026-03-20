export type NoteName = string;

export const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const KEY_CENTERS = [
  'C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'
];

export interface ViolinNote {
  pitch: number; // MIDI pitch (e.g. C4 = 60)
  frequency: number;
}

export const SCALES = {
  Major: [0, 2, 4, 5, 7, 9, 11],
  NaturalMinor: [0, 2, 3, 5, 7, 8, 10],
  HarmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  MelodicMinor: [0, 2, 3, 5, 7, 9, 11],
  PentatonicMajor: [0, 2, 4, 7, 9],
  PentatonicMinor: [0, 3, 5, 7, 10],
};

export const ARPEGGIOS = {
  MajorTriad: [0, 4, 7],
  MinorTriad: [0, 3, 7],
  Diminished: [0, 3, 6],
  Augmented: [0, 4, 8],
  Dominant7th: [0, 4, 7, 10],
  Major7th: [0, 4, 7, 11],
  Minor7th: [0, 3, 7, 10],
};

export const VIOLIN_STRINGS = [
  { name: 'G', pitch: 55, octave: 3 },
  { name: 'D', pitch: 62, octave: 4 },
  { name: 'A', pitch: 69, octave: 4 },
  { name: 'E', pitch: 76, octave: 5 },
];

export function getFeatureDisplayNames(dict: Record<string, number[]>): string[] {
  return Object.keys(dict).map(k => k.replace(/([A-Z])/g, ' $1').trim());
}

export function getPitchClass(note: string): number {
  let i = SHARP_NOTES.indexOf(note);
  if (i === -1) i = FLAT_NOTES.indexOf(note);
  return i;
}

export function isFlatKey(key: string): boolean {
  return ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'].includes(key);
}

export function getNoteName(pitch: number, rootKey: string): string {
  const pitchClass = pitch % 12;
  const names = isFlatKey(rootKey) ? FLAT_NOTES : SHARP_NOTES;
  return names[pitchClass];
}

export function getPitchClassesInScale(root: string, intervals: number[]): number[] {
  const rootClass = getPitchClass(root);
  return intervals.map(interval => (rootClass + interval) % 12);
}

export function getFrequency(pitch: number): number {
  return 440 * Math.pow(2, (pitch - 69) / 12);
}

export function generateStringNotes(basePitch: number, maxFrets: number = 24): ViolinNote[] {
  const notes: ViolinNote[] = [];
  for (let i = 0; i <= maxFrets; i++) {
    const pitch = basePitch + i;
    notes.push({
      pitch,
      frequency: getFrequency(pitch)
    });
  }
  return notes;
}
