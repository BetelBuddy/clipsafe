/**
 * Hook to interact with the audio analysis web worker.
 * Provides async functions for waveform generation and beat detection
 * that run off the main thread.
 */

import { useRef, useCallback, useEffect } from 'react';
import type { WaveformData, Beat, WorkerResponse } from '@/workers/audioAnalysis.worker';

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

export function useAudioWorker() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, PendingRequest>>(new Map());
  const idCounterRef = useRef(0);

  useEffect(() => {
    // Create worker
    workerRef.current = new Worker(
      new URL('../workers/audioAnalysis.worker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const { id } = e.data;
      const pending = pendingRef.current.get(id);
      if (!pending) return;

      pendingRef.current.delete(id);

      if (e.data.type === 'error') {
        pending.reject(new Error(e.data.error));
      } else if (e.data.type === 'waveform') {
        pending.resolve(e.data.data);
      } else if (e.data.type === 'beats') {
        pending.resolve({ beats: e.data.data, bpm: e.data.bpm });
      } else if (e.data.type === 'bpm') {
        pending.resolve(e.data.bpm);
      }
    };

    const currentPending = pendingRef.current;
    return () => {
      workerRef.current?.terminate();
      currentPending.clear();
    };
  }, []);

  const generateWaveform = useCallback(async (file: File, numPeaks = 2000): Promise<WaveformData> => {
    if (!workerRef.current) throw new Error('Worker not initialized');
    
    const id = `waveform-${idCounterRef.current++}`;
    const buffer = await file.arrayBuffer();
    
    return new Promise((resolve, reject) => {
      pendingRef.current.set(id, { resolve, reject });
      workerRef.current!.postMessage(
        { type: 'generateWaveform', id, buffer, numPeaks },
        [buffer]
      );
    });
  }, []);

  const detectBeats = useCallback(async (file: File, sensitivity = 1.4): Promise<{ beats: Beat[]; bpm: number }> => {
    if (!workerRef.current) throw new Error('Worker not initialized');
    
    const id = `beats-${idCounterRef.current++}`;
    const buffer = await file.arrayBuffer();
    
    return new Promise((resolve, reject) => {
      pendingRef.current.set(id, { resolve, reject });
      workerRef.current!.postMessage(
        { type: 'detectBeats', id, buffer, sensitivity },
        [buffer]
      );
    });
  }, []);

  return { generateWaveform, detectBeats };
}
