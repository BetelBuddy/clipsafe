import { useState, useCallback, useRef, useEffect } from 'react';
import { useCaptionsStore, type CaptionWord } from '@/stores/captionsStore';
import { useEditorStore } from '@/stores/editorStore';
import { cn } from '@/lib/utils';

export interface CaptionStyle {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  bgColor: string;
  bgOpacity: number;
  outlineColor: string;
  outlineWidth: number;
  shadowColor: string;
  shadowBlur: number;
  shadowX: number;
  shadowY: number;
  uppercase: boolean;
  activeWordColor: string;
  spokenWordColor: string;
  upcomingWordColor: string;
  letterSpacing: number;
  lineHeight: number;
  padding: number;
  borderRadius: number;
  maxWords: number;
  animation: 'none' | 'fade' | 'slide-up' | 'pop';
}

export const DEFAULT_CAPTION_STYLE: CaptionStyle = {
  x: 50,
  y: 85,
  fontSize: 28,
  fontFamily: 'sans-serif',
  fontWeight: 700,
  color: '#ffffff',
  bgColor: '#000000',
  bgOpacity: 0.6,
  outlineColor: '#000000',
  outlineWidth: 2,
  shadowColor: '#000000',
  shadowBlur: 4,
  shadowX: 0,
  shadowY: 2,
  uppercase: false,
  activeWordColor: '#facc15',
  spokenWordColor: '#ffffff',
  upcomingWordColor: '#a1a1aa',
  letterSpacing: 0,
  lineHeight: 1.4,
  padding: 8,
  borderRadius: 6,
  maxWords: 8,
  animation: 'none',
};

interface CaptionOverlayProps {
  captionStyle: CaptionStyle;
  onStyleChange: (style: CaptionStyle) => void;
  onCaptionClick: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function CaptionOverlay({ captionStyle, onStyleChange, onCaptionClick, containerRef }: CaptionOverlayProps) {
  const segments = useCaptionsStore((s) => s.segments);
  const playhead = useEditorStore((s) => s.playhead);
  const [dragging, setDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, sx: 0, sy: 0 });

  if (segments.length === 0) return null;

  // Find active words at current playhead
  const allWords = segments.flatMap((s) => s.words);
  const activeWords = allWords.filter(
    (w) => !w.deleted && w.type !== 'silence' && w.start <= playhead && w.end >= playhead - 1.5
  );

  // Get a window of words around current time for karaoke display
  const currentWordIdx = allWords.findIndex(
    (w) => !w.deleted && w.type !== 'silence' && w.start <= playhead && w.end >= playhead
  );
  if (currentWordIdx === -1 && activeWords.length === 0) return null;

  // Build a group of words to show (window around current)
  const visibleWords: CaptionWord[] = [];
  const maxW = captionStyle.maxWords;
  const half = Math.floor(maxW / 2);
  const validWords = allWords.filter((w) => !w.deleted && w.type !== 'silence');
  const curIdx = validWords.findIndex((w) => w.start <= playhead && w.end >= playhead);
  
  if (curIdx === -1) return null;
  
  const startIdx = Math.max(0, curIdx - half);
  const endIdx = Math.min(validWords.length, startIdx + maxW);
  for (let i = startIdx; i < endIdx; i++) {
    visibleWords.push(validWords[i]);
  }

  if (visibleWords.length === 0) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      sx: captionStyle.x,
      sy: captionStyle.y,
    };

    const onMove = (me: MouseEvent) => {
      const dx = ((me.clientX - dragStartRef.current.x) / rect.width) * 100;
      const dy = ((me.clientY - dragStartRef.current.y) / rect.height) * 100;
      onStyleChange({
        ...captionStyle,
        x: Math.max(5, Math.min(95, dragStartRef.current.sx + dx)),
        y: Math.max(5, Math.min(95, dragStartRef.current.sy + dy)),
      });
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const text = visibleWords.map((w) => (captionStyle.uppercase ? w.text.toUpperCase() : w.text));

  return (
    <div
      className={cn(
        'absolute z-30 cursor-grab select-none transition-opacity',
        dragging && 'cursor-grabbing',
      )}
      style={{
        left: `${captionStyle.x}%`,
        top: `${captionStyle.y}%`,
        transform: 'translate(-50%, -50%)',
        maxWidth: '80%',
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onCaptionClick();
      }}
    >
      <div
        style={{
          backgroundColor: captionStyle.bgOpacity > 0
            ? `${captionStyle.bgColor}${Math.round(captionStyle.bgOpacity * 255).toString(16).padStart(2, '0')}`
            : 'transparent',
          padding: `${captionStyle.padding}px ${captionStyle.padding * 1.5}px`,
          borderRadius: `${captionStyle.borderRadius}px`,
        }}
      >
        <div
          style={{
            fontFamily: captionStyle.fontFamily,
            fontSize: `${captionStyle.fontSize}px`,
            fontWeight: captionStyle.fontWeight,
            letterSpacing: `${captionStyle.letterSpacing}px`,
            lineHeight: captionStyle.lineHeight,
            textAlign: 'center',
            WebkitTextStroke: captionStyle.outlineWidth > 0
              ? `${captionStyle.outlineWidth}px ${captionStyle.outlineColor}`
              : undefined,
            textShadow: captionStyle.shadowBlur > 0
              ? `${captionStyle.shadowX}px ${captionStyle.shadowY}px ${captionStyle.shadowBlur}px ${captionStyle.shadowColor}`
              : undefined,
            whiteSpace: 'nowrap',
          }}
        >
          {visibleWords.map((word, i) => {
            const isCurrent = word.start <= playhead && word.end >= playhead;
            const isSpoken = word.end < playhead;
            let wordColor = captionStyle.upcomingWordColor;
            if (isCurrent) wordColor = captionStyle.activeWordColor;
            else if (isSpoken) wordColor = captionStyle.spokenWordColor;

            return (
              <span
                key={word.id}
                style={{
                  color: wordColor,
                  transition: 'color 0.15s ease',
                  paintOrder: 'stroke fill',
                }}
              >
                {captionStyle.uppercase ? word.text.toUpperCase() : word.text}
                {i < visibleWords.length - 1 ? ' ' : ''}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
