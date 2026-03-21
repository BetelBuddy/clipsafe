import type { Clip, FilterConfig } from '@/stores/editorStore';
import type { CaptionSegment } from '@/stores/captionsStore';

import { type CaptionStyle } from '@/lib/captionStyles';

export interface ExportOptions {
  clips: Clip[];
  format: string;
  quality: string;
  resolution: string;
  burnCaptions: boolean;
  captions: CaptionSegment[];
  captionStyle: CaptionStyle;
  trimStart?: number;
  trimEnd?: number;
  mediaDuration?: number;
}

// types unified in lib/captionStyles.ts

const CRF_MAP: Record<string, number> = { low: 35, medium: 23, high: 18, lossless: 0 };

/** Map editor filter types to FFmpeg filter strings */
function mapFilter(f: FilterConfig): string | null {
  const p = f.params;
  switch (f.type) {
    case 'blur': return `boxblur=luma_radius=${p.radius ?? 5}`;
    case 'sharpen': return `unsharp=5:5:${p.amount ?? 1.5}`;
    case 'brightness': return `eq=brightness=${p.value ?? 0}`;
    case 'contrast': return `eq=contrast=${p.value ?? 1}`;
    case 'saturation': return `eq=saturation=${p.value ?? 1}`;
    case 'hue-shift': return `hue=h=${p.value ?? 0}`;
    case 'sepia': return 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131';
    case 'invert': case 'negate': return 'negate';
    case 'grayscale': return 'format=gray';
    case 'vignette': return `vignette=angle=${p.angle ?? 0.5}`;
    case 'film-grain': return `noise=alls=${p.amount ?? 20}:allf=t`;
    case 'edge-detect': return 'edgedetect';
    case 'emboss': return 'convolution=-2 -1 0 -1 1 1 0 1 2:-2 -1 0 -1 1 1 0 1 2:-2 -1 0 -1 1 1 0 1 2:-2 -1 0 -1 1 1 0 1 2';
    case 'posterize': return `posterize=${p.levels ?? 4}`;
    case 'pixelate': {
      const s = p.size ?? 10;
      return `scale=iw/${s}:ih/${s}:flags=neighbor,scale=iw*${s}:ih*${s}:flags=neighbor`;
    }
    case 'text-overlay': {
      const text = String(p.text ?? 'Text').replace(/'/g, "\\'");
      return `drawtext=text='${text}':fontsize=${p.size ?? 48}:fontcolor=${p.color ?? 'white'}:x=${p.x ?? 50}:y=${p.y ?? 50}`;
    }
    default: return null;
  }
}

/** Escape text for FFmpeg drawtext */
function escapeDrawtext(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/:/g, '\\:')
    .replace(/;/g, '\\;')
    .replace(/%/g, '%%');
}

/** Build drawtext filter for a caption group */
function buildCaptionDrawtext(
  words: { text: string; start: number; end: number }[],
  style: CaptionStyle,
): string {
  if (words.length === 0) return '';
  const text = escapeDrawtext(words.map(w => w.text).join(' '));
  const start = words[0].start;
  const end = words[words.length - 1].end;

  let filter = `drawtext=text='${text}'`;
  filter += `:fontsize=${style.fontSize}`;
  filter += `:fontcolor=${style.color}`;
  filter += `:x=(w-text_w)/2`;
  filter += `:y=h*${style.y / 100}-text_h/2`;
  filter += `:borderw=${style.outlineWidth}`;
  filter += `:bordercolor=${style.outlineColor}`;
  filter += `:shadowx=${style.shadowX}:shadowy=${style.shadowY}:shadowcolor=${style.shadowColor}`;

  if (style.bgOpacity > 0) {
    filter += `:box=1:boxcolor=${style.bgColor}@${style.bgOpacity}:boxborderw=8`;
  }

  filter += `:enable='between(t,${start.toFixed(3)},${end.toFixed(3)})'`;
  return filter;
}

