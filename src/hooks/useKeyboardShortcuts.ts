import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVideoStore } from '@/stores/videoStore';
import { useEditorStore } from '@/stores/editorStore';

const toolPaths = [
  '/app/trim', '/app/compress', '/app/convert', '/app/merge',
  '/app/audio', '/app/resize', '/app/subtitles', '/app/tools',
];

export const SHORTCUTS = [
  { keys: ['Space'], action: 'Play / Pause' },
  { keys: ['J'], action: 'Play reverse (tap for speed)' },
  { keys: ['K'], action: 'Pause / Stop' },
  { keys: ['L'], action: 'Play forward (tap for speed)' },
  { keys: ['S'], action: 'Split clip at playhead' },
  { keys: ['Del'], action: 'Delete selected clips' },
  { keys: ['Ctrl', 'D'], action: 'Duplicate selected' },
  { keys: ['Ctrl', 'Z'], action: 'Undo' },
  { keys: ['Ctrl', 'Y'], action: 'Redo' },
  { keys: ['Ctrl', 'A'], action: 'Select all clips' },
  { keys: ['O'], action: 'Open file picker' },
  { keys: ['1–8'], action: 'Switch to tool 1–8' },
  { keys: ['←'], action: 'Seek back 5s / 1 frame (Shift)' },
  { keys: ['→'], action: 'Seek forward 5s / 1 frame (Shift)' },
  { keys: ['+'], action: 'Zoom in timeline' },
  { keys: ['-'], action: 'Zoom out timeline' },
  { keys: ['Home'], action: 'Go to start' },
  { keys: ['End'], action: 'Go to end' },
  { keys: ['Ctrl', 'Enter'], action: 'Start processing' },
  { keys: ['Esc'], action: 'Cancel / close modals' },
  { keys: ['?'], action: 'Show keyboard shortcuts' },
];

// JKL shuttle speeds
const JKL_SPEEDS = [0, 0.5, 1, 2, 4, 8];

export function useKeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);
  const [jklDirection, setJklDirection] = useState<'forward' | 'reverse' | 'stopped'>('stopped');
  const [jklSpeedIndex, setJklSpeedIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { fileUrl } = useVideoStore();
  const isEditor = location.pathname === '/editor';

  const handleKey = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    const ctrl = e.ctrlKey || e.metaKey;

    // ? — help
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      e.preventDefault();
      setShowHelp(v => !v);
      return;
    }

    // Escape
    if (e.key === 'Escape') {
      setShowHelp(false);
      return;
    }

    // Editor-specific shortcuts
    if (isEditor) {
      const store = useEditorStore.getState();

      // Space — play/pause
      if (e.code === 'Space') {
        e.preventDefault();
        store.setPlaying(!store.isPlaying);
        setJklDirection('stopped');
        setJklSpeedIndex(0);
        return;
      }

      // J — reverse playback (NLE shuttle)
      if (e.key === 'j' && !ctrl) {
        e.preventDefault();
        if (jklDirection === 'reverse') {
          // Increase reverse speed
          const newIndex = Math.min(jklSpeedIndex + 1, JKL_SPEEDS.length - 1);
          setJklSpeedIndex(newIndex);
          store.setPlaybackRate(-JKL_SPEEDS[newIndex]);
        } else {
          // Start reverse
          setJklDirection('reverse');
          setJklSpeedIndex(2);
          store.setPlaybackRate(-1);
          store.setPlaying(true);
        }
        return;
      }

      // K — stop/pause (NLE shuttle)
      if (e.key === 'k' && !ctrl) {
        e.preventDefault();
        store.setPlaying(false);
        store.setPlaybackRate(1);
        setJklDirection('stopped');
        setJklSpeedIndex(0);
        return;
      }

      // L — forward playback (NLE shuttle)
      if (e.key === 'l' && !ctrl) {
        e.preventDefault();
        if (jklDirection === 'forward') {
          // Increase forward speed
          const newIndex = Math.min(jklSpeedIndex + 1, JKL_SPEEDS.length - 1);
          setJklSpeedIndex(newIndex);
          store.setPlaybackRate(JKL_SPEEDS[newIndex]);
        } else {
          // Start forward
          setJklDirection('forward');
          setJklSpeedIndex(2);
          store.setPlaybackRate(1);
          store.setPlaying(true);
        }
        return;
      }

      // S — split
      if (e.key === 's' && !ctrl) {
        e.preventDefault();
        store.splitClipAtPlayhead();
        return;
      }

      // Delete/Backspace — delete selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        store.deleteSelected();
        return;
      }

      // Ctrl+D — duplicate
      if (ctrl && e.key === 'd') {
        e.preventDefault();
        store.duplicateSelected();
        return;
      }

      // Ctrl+Z — undo
      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        store.undo();
        return;
      }

      // Ctrl+Y or Ctrl+Shift+Z — redo
      if ((ctrl && e.key === 'y') || (ctrl && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        store.redo();
        return;
      }

      // Ctrl+A — select all
      if (ctrl && e.key === 'a') {
        e.preventDefault();
        store.selectAll();
        return;
      }

      // +/- — zoom
      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        store.setZoom(store.zoom * 1.2);
        return;
      }
      if (e.key === '-') {
        e.preventDefault();
        store.setZoom(store.zoom * 0.8);
        return;
      }

      // Home/End
      if (e.key === 'Home') {
        e.preventDefault();
        store.setPlayhead(0);
        return;
      }
      if (e.key === 'End') {
        e.preventDefault();
        store.setPlayhead(store.duration);
        return;
      }

      // Arrow keys — seek
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        store.setPlayhead(store.playhead - (e.shiftKey ? 1 / 30 : 5));
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        store.setPlayhead(store.playhead + (e.shiftKey ? 1 / 30 : 5));
        return;
      }
    }

    // O or I — open file / import
    if (e.key === 'o' || e.key === 'O' || e.key === 'i' || e.key === 'I') {
      if (ctrl) return; // don't intercept Ctrl+I
      e.preventDefault();
      if (isEditor) {
        useEditorStore.getState().triggerImport();
      } else {
        const input = document.querySelector<HTMLInputElement>('input[type="file"]');
        input?.click();
      }
      return;
    }

    // 1-8 — tool switch (non-editor)
    if (!isEditor) {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 8) {
        e.preventDefault();
        navigate(toolPaths[num - 1]);
        return;
      }

      // Space — play/pause video element
      if (e.code === 'Space') {
        e.preventDefault();
        const video = document.querySelector<HTMLVideoElement>('video');
        if (video) video.paused ? video.play() : video.pause();
        return;
      }

      // Arrow keys — seek
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const video = document.querySelector<HTMLVideoElement>('video');
        if (video && fileUrl) {
          e.preventDefault();
          video.currentTime += e.key === 'ArrowLeft' ? -5 : 5;
        }
        return;
      }
    }
  }, [navigate, fileUrl, isEditor]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return { showHelp, setShowHelp };
}
