/**
 * Web Worker for audio analysis - runs off the main thread.
 * Handles waveform generation and beat detection without blocking UI.
 */

export interface WaveformData {
  peaks: Float32Array;
  duration: number;
  sampleRate: number;
}

export interface Beat {
  time: number;
  strength: number;
}

export type WorkerMessage =
  | { type: 'generateWaveform'; id: string; buffer: ArrayBuffer; numPeaks?: number }
  | { type: 'detectBeats'; id: string; buffer: ArrayBuffer; sensitivity?: number }
  | { type: 'estimateBPM'; id: string; beats: Beat[] };

export type WorkerResponse =
  | { type: 'waveform'; id: string; data: WaveformData }
  | { type: 'beats'; id: string; data: Beat[]; bpm: number }
  | { type: 'bpm'; id: string; bpm: number }
  | { type: 'progress'; id: string; progress: number }
  | { type: 'error'; id: string; error: string };

// Waveform generation
async function generateWaveform(buffer: ArrayBuffer, numPeaks: number = 2000): Promise<WaveformData> {
  const OC = (globalThis as unknown as { OfflineAudioContext: typeof OfflineAudioContext }).OfflineAudioContext;
  const audioContext = new OC(1, 1, 44100);
  const audioBuffer = await audioContext.decodeAudioData(buffer.slice(0));
  
  const channelData = audioBuffer.getChannelData(0);
  const samplesPerPeak = Math.floor(channelData.length / numPeaks);
  const peaks = new Float32Array(numPeaks);
  
  for (let i = 0; i < numPeaks; i++) {
    let max = 0;
    const start = i * samplesPerPeak;
    const end = Math.min(start + samplesPerPeak, channelData.length);
    for (let j = start; j < end; j++) {
      const abs = Math.abs(channelData[j]);
      if (abs > max) max = abs;
    }
    peaks[i] = max;
  }
  
  return {
    peaks,
    duration: audioBuffer.duration,
    sampleRate: audioBuffer.sampleRate,
  };
}

// Beat detection using onset detection
async function detectBeats(buffer: ArrayBuffer, sensitivity: number = 1.4): Promise<{ beats: Beat[]; bpm: number }> {
  const OC = (globalThis as unknown as { OfflineAudioContext: typeof OfflineAudioContext }).OfflineAudioContext;
  const audioContext = new OC(1, 1, 44100);
  const audioBuffer = await audioContext.decodeAudioData(buffer.slice(0));
  
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  
  // Compute energy in windows (10ms)
  const windowSize = Math.floor(sampleRate * 0.01);
  const hopSize = Math.floor(windowSize / 2);
  const numWindows = Math.floor((channelData.length - windowSize) / hopSize);
  
  const energies: number[] = [];
  for (let i = 0; i < numWindows; i++) {
    let energy = 0;
    const start = i * hopSize;
    for (let j = 0; j < windowSize; j++) {
      const sample = channelData[start + j] || 0;
      energy += sample * sample;
    }
    energies.push(energy / windowSize);
  }
  
  // Onset detection: find local peaks
  const beats: Beat[] = [];
  const avgWindow = 43; // ~430ms
  const minBeatGap = Math.floor(sampleRate * 0.15 / hopSize);
  
  let lastBeatIdx = -minBeatGap;
  
  for (let i = avgWindow; i < energies.length - avgWindow; i++) {
    let localAvg = 0;
    for (let j = i - avgWindow; j <= i + avgWindow; j++) {
      localAvg += energies[j];
    }
    localAvg /= (2 * avgWindow + 1);
    
    if (energies[i] > localAvg * sensitivity && 
        energies[i] > energies[i - 1] && 
        energies[i] > energies[i + 1] &&
        (i - lastBeatIdx) >= minBeatGap) {
      const time = (i * hopSize) / sampleRate;
      const strength = Math.min(1, energies[i] / (localAvg * sensitivity * 2));
      beats.push({ time, strength });
      lastBeatIdx = i;
    }
  }
  
  // Estimate BPM
  const bpm = estimateBPM(beats);
  
  return { beats, bpm };
}

function estimateBPM(beats: Beat[]): number {
  if (beats.length < 2) return 0;
  
  const intervals: number[] = [];
  for (let i = 1; i < beats.length; i++) {
    intervals.push(beats[i].time - beats[i - 1].time);
  }
  
  intervals.sort((a, b) => a - b);
  const median = intervals[Math.floor(intervals.length / 2)];
  
  if (median <= 0) return 0;
  return Math.round(60 / median);
}

// Message handler
self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, id } = e.data;
  
  try {
    if (type === 'generateWaveform') {
      const { buffer, numPeaks } = e.data;
      const data = await generateWaveform(buffer, numPeaks);
      self.postMessage({ type: 'waveform', id, data } as WorkerResponse);
    } else if (type === 'detectBeats') {
      const { buffer, sensitivity } = e.data;
      const { beats, bpm } = await detectBeats(buffer, sensitivity);
      self.postMessage({ type: 'beats', id, data: beats, bpm } as WorkerResponse);
    } else if (type === 'estimateBPM') {
      const { beats } = e.data;
      const bpm = estimateBPM(beats);
      self.postMessage({ type: 'bpm', id, bpm } as WorkerResponse);
    }
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      id, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    } as WorkerResponse);
  }
};

export {};