/** Group caption words into display chunks (by sentence boundaries / pauses) */
function groupCaptionWords(segments: CaptionSegment[]): { text: string; start: number; end: number }[][] {
  const allWords = segments.flatMap(s =>
    s.words.filter(w => !w.deleted && w.type !== 'silence')
  );

  const groups: { text: string; start: number; end: number }[][] = [];
  let current: { text: string; start: number; end: number }[] = [];

  for (const w of allWords) {
    if (current.length > 0) {
      const gap = w.start - current[current.length - 1].end;
      if (gap > 0.5 || current.length >= 10) {
        groups.push(current);
        current = [];
      }
    }
    current.push({ text: w.text, start: w.start, end: w.end });
  }
  if (current.length > 0) groups.push(current);

  return groups;
}

/** Build complete FFmpeg args from editor state */
export function buildExportArgs(options: ExportOptions): { args: string[]; outputFileName: string } {
  const { clips, format, quality, resolution, burnCaptions, captions, captionStyle } = options;
  const args: string[] = ['-i', 'input'];

  // Trim
  const clip = clips[0];
  if (clip) {
    if (clip.trimStart > 0) args.push('-ss', clip.trimStart.toFixed(3));
    if (clip.trimEnd > 0 && options.mediaDuration && clip.trimEnd < options.mediaDuration) {
      args.push('-to', clip.trimEnd.toFixed(3));
    }
  }

  // Build video filter chain
  const videoFilters: string[] = [];

  // Speed (video)
  if (clip && clip.speed !== 1) {
    videoFilters.push(`setpts=PTS/${clip.speed}`);
  }

  // Clip filters
  if (clip) {
    for (const f of clip.filters) {
      const mapped = mapFilter(f);
      if (mapped) videoFilters.push(mapped);
    }
  }

  // Captions
  if (burnCaptions && captions.length > 0) {
    const groups = groupCaptionWords(captions);
    for (const group of groups) {
      const dt = buildCaptionDrawtext(group, captionStyle);
      if (dt) videoFilters.push(dt);
    }
  }

  // Resolution
  if (resolution !== 'original') {
    const [w, h] = resolution.split('x');
    videoFilters.push(`scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2`);
  }

  // Build audio filter chain
  const audioFilters: string[] = [];

  if (clip && clip.speed !== 1) {
    // atempo only supports 0.5-2.0, chain for extreme values
    let speed = clip.speed;
    while (speed > 2.0) { audioFilters.push('atempo=2.0'); speed /= 2.0; }
    while (speed < 0.5) { audioFilters.push('atempo=0.5'); speed *= 2.0; }
    if (speed !== 1.0) audioFilters.push(`atempo=${speed.toFixed(4)}`);
  }

  if (clip && clip.volume !== 1) {
    audioFilters.push(`volume=${clip.volume.toFixed(2)}`);
  }

  // Apply filters
  if (videoFilters.length > 0) {
    args.push('-vf', videoFilters.join(','));
  }
  if (audioFilters.length > 0) {
    args.push('-af', audioFilters.join(','));
  }

  // Codec
  const crf = CRF_MAP[quality] ?? 23;
  if (format === 'mp4') {
    args.push('-c:v', 'libx264', '-crf', crf.toString(), '-preset', 'fast');
    if (audioFilters.length === 0) args.push('-c:a', 'aac');
  } else if (format === 'webm') {
    args.push('-c:v', 'libvpx-vp9', '-crf', crf.toString(), '-b:v', '0');
  } else if (format === 'mov') {
    args.push('-c:v', 'libx264', '-crf', crf.toString(), '-preset', 'fast');
  }

  const outputFileName = `output.${format}`;
  args.push(outputFileName);

  return { args, outputFileName };
}

/** Get a summary of what will be included in the export */
export function getExportSummary(options: ExportOptions): string[] {
  const items: string[] = [];
  const clip = options.clips[0];

  if (clip) {
    if (clip.filters.length > 0) items.push(`${clip.filters.length} filter(s)`);
    if (clip.speed !== 1) items.push(`${clip.speed}x speed`);
    if (clip.volume !== 1) items.push(`${Math.round(clip.volume * 100)}% volume`);
    if (clip.opacity !== 1) items.push(`${Math.round(clip.opacity * 100)}% opacity`);
  }

  if (options.burnCaptions && options.captions.length > 0) {
    const wordCount = options.captions.reduce((n, s) => n + s.words.filter(w => !w.deleted).length, 0);
    items.push(`${wordCount} caption words`);
  }

  if (options.resolution !== 'original') items.push(options.resolution);

  return items;
}
