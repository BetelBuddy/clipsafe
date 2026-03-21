import type { MediaFile } from '@/stores/editorStore';

function waitForEvent(target: EventTarget, event: string, timeoutMs = 3000): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const cleanup = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      target.removeEventListener(event, onEvent as EventListener);
      resolve();
    };
    const onEvent = () => cleanup();
    const timer = window.setTimeout(cleanup, timeoutMs);
    target.addEventListener(event, onEvent as EventListener, { once: true });
  });
}

async function createVideoThumbnail(url: string, duration: number): Promise<string | undefined> {
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.src = url;
  video.muted = true;
  video.crossOrigin = 'anonymous';

  await waitForEvent(video, 'loadedmetadata', 2000);

  const targetTime = Number.isFinite(duration) && duration > 0 ? Math.min(1, Math.max(0, duration / 3)) : 0;

  return await new Promise((resolve) => {
    let settled = false;
    const finish = (val?: string) => {
      if (settled) return;
      settled = true;
      resolve(val);
    };

    const timer = window.setTimeout(() => finish(undefined), 1800);

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 90;
        const ctx = canvas.getContext('2d');
        if (!ctx) return finish(undefined);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        clearTimeout(timer);
        finish(canvas.toDataURL('image/jpeg', 0.6));
      } catch {
        clearTimeout(timer);
        finish(undefined);
      }
    };

    try {
      video.currentTime = targetTime;
    } catch {
      clearTimeout(timer);
      finish(undefined);
    }
  });
}

export async function buildMediaFile(file: File): Promise<MediaFile> {
  const url = URL.createObjectURL(file);
  const isAudio = file.type.startsWith('audio/');
  const isImage = file.type.startsWith('image/');
  const type: MediaFile['type'] = isAudio ? 'audio' : isImage ? 'image' : 'video';

  let duration = 0;
  let width = 0;
  let height = 0;

  if (type === 'video' || type === 'audio') {
    const el = document.createElement(type === 'audio' ? 'audio' : 'video');
    el.preload = 'metadata';
    el.src = url;

    await Promise.race([
      waitForEvent(el, 'loadedmetadata', 3000),
      waitForEvent(el, 'error', 3000),
    ]);

    duration = Number.isFinite(el.duration) ? el.duration : 0;
    if (type === 'video') {
      width = (el as HTMLVideoElement).videoWidth || 0;
      height = (el as HTMLVideoElement).videoHeight || 0;
    }
  }

  const thumbnailUrl = type === 'video' ? await createVideoThumbnail(url, duration) : undefined;

  return {
    id: crypto.randomUUID(),
    file,
    url,
    name: file.name,
    duration,
    width,
    height,
    size: file.size,
    type,
    addedAt: Date.now(),
    thumbnailUrl,
  };
}
