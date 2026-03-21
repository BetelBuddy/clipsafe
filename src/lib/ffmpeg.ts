import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import { useVideoStore } from '@/stores/videoStore';

let ffmpegInstance: FFmpeg | null = null;

export function getFFmpeg(): FFmpeg {
  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpeg();
  }
  return ffmpegInstance;
}

export async function loadFFmpeg(): Promise<FFmpeg> {
  const ffmpeg = getFFmpeg();
  const store = useVideoStore.getState();

  if (store.ffmpegLoaded) return ffmpeg;
  if (store.ffmpegLoading) {
    // Wait for existing load
    return new Promise((resolve) => {
      const unsub = useVideoStore.subscribe((s) => {
        if (s.ffmpegLoaded) { unsub(); resolve(ffmpeg); }
      });
    });
  }

  store.setFFmpegState(false, true);

  ffmpeg.on('progress', ({ progress }) => {
    useVideoStore.getState().setProgress(Math.round(progress * 100));
  });

  ffmpeg.on('log', ({ message }) => {
    useVideoStore.getState().appendLog(message);
  });

  try {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    store.setFFmpegState(true, false);
  } catch (e) {
    store.setFFmpegState(false, false);
    throw e;
  }

  return ffmpeg;
}

export { fetchFile };

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    mp4: 'video/mp4', webm: 'video/webm', mkv: 'video/x-matroska',
    avi: 'video/x-msvideo', mov: 'video/quicktime', gif: 'image/gif',
    mp3: 'audio/mpeg', aac: 'audio/aac', wav: 'audio/wav', ogg: 'audio/ogg',
  };
  return map[ext || ''] || 'application/octet-stream';
}

export async function runFFmpegCommand(
  inputFile: File,
  args: string[],
  outputFileName: string
): Promise<{ url: string; size: number }> {
  const ffmpeg = await loadFFmpeg();
  const store = useVideoStore.getState();
  store.setProcessing(true);

  await ffmpeg.writeFile('input', await fetchFile(inputFile));
  await ffmpeg.exec(args);
  const data = await ffmpeg.readFile(outputFileName);
  const rawData = data as unknown;
  const blob = new Blob([rawData as BlobPart], { type: getMimeType(outputFileName) });
  const url = URL.createObjectURL(blob);

  try { await ffmpeg.deleteFile('input'); } catch (e) { /* Intentionally empty */ }
  try { await ffmpeg.deleteFile(outputFileName); } catch (e) { /* Intentionally empty */ }

  store.setOutput(url, blob.size, outputFileName);
  return { url, size: blob.size };
}

export function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatTimecode(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}.${ms.toString().padStart(3,'0')}`;
}
