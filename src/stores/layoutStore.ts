import { create } from 'zustand';

export type LayoutPreset = 'default' | 'compact' | 'wide-preview' | 'mobile';

interface PanelSizes {
  mediaBin: number;
  preview: number;
  properties: number;
  timeline: number;
}

interface LayoutState {
  preset: LayoutPreset;
  panelSizes: PanelSizes;
  mediaBinCollapsed: boolean;
  propertiesCollapsed: boolean;
  timelineCollapsed: boolean;
  activeRightTab: 'properties' | 'ai';
  activeMobileTab: 'preview' | 'timeline' | 'ai' | 'media' | 'captions';
  showMediaBin: boolean;
  showProperties: boolean;
  showAiPanel: boolean;
  showCaptions: boolean;
  theaterMode: boolean;

  setPreset: (p: LayoutPreset) => void;
  setPanelSizes: (s: Partial<PanelSizes>) => void;
  toggleMediaBin: () => void;
  toggleProperties: () => void;
  toggleTimeline: () => void;
  setActiveRightTab: (t: 'properties' | 'ai') => void;
  setActiveMobileTab: (t: 'preview' | 'timeline' | 'ai' | 'media' | 'captions') => void;
  toggleShowMediaBin: () => void;
  toggleShowProperties: () => void;
  toggleShowAiPanel: () => void;
  toggleShowCaptions: () => void;
  toggleTheaterMode: () => void;
}

const STORAGE_KEY = 'clipsafe_layout';

const PRESETS: Record<LayoutPreset, PanelSizes> = {
  default: { mediaBin: 18, preview: 52, properties: 30, timeline: 35 },
  compact: { mediaBin: 0, preview: 65, properties: 35, timeline: 25 },
  'wide-preview': { mediaBin: 15, preview: 65, properties: 20, timeline: 30 },
  mobile: { mediaBin: 100, preview: 100, properties: 100, timeline: 100 },
};

function loadLayout(): { preset: LayoutPreset; panelSizes: PanelSizes } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { preset: parsed.preset || 'default', panelSizes: parsed.panelSizes || PRESETS.default };
    }
  } catch {}
  return { preset: 'default', panelSizes: PRESETS.default };
}

function saveLayout(data: { preset: LayoutPreset; panelSizes: PanelSizes }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const useLayoutStore = create<LayoutState>((set, get) => {
  const initial = loadLayout();
  return {
    preset: initial.preset,
    panelSizes: initial.panelSizes,
    mediaBinCollapsed: false,
    propertiesCollapsed: false,
    timelineCollapsed: false,
    activeRightTab: 'properties',
    activeMobileTab: 'preview',
    showMediaBin: true,
    showProperties: true,
    showAiPanel: false,
    showCaptions: false,
    theaterMode: false,

    setPreset: (p) => {
      const panelSizes = PRESETS[p];
      saveLayout({ preset: p, panelSizes });
      set({ preset: p, panelSizes });
    },
    setPanelSizes: (s) => {
      const panelSizes = { ...get().panelSizes, ...s };
      saveLayout({ preset: get().preset, panelSizes });
      set({ panelSizes });
    },
    toggleMediaBin: () => set((s) => ({ mediaBinCollapsed: !s.mediaBinCollapsed })),
    toggleProperties: () => set((s) => ({ propertiesCollapsed: !s.propertiesCollapsed })),
    toggleTimeline: () => set((s) => ({ timelineCollapsed: !s.timelineCollapsed })),
    setActiveRightTab: (t) => set({ activeRightTab: t }),
    setActiveMobileTab: (t) => set({ activeMobileTab: t }),
    toggleShowMediaBin: () => set((s) => ({ showMediaBin: !s.showMediaBin })),
    toggleShowProperties: () => set((s) => ({ showProperties: !s.showProperties })),
    toggleShowAiPanel: () => set((s) => ({ showAiPanel: !s.showAiPanel })),
    toggleShowCaptions: () => set((s) => ({ showCaptions: !s.showCaptions, showProperties: s.showCaptions ? s.showProperties : false })),
    toggleTheaterMode: () => set((s) => ({
      theaterMode: !s.theaterMode,
      showMediaBin: s.theaterMode ? true : false,
      showProperties: s.theaterMode ? true : false,
    })),
  };
});
