import { create } from 'zustand';

export type TrackType = 'video' | 'audio' | 'text';

export interface FilterConfig {
  id: string;
  type: string;
  params: Record<string, number | string | boolean>;
}

export interface Clip {
  id: string;
  trackId: string;
  sourceFileId: string;
  sourceFileName: string;
  startOnTimeline: number;
  trimStart: number;
  trimEnd: number;
  duration: number;
  filters: FilterConfig[];
  color: string;
  label: string;
  opacity: number;
  volume: number;
  speed: number;
}

export interface Track {
  id: string;
  type: TrackType;
  label: string;
  muted: boolean;
  locked: boolean;
  height: number;
}

export interface MediaFile {
  id: string;
  file: File;
  url: string;
  name: string;
  duration: number;
  width: number;
  height: number;
  size: number;
  type: 'video' | 'audio' | 'image';
  addedAt: number;
  thumbnailUrl?: string;
}

export interface BeatMarker {
  time: number;
  strength: number;
}

interface HistoryEntry {
  tracks: Track[];
  clips: Record<string, Clip>;
  description: string;
}

interface EditorState {
  projectName: string;
  mediaFiles: MediaFile[];
  tracks: Track[];
  clips: Record<string, Clip>;
  playhead: number;
  zoom: number;
  duration: number;
  selection: string[];
  isPlaying: boolean;
  snapEnabled: boolean;
  playbackRate: number;
  history: HistoryEntry[];
  historyIndex: number;
  // Beat sync
  beatMarkers: BeatMarker[];
  bpm: number;
  rippleMode: boolean;

  setProjectName: (n: string) => void;
  addMediaFile: (file: MediaFile) => void;
  removeMediaFile: (id: string) => void;
  importAndAddToTimeline: (file: MediaFile) => void;
  addTrack: (type: TrackType, label?: string) => void;
  removeTrack: (id: string) => void;
  toggleTrackMute: (id: string) => void;
  toggleTrackLock: (id: string) => void;
  addClip: (clip: Clip) => void;
  updateClip: (id: string, updates: Partial<Clip>) => void;
  removeClip: (id: string) => void;
  moveClip: (id: string, newStart: number, newTrackId?: string) => void;
  splitClipAtPlayhead: () => void;
  duplicateSelected: () => void;
  deleteSelected: () => void;
  selectAll: () => void;
  addFilterToClip: (clipId: string, filter: FilterConfig) => void;
  removeFilterFromClip: (clipId: string, filterId: string) => void;
  reorderFilters: (clipId: string, fromIdx: number, toIdx: number) => void;
  setClipOpacity: (clipId: string, opacity: number) => void;
  setClipVolume: (clipId: string, volume: number) => void;
  setClipSpeed: (clipId: string, speed: number) => void;
  setPlayhead: (time: number) => void;
  setPlaying: (v: boolean) => void;
  setZoom: (z: number) => void;
  setDuration: (d: number) => void;
  setPlaybackRate: (r: number) => void;
  selectClip: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  pushHistory: (desc: string) => void;
  undo: () => void;
  redo: () => void;
  toggleSnap: () => void;
  triggerImport: () => void;
  // Beat sync
  setBeatMarkers: (markers: BeatMarker[], bpm: number) => void;
  clearBeatMarkers: () => void;
  snapToNearestBeat: () => void;
  toggleRippleMode: () => void;
}

const TRACK_COLORS = ['hsl(0 100% 62%)', 'hsl(210 100% 56%)', 'hsl(142 72% 46%)', 'hsl(48 96% 53%)', 'hsl(280 87% 65%)'];
let colorIdx = 0;

const genId = () => crypto.randomUUID();

