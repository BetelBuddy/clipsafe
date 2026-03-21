import { create } from 'zustand';

export interface CaptionWord {
  id: string;
  text: string;
  start: number;
  end: number;
  speaker?: string;
  confidence: number;
  type: 'word' | 'filler' | 'silence' | 'punctuation';
  deleted: boolean;
}

export interface CaptionSegment {
  id: string;
  speaker: string;
  words: CaptionWord[];
  start: number;
  end: number;
}

const FILLER_WORDS = new Set([
  'um', 'uh', 'uhh', 'umm', 'hmm', 'hm', 'er', 'ah', 'like',
  'you know', 'basically', 'actually', 'literally', 'right',
  'so', 'well', 'i mean', 'kind of', 'sort of',
]);

interface CaptionsState {
  segments: CaptionSegment[];
  loading: boolean;
  error: string | null;
  sourceClipId: string | null;

  setSegments: (s: CaptionSegment[], clipId: string) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  deleteWords: (wordIds: string[]) => void;
  restoreWords: (wordIds: string[]) => void;
  removeAllFillers: () => void;
  removeAllSilences: () => void;
  restoreAll: () => void;
  autoClean: () => void;
  clear: () => void;
}

export const useCaptionsStore = create<CaptionsState>((set) => ({
  segments: [],
  loading: false,
  error: null,
  sourceClipId: null,

  setSegments: (segments, clipId) => set({ segments, sourceClipId: clipId, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),

  deleteWords: (wordIds) => set((s) => ({
    segments: s.segments.map((seg) => ({
      ...seg,
      words: seg.words.map((w) => wordIds.includes(w.id) ? { ...w, deleted: true } : w),
    })),
  })),

  restoreWords: (wordIds) => set((s) => ({
    segments: s.segments.map((seg) => ({
      ...seg,
      words: seg.words.map((w) => wordIds.includes(w.id) ? { ...w, deleted: false } : w),
    })),
  })),

  removeAllFillers: () => set((s) => ({
    segments: s.segments.map((seg) => ({
      ...seg,
      words: seg.words.map((w) => w.type === 'filler' ? { ...w, deleted: true } : w),
    })),
  })),

  removeAllSilences: () => set((s) => ({
    segments: s.segments.map((seg) => ({
      ...seg,
      words: seg.words.map((w) => w.type === 'silence' ? { ...w, deleted: true } : w),
    })),
  })),

  restoreAll: () => set((s) => ({
    segments: s.segments.map((seg) => ({
      ...seg,
      words: seg.words.map((w) => ({ ...w, deleted: false })),
    })),
  })),

  autoClean: () => set((s) => ({
    segments: s.segments.map((seg) => ({
      ...seg,
      words: seg.words.map((w) =>
        w.type === 'filler' || w.type === 'silence' ? { ...w, deleted: true } : w
      ),
    })),
  })),

  clear: () => set({ segments: [], sourceClipId: null, error: null, loading: false }),
}));

export function classifyWord(text: string): CaptionWord['type'] {
  const lower = text.toLowerCase().trim();
  if (!lower || lower === '...') return 'silence';
  if (FILLER_WORDS.has(lower)) return 'filler';
  if (/^[.,!?;:'"()\-–—…]+$/.test(lower)) return 'punctuation';
  return 'word';
}

export function generateSRT(segments: CaptionSegment[]): string {
  const activeWords = segments.flatMap((s) => s.words.filter((w) => !w.deleted && w.type !== 'silence'));
  if (activeWords.length === 0) return '';

  const lines: string[] = [];
  let idx = 1;
  let group: CaptionWord[] = [];

  const flush = () => {
    if (group.length === 0) return;
    const start = formatSRTTime(group[0].start);
    const end = formatSRTTime(group[group.length - 1].end);
    const text = group.map((w) => w.text).join(' ');
    lines.push(`${idx}\n${start} --> ${end}\n${text}\n`);
    idx++;
    group = [];
  };

  for (const w of activeWords) {
    if (group.length > 0 && (w.start - group[group.length - 1].end > 0.5 || group.length >= 12)) {
      flush();
    }
    group.push(w);
  }
  flush();

  return lines.join('\n');
}

function formatSRTTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}
