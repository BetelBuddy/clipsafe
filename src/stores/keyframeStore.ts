import { create } from 'zustand';

export type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bezier';

export interface BezierPoints {
  x1: number; y1: number;
  x2: number; y2: number;
}

export interface Keyframe {
  id: string;
  clipId: string;
  property: string; // 'positionX' | 'positionY' | 'scale' | 'rotation' | 'opacity' | 'blur' | 'volume'
  time: number; // absolute time on timeline
  value: number;
  easing: EasingType;
  bezier?: BezierPoints;
}

export const ANIMATABLE_PROPERTIES = [
  { id: 'positionX', label: 'Position X', defaultValue: 0, min: -1920, max: 1920 },
  { id: 'positionY', label: 'Position Y', defaultValue: 0, min: -1080, max: 1080 },
  { id: 'scale', label: 'Scale', defaultValue: 1, min: 0.1, max: 5, step: 0.01 },
  { id: 'rotation', label: 'Rotation', defaultValue: 0, min: -360, max: 360 },
  { id: 'opacity', label: 'Opacity', defaultValue: 1, min: 0, max: 1, step: 0.01 },
  { id: 'blur', label: 'Blur', defaultValue: 0, min: 0, max: 50 },
  { id: 'volume', label: 'Volume', defaultValue: 1, min: 0, max: 2, step: 0.01 },
] as const;

const EASING_BEZIER: Record<EasingType, BezierPoints> = {
  'linear': { x1: 0, y1: 0, x2: 1, y2: 1 },
  'ease-in': { x1: 0.42, y1: 0, x2: 1, y2: 1 },
  'ease-out': { x1: 0, y1: 0, x2: 0.58, y2: 1 },
  'ease-in-out': { x1: 0.42, y1: 0, x2: 0.58, y2: 1 },
  'bezier': { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 },
};

/** Evaluate cubic bezier at parameter t */
function cubicBezier(t: number, p: BezierPoints): number {
  // De Casteljau's for y given x=t approximation
  // Newton-Raphson to find t for given x
  const { x1, y1, x2, y2 } = p;
  
  // Solve for parameter s where B_x(s) = t
  let s = t;
  for (let i = 0; i < 8; i++) {
    const bx = 3 * (1-s)*(1-s)*s*x1 + 3*(1-s)*s*s*x2 + s*s*s;
    const dbx = 3*(1-s)*(1-s)*x1 + 6*(1-s)*s*(x2-x1) + 3*s*s*(1-x2);
    if (Math.abs(dbx) < 1e-6) break;
    s -= (bx - t) / dbx;
    s = Math.max(0, Math.min(1, s));
  }
  
  return 3*(1-s)*(1-s)*s*y1 + 3*(1-s)*s*s*y2 + s*s*s;
}

interface KeyframeState {
  keyframes: Keyframe[];
  selectedKeyframeId: string | null;
  
  addKeyframe: (kf: Omit<Keyframe, 'id'>) => string;
  updateKeyframe: (id: string, updates: Partial<Keyframe>) => void;
  removeKeyframe: (id: string) => void;
  removeClipKeyframes: (clipId: string) => void;
  selectKeyframe: (id: string | null) => void;
  
  getClipKeyframes: (clipId: string) => Keyframe[];
  getPropertyKeyframes: (clipId: string, property: string) => Keyframe[];
  getInterpolatedValue: (clipId: string, property: string, time: number) => number;
}

export const useKeyframeStore = create<KeyframeState>((set, get) => ({
  keyframes: [],
  selectedKeyframeId: null,
  
  addKeyframe: (kf) => {
    const id = crypto.randomUUID();
    set((s) => ({ keyframes: [...s.keyframes, { ...kf, id }] }));
    return id;
  },
  
  updateKeyframe: (id, updates) => set((s) => ({
    keyframes: s.keyframes.map(k => k.id === id ? { ...k, ...updates } : k),
  })),
  
  removeKeyframe: (id) => set((s) => ({
    keyframes: s.keyframes.filter(k => k.id !== id),
    selectedKeyframeId: s.selectedKeyframeId === id ? null : s.selectedKeyframeId,
  })),
  
  removeClipKeyframes: (clipId) => set((s) => ({
    keyframes: s.keyframes.filter(k => k.clipId !== clipId),
  })),
  
  selectKeyframe: (id) => set({ selectedKeyframeId: id }),
  
  getClipKeyframes: (clipId) => get().keyframes.filter(k => k.clipId === clipId),
  
  getPropertyKeyframes: (clipId, property) => 
    get().keyframes
      .filter(k => k.clipId === clipId && k.property === property)
      .sort((a, b) => a.time - b.time),
  
  getInterpolatedValue: (clipId, property, time) => {
    const kfs = get().getPropertyKeyframes(clipId, property);
    if (kfs.length === 0) {
      const prop = ANIMATABLE_PROPERTIES.find(p => p.id === property);
      return prop?.defaultValue ?? 0;
    }
    if (kfs.length === 1) return kfs[0].value;
    
    // Before first keyframe
    if (time <= kfs[0].time) return kfs[0].value;
    // After last keyframe
    if (time >= kfs[kfs.length - 1].time) return kfs[kfs.length - 1].value;
    
    // Find surrounding keyframes
    let prev = kfs[0], next = kfs[1];
    for (let i = 0; i < kfs.length - 1; i++) {
      if (time >= kfs[i].time && time <= kfs[i + 1].time) {
        prev = kfs[i];
        next = kfs[i + 1];
        break;
      }
    }
    
    // Normalize t to [0, 1]
    const duration = next.time - prev.time;
    if (duration <= 0) return prev.value;
    const t = (time - prev.time) / duration;
    
    // Apply easing
    const bezierPts = prev.bezier || EASING_BEZIER[prev.easing] || EASING_BEZIER.linear;
    const easedT = cubicBezier(t, bezierPts);
    
    // Lerp
    return prev.value + (next.value - prev.value) * easedT;
  },
}));
