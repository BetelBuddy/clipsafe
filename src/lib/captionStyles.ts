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
