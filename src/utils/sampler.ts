const SAMPLES: Record<string, number> = {
  'G3': 55, 'A3': 57, 'C4': 60, 'E4': 64, 'G4': 67, 
  'A4': 69, 'C5': 72, 'E5': 76, 'G5': 79, 'A5': 81, 
  'C6': 84, 'E6': 88, 'G6': 91, 'A6': 93, 'C7': 96
};

export class Sampler {
  private audioCtx: AudioContext;
  private buffers: Record<number, AudioBuffer> = {};
  private rootUrl: string = './samples/violin/';
  private gainNode: GainNode;

  constructor(audioCtx: AudioContext) {
    this.audioCtx = audioCtx;
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.connect(this.audioCtx.destination);
    this.loadSamples();
  }

  private async loadSamples() {
    const promises = Object.entries(SAMPLES).map(async ([name, pitch]) => {
      try {
        const response = await fetch(`${this.rootUrl}${name}.mp3`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
        this.buffers[pitch] = audioBuffer;
      } catch (e) {
        console.error(`Failed to load sample ${name}`, e);
      }
    });
    await Promise.all(promises);
  }

  public setVolume(volume: number) {
    this.gainNode.gain.setTargetAtTime(volume, this.audioCtx.currentTime, 0.1);
  }

  public async play(pitch: number, duration: number = 1.5) {
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
    const nearestPitch = this.findNearestPitch(pitch);
    const buffer = this.buffers[nearestPitch];
    if (!buffer) return;

    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;

    // Calculate playback rate for pitch shifting
    // interval = 12 * log2(f1 / f2) => ratio = 2 ^ (interval / 12)
    const interval = pitch - nearestPitch;
    source.playbackRate.value = Math.pow(2, interval / 12);

    const individualGain = this.audioCtx.createGain();
    source.connect(individualGain);
    individualGain.connect(this.gainNode);

    // Envelope
    const now = this.audioCtx.currentTime;
    individualGain.gain.setValueAtTime(0, now);
    individualGain.gain.linearRampToValueAtTime(1, now + 0.05);
    individualGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.start(now);
    source.stop(now + duration);
  }

  private findNearestPitch(pitch: number): number {
    const availablePitches = Object.values(SAMPLES);
    return availablePitches.reduce((prev, curr) => {
      return (Math.abs(curr - pitch) < Math.abs(prev - pitch) ? curr : prev);
    });
  }
}

export const getSampler = (() => {
  let sampler: Sampler | null = null;
  return (audioCtx: AudioContext) => {
    if (!sampler) sampler = new Sampler(audioCtx);
    return sampler;
  };
})();