export const useEditorStore = create<EditorState>((set, get) => ({
  projectName: 'Untitled Project',
  mediaFiles: [],
  tracks: [
    { id: 'v1', type: 'video', label: 'V1', muted: false, locked: false, height: 64 },
    { id: 'a1', type: 'audio', label: 'A1', muted: false, locked: false, height: 48 },
  ],
  clips: {},
  playhead: 0,
  zoom: 80,
  duration: 60,
  selection: [],
  isPlaying: false,
  snapEnabled: true,
  playbackRate: 1,
  history: [],
  historyIndex: -1,
  beatMarkers: [],
  bpm: 0,
  rippleMode: false,

  setProjectName: (n) => set({ projectName: n }),
  addMediaFile: (file) => set((s) => ({ mediaFiles: [...s.mediaFiles, file] })),
  removeMediaFile: (id) => set((s) => ({ mediaFiles: s.mediaFiles.filter((f) => f.id !== id) })),

  // Import media AND auto-add to timeline
  importAndAddToTimeline: (media) => {
    const s = get();
    // Add to media bin
    set((st) => ({ mediaFiles: [...st.mediaFiles, media] }));

    // Find or use existing track
    const trackType = media.type === 'audio' ? 'audio' : 'video';
    let track = get().tracks.find((t) => t.type === trackType);
    if (!track) {
      get().addTrack(trackType);
      track = get().tracks.find((t) => t.type === trackType)!;
    }

    // Find the end of existing clips on this track
    const existingClips = Object.values(get().clips).filter((c) => c.trackId === track!.id);
    const endTime = existingClips.reduce((max, c) => Math.max(max, c.startOnTimeline + c.duration), 0);

    const clipId = genId();
    get().addClip({
      id: clipId,
      trackId: track.id,
      sourceFileId: media.id,
      sourceFileName: media.name,
      startOnTimeline: endTime,
      trimStart: 0,
      trimEnd: media.duration,
      duration: media.duration || 5,
      filters: [],
      color: getNextClipColor(),
      label: media.name.split('.')[0],
      opacity: 1,
      volume: 1,
      speed: 1,
    });
  },

  addTrack: (type, label) => {
    const id = genId();
    const defaultLabel = label || `${type.charAt(0).toUpperCase()}${get().tracks.filter((t) => t.type === type).length + 1}`;
    set((s) => ({
      tracks: [...s.tracks, { id, type, label: defaultLabel, muted: false, locked: false, height: type === 'video' ? 64 : 48 }],
    }));
  },
  removeTrack: (id) => set((s) => ({
    tracks: s.tracks.filter((t) => t.id !== id),
    clips: Object.fromEntries(Object.entries(s.clips).filter(([, c]) => c.trackId !== id)),
  })),
  toggleTrackMute: (id) => set((s) => ({
    tracks: s.tracks.map((t) => (t.id === id ? { ...t, muted: !t.muted } : t)),
  })),
  toggleTrackLock: (id) => set((s) => ({
    tracks: s.tracks.map((t) => (t.id === id ? { ...t, locked: !t.locked } : t)),
  })),

  addClip: (clip) => {
    const s = get();
    s.pushHistory('Add clip');
    set((s) => {
      const newDuration = Math.max(s.duration, clip.startOnTimeline + clip.duration + 10);
      return { clips: { ...s.clips, [clip.id]: clip }, duration: newDuration };
    });
  },
  updateClip: (id, updates) => {
    get().pushHistory('Edit clip');
    set((s) => ({
      clips: { ...s.clips, [id]: { ...s.clips[id], ...updates } },
    }));
  },
  removeClip: (id) => {
    get().pushHistory('Delete clip');
    set((s) => {
      const { [id]: _, ...rest } = s.clips;
      return { clips: rest, selection: s.selection.filter((x) => x !== id) };
    });
  },
  moveClip: (id, newStart, newTrackId) => {
    get().pushHistory('Move clip');
    set((s) => ({
      clips: {
        ...s.clips,
        [id]: { ...s.clips[id], startOnTimeline: Math.max(0, newStart), ...(newTrackId ? { trackId: newTrackId } : {}) },
      },
    }));
  },

  splitClipAtPlayhead: () => {
    const s = get();
    if (s.selection.length !== 1) return;
    const clip = s.clips[s.selection[0]];
    if (!clip) return;
    const splitPoint = s.playhead;
    if (splitPoint <= clip.startOnTimeline || splitPoint >= clip.startOnTimeline + clip.duration) return;

    s.pushHistory('Split clip');
    const relSplit = splitPoint - clip.startOnTimeline;
    const leftClip: Clip = { ...clip, duration: relSplit, trimEnd: clip.trimStart + relSplit };
    const rightClip: Clip = {
      ...clip,
      id: genId(),
      startOnTimeline: splitPoint,
      trimStart: clip.trimStart + relSplit,
      duration: clip.duration - relSplit,
    };
    set((st) => ({
      clips: { ...st.clips, [clip.id]: leftClip, [rightClip.id]: rightClip },
      selection: [rightClip.id],
    }));
  },

  duplicateSelected: () => {
    const s = get();
    if (s.selection.length === 0) return;
    s.pushHistory('Duplicate clips');
    const newClips: Record<string, Clip> = {};
    const newSelection: string[] = [];
    for (const id of s.selection) {
      const clip = s.clips[id];
      if (!clip) continue;
      const newId = genId();
      newClips[newId] = { ...clip, id: newId, startOnTimeline: clip.startOnTimeline + clip.duration + 0.5 };
      newSelection.push(newId);
    }
    set((st) => ({ clips: { ...st.clips, ...newClips }, selection: newSelection }));
  },

  deleteSelected: () => {
    const s = get();
    if (s.selection.length === 0) return;
    s.pushHistory('Delete clips');
    set((st) => {
      const remaining = { ...st.clips };
      for (const id of st.selection) delete remaining[id];
      return { clips: remaining, selection: [] };
    });
  },

  selectAll: () => set((s) => ({ selection: Object.keys(s.clips) })),

  addFilterToClip: (clipId, filter) => {
    get().pushHistory('Add filter');
    set((s) => {
      const clip = s.clips[clipId];
      if (!clip) return s;
      return { clips: { ...s.clips, [clipId]: { ...clip, filters: [...clip.filters, filter] } } };
    });
  },
  removeFilterFromClip: (clipId, filterId) => {
    get().pushHistory('Remove filter');
    set((s) => {
      const clip = s.clips[clipId];
      if (!clip) return s;
      return { clips: { ...s.clips, [clipId]: { ...clip, filters: clip.filters.filter((f) => f.id !== filterId) } } };
    });
  },
  reorderFilters: (clipId, fromIdx, toIdx) => {
    set((s) => {
      const clip = s.clips[clipId];
      if (!clip) return s;
      const filters = [...clip.filters];
      const [moved] = filters.splice(fromIdx, 1);
      filters.splice(toIdx, 0, moved);
      return { clips: { ...s.clips, [clipId]: { ...clip, filters } } };
    });
  },
  setClipOpacity: (clipId, opacity) => {
    set((s) => {
      const clip = s.clips[clipId];
      if (!clip) return s;
      return { clips: { ...s.clips, [clipId]: { ...clip, opacity } } };
    });
  },
  setClipVolume: (clipId, volume) => {
    set((s) => {
      const clip = s.clips[clipId];
      if (!clip) return s;
      return { clips: { ...s.clips, [clipId]: { ...clip, volume } } };
    });
  },
  setClipSpeed: (clipId, speed) => {
    set((s) => {
      const clip = s.clips[clipId];
      if (!clip) return s;
      return { clips: { ...s.clips, [clipId]: { ...clip, speed } } };
    });
  },

  setPlayhead: (time) => set({ playhead: Math.max(0, time) }),
  setPlaying: (v) => set({ isPlaying: v }),
  setZoom: (z) => set({ zoom: Math.max(10, Math.min(500, z)) }),
  setDuration: (d) => set({ duration: d }),
  setPlaybackRate: (r) => set({ playbackRate: r }),

  selectClip: (id, multi) => set((s) => ({
    selection: multi ? (s.selection.includes(id) ? s.selection.filter((x) => x !== id) : [...s.selection, id]) : [id],
  })),
  clearSelection: () => set({ selection: [] }),

  pushHistory: (desc) => set((s) => {
    const entry: HistoryEntry = { tracks: [...s.tracks], clips: { ...s.clips }, description: desc };
    const newHistory = s.history.slice(0, s.historyIndex + 1);
    newHistory.push(entry);
    if (newHistory.length > 50) newHistory.shift();
    return { history: newHistory, historyIndex: newHistory.length - 1 };
  }),
  undo: () => set((s) => {
    if (s.historyIndex < 0) return s;
    const entry = s.history[s.historyIndex];
    return { tracks: entry.tracks, clips: entry.clips, historyIndex: s.historyIndex - 1 };
  }),
  redo: () => set((s) => {
    if (s.historyIndex >= s.history.length - 1) return s;
    const entry = s.history[s.historyIndex + 1];
    return { tracks: entry.tracks, clips: entry.clips, historyIndex: s.historyIndex + 1 };
  }),

  toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),

  // Trigger the hidden file input for import
  triggerImport: () => {
    const input = document.getElementById('editor-file-import') as HTMLInputElement | null;
    input?.click();
  },

  // Beat sync
  setBeatMarkers: (markers, bpm) => set({ beatMarkers: markers, bpm }),
  clearBeatMarkers: () => set({ beatMarkers: [], bpm: 0 }),
  snapToNearestBeat: () => {
    const s = get();
    if (s.beatMarkers.length === 0) return;
    const nearest = s.beatMarkers.reduce((prev, curr) => 
      Math.abs(curr.time - s.playhead) < Math.abs(prev.time - s.playhead) ? curr : prev
    );
    set({ playhead: nearest.time });
  },
  toggleRippleMode: () => set((s) => ({ rippleMode: !s.rippleMode })),
}));

export function getNextClipColor() {
  const c = TRACK_COLORS[colorIdx % TRACK_COLORS.length];
  colorIdx++;
  return c;
}
