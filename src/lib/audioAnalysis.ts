/**
 * Audio analysis utilities: waveform generation and beat detection
 * Uses Web Audio API for real-time analysis
 */

export interface WaveformData {
  peaks: Float32Array;
  duration: number;
  sampleRate: number;
}

export interface Beat {
  time: number;
  strength: number; // 0-1
}

/** Generate waveform peaks from an audio/video file */
export async function generateWaveform(file: File, numPeaks: number = 2000): Promise<WaveformData> {
  const audioContext = new AudioContext();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
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
  
  await audioContext.close();
  
  return {
    peaks,
    duration: audioBuffer.duration,
    sampleRate: audioBuffer.sampleRate,
  };
}

/** Detect beats using onset detection (energy-based) */
export async function detectBeats(file: File, sensitivity: number = 1.4): Promise<Beat[]> {
  const audioContext = new AudioContext();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  
  // Compute energy in windows
  const windowSize = Math.floor(sampleRate * 0.01); // 10ms windows
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
  
  // Onset detection: find local peaks in energy that exceed local average
  const beats: Beat[] = [];
  const avgWindow = 43; // ~430ms local average window
  const minBeatGap = Math.floor(sampleRate * 0.15 / hopSize); // minimum 150ms between beats
  
  let lastBeatIdx = -minBeatGap;
  
  for (let i = avgWindow; i < energies.length - avgWindow; i++) {
    // Local average
    let localAvg = 0;
    for (let j = i - avgWindow; j <= i + avgWindow; j++) {
      localAvg += energies[j];
    }
    localAvg /= (2 * avgWindow + 1);
    
    // Is this a peak?
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
  
  await audioContext.close();
  return beats;
}

/** Auto-cut clips at beat positions */
export function generateBeatSyncCuts(
  beats: Beat[],
  clipStart: number,
  clipEnd: number,
  minCutDuration: number = 0.5,
): number[] {
  const cutPoints: number[] = [];
  let lastCut = clipStart;
  
  for (const beat of beats) {
    if (beat.time < clipStart || beat.time > clipEnd) continue;
    if (beat.time - lastCut >= minCutDuration) {
      cutPoints.push(beat.time);
      lastCut = beat.time;
    }
  }
  
  return cutPoints;
}

/** Estimate BPM from detected beats */
export function estimateBPM(beats: Beat[]): number {
  if (beats.length < 2) return 0;
  
  const intervals: number[] = [];
  for (let i = 1; i < beats.length; i++) {
    intervals.push(beats[i].time - beats[i - 1].time);
  }
  
  // Median interval
  intervals.sort((a, b) => a - b);
  const median = intervals[Math.floor(intervals.length / 2)];
  
  if (median <= 0) return 0;
  return Math.round(60 / median);
}
