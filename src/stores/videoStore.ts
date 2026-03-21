import { create } from 'zustand';

interface VideoState {
  // FFmpeg
  ffmpegLoaded: boolean;
  ffmpegLoading: boolean;
  ffmpegProgress: number;

  // Current file
  file: File | null;
  fileUrl: string | null;
  fileDuration: number;
  fileWidth: number;
  fileHeight: number;
  fileSize: number;
  fileName: string;

  // Processing
  isProcessing: boolean;
  processingProgress: number;
  processingLog: string[];
  processingLabel: string;

  // Output
  outputUrl: string | null;
  outputSize: number;
  outputFileName: string;

  // Actions
  setFFmpegState: (loaded: boolean, loading: boolean) => void;
  setFFmpegProgress: (p: number) => void;
  setFile: (file: File, meta: { url: string; duration: number; width: number; height: number; size: number; name: string }) => void;
  clearFile: () => void;
  setProcessing: (v: boolean, label?: string) => void;
  setProgress: (p: number) => void;
  setOutput: (url: string, size: number, name: string) => void;
  resetOutput: () => void;
  appendLog: (log: string) => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  ffmpegLoaded: false,
  ffmpegLoading: false,
  ffmpegProgress: 0,
  file: null,
  fileUrl: null,
  fileDuration: 0,
  fileWidth: 0,
  fileHeight: 0,
  fileSize: 0,
  fileName: '',
  isProcessing: false,
  processingProgress: 0,
  processingLog: [],
  processingLabel: '',
  outputUrl: null,
  outputSize: 0,
  outputFileName: '',

  setFFmpegState: (loaded, loading) => set({ ffmpegLoaded: loaded, ffmpegLoading: loading }),
  setFFmpegProgress: (p) => set({ ffmpegProgress: p }),
  setFile: (file, meta) => set({
    file,
    fileUrl: meta.url,
    fileDuration: meta.duration,
    fileWidth: meta.width,
    fileHeight: meta.height,
    fileSize: meta.size,
    fileName: meta.name,
    outputUrl: null,
    outputSize: 0,
    outputFileName: '',
  }),
  clearFile: () => set({
    file: null, fileUrl: null, fileDuration: 0, fileWidth: 0, fileHeight: 0, fileSize: 0, fileName: '',
    outputUrl: null, outputSize: 0, outputFileName: '',
  }),
  setProcessing: (v, label = '') => set({ isProcessing: v, processingLabel: label, processingProgress: 0, processingLog: [] }),
  setProgress: (p) => set({ processingProgress: p }),
  setOutput: (url, size, name) => set({ outputUrl: url, outputSize: size, outputFileName: name, isProcessing: false }),
  resetOutput: () => set({ outputUrl: null, outputSize: 0, outputFileName: '' }),
  appendLog: (log) => set((s) => ({ processingLog: [...s.processingLog.slice(-50), log] })),
}));
