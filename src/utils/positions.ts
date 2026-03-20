export type PositionName = '1st Position' | '2nd Position' | '3rd Position' | '4th Position' | '5th Position' | '6th Position' | '7th Position' | 'All';

export interface ViolinPosition {
  name: PositionName;
  startHalfStep: number; // Half steps from the nut
  endHalfStep: number;
}

export const PLAYING_POSITIONS: ViolinPosition[] = [
  { name: '1st Position', startHalfStep: 1, endHalfStep: 6 },
  { name: '2nd Position', startHalfStep: 2, endHalfStep: 7 },
  { name: '3rd Position', startHalfStep: 4, endHalfStep: 9 },
  { name: '4th Position', startHalfStep: 5, endHalfStep: 10 },
  { name: '5th Position', startHalfStep: 7, endHalfStep: 12 },
  { name: '6th Position', startHalfStep: 9, endHalfStep: 14 },
  { name: '7th Position', startHalfStep: 11, endHalfStep: 16 },
  { name: 'All', startHalfStep: 1, endHalfStep: 24 },
];

export function isNotePlayableInPosition(halfStepFromNut: number, position: PositionName): boolean {
  if (halfStepFromNut === 0) return true;
  if (position === 'All') return true;

  const posInfo = PLAYING_POSITIONS.find(p => p.name === position);
  if (!posInfo) return true;

  return halfStepFromNut >= posInfo.startHalfStep && halfStepFromNut <= posInfo.endHalfStep;
}

export function getFingerBounds(finger: number, position: PositionName): { start: number, end: number } | null {
  const posInfo = PLAYING_POSITIONS.find(p => p.name === position);
  if (!posInfo || position === 'All') return null;

  const startFret = posInfo.startHalfStep + (finger - 1) * 2;
  return { start: startFret, end: startFret + 1 };
}
