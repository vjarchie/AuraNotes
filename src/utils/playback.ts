export function getLowestTonicPitch(rootClass: number): number {
  let p = 55;
  while (p % 12 !== rootClass) {
    p++;
  }
  return p;
}

export function getScaleSequence(rootPitch: number, scaleIntervals: number[], octaves: number): number[] {
  const sequence: number[] = [];
  for (let oct = 0; oct < octaves; oct++) {
    for (const interval of scaleIntervals) {
      sequence.push(rootPitch + oct * 12 + interval);
    }
  }
  sequence.push(rootPitch + octaves * 12);
  
  const downSequence = [...sequence].reverse().slice(1);
  return [...sequence, ...downSequence];
}
