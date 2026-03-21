import { lazy } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Scissors, Minimize2, RefreshCw, Merge, Volume2, Maximize2, MessageSquare,
  Wrench, FileImage, Undo2, Repeat, Paintbrush, Timer, Split,
  Crop, RotateCw, FlipHorizontal2, Square, RatioIcon,
  Gauge, FastForward, Rewind, IterationCw,
  CircleDot, Sparkles, SunDim, Eclipse, SunMedium, Film,
  FlipVertical2, Scan, Grid3x3, Droplets,
  VolumeX, AudioLines, Headphones, Music,
  Type, Clock, Image, Layers,
  PictureInPicture2, LayoutGrid, AlignVerticalSpaceAround,
  Camera, TableProperties, FileAudio, Hash, Activity,
  Zap, Globe, ImagePlus, ArrowDownUp, Info,
  Moon, Aperture, ZoomIn, Frame, Pause, Footprints,
  Palette, CircleOff, Sliders, Rainbow, Spline, Crosshair,
  Sparkles as Grain, Stamp, Thermometer, Sun, PenTool, Dice1,
  Music2, Mic, GitBranch, Radio, Rewind as RewindIcon,
  ShieldAlert, FileVideo, Clapperboard, Download, FileDown,
  TimerOff, ScrollText, Box,
  Grid2x2 as Grid2x2Icon, SplitSquareHorizontal, Layers2,
  ImageDown, ImageMinus, Clock4,
  BarChart3, PieChart, MicOff,
  Captions, AlignCenter, Bold, Highlighter, LetterText, Rows3,
  PaintBucket, MoveHorizontal, RectangleHorizontal, Subtitles, Wand2,
  // Phase 15 icons
  Contrast, Eye, CircleDashed, Brush, Pencil, Focus,
  Disc, SlidersHorizontal, BellOff, Volume1,
  Move, Glasses, Monitor, AlarmClock,
  CreditCard, BarChart2, Pipette, Wind, SunSnow, Share2, Anchor, ArrowRightLeft,
} from 'lucide-react';



export type ToolCategory =
  | 'cut-trim'
  | 'transform'
  | 'speed-time'
  | 'color-filters'
  | 'audio'
  | 'format-export'
  | 'text-overlay'
  | 'combine-layout'
  | 'extract-analyze'
  | 'captions'
  | 'transitions'
  | 'pro-color'
  | 'social-export'
  | 'stabilize-fix'
  | 'ai-smart';

export interface ToolDef {
  id: string;
  title: string;
  description: string;
  category: ToolCategory;
  icon: LucideIcon;
  keywords: string[];
  component: React.LazyExoticComponent<React.ComponentType<unknown>>;
}

export interface CategoryDef {
  id: ToolCategory;
  title: string;
  icon: LucideIcon;
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'cut-trim', title: 'Cut & Trim', icon: Scissors },
  { id: 'transform', title: 'Transform', icon: Maximize2 },
  { id: 'speed-time', title: 'Speed & Time', icon: Timer },
  { id: 'color-filters', title: 'Color & Filters', icon: Paintbrush },
  { id: 'pro-color', title: 'Pro Color', icon: Palette },
  { id: 'audio', title: 'Audio', icon: Volume2 },
  { id: 'transitions', title: 'Transitions', icon: ArrowRightLeft },
  { id: 'format-export', title: 'Format & Export', icon: RefreshCw },
  { id: 'social-export', title: 'Social Export', icon: Share2 },
  { id: 'text-overlay', title: 'Text & Overlay', icon: Type },
  { id: 'captions', title: 'Captions', icon: Captions },
  { id: 'combine-layout', title: 'Combine & Layout', icon: Layers },
  { id: 'extract-analyze', title: 'Extract & Analyze', icon: Camera },
  { id: 'stabilize-fix', title: 'Stabilize & Fix', icon: Anchor },
  { id: 'ai-smart', title: 'AI Smart', icon: Sparkles },
];

// Existing tool pages
const ExistingTrim = lazy(() => import('@/pages/TrimTool'));
const ExistingCompress = lazy(() => import('@/pages/CompressTool'));
const ExistingConvert = lazy(() => import('@/pages/ConvertTool'));
const ExistingMerge = lazy(() => import('@/pages/MergeTool'));
const ExistingAudio = lazy(() => import('@/pages/AudioTool'));
const ExistingResize = lazy(() => import('@/pages/ResizeTool'));
const ExistingSubtitles = lazy(() => import('@/pages/SubtitlesTool'));
const ExistingGif = lazy(() => import('@/pages/GifMakerTool'));
const ExistingReverse = lazy(() => import('@/pages/ReverseTool'));
const ExistingLoop = lazy(() => import('@/pages/LoopTool'));
const ExistingColor = lazy(() => import('@/pages/ColorTool'));
const ExistingFrameRate = lazy(() => import('@/pages/FrameRateTool'));
const ExistingSplit = lazy(() => import('@/pages/SplitTool'));
const ExistingUtilities = lazy(() => import('@/pages/UtilitiesTool'));

// Original tool configs
const CropTool = lazy(() => import('@/components/tools/configs/CropTool'));
const RotateTool = lazy(() => import('@/components/tools/configs/RotateTool'));
const FlipTool = lazy(() => import('@/components/tools/configs/FlipTool'));
const PadTool = lazy(() => import('@/components/tools/configs/PadTool'));
const AspectRatioTool = lazy(() => import('@/components/tools/configs/AspectRatioTool'));
const SlowMotionTool = lazy(() => import('@/components/tools/configs/SlowMotionTool'));
const TimelapseTool = lazy(() => import('@/components/tools/configs/TimelapseTool'));
const BoomerangTool = lazy(() => import('@/components/tools/configs/BoomerangTool'));
const BlurTool = lazy(() => import('@/components/tools/configs/BlurTool'));
const SharpenTool = lazy(() => import('@/components/tools/configs/SharpenTool'));
const DenoiseTool = lazy(() => import('@/components/tools/configs/DenoiseTool'));
const VignetteTool = lazy(() => import('@/components/tools/configs/VignetteTool'));
const FadeTool = lazy(() => import('@/components/tools/configs/FadeTool'));
const VintageTool = lazy(() => import('@/components/tools/configs/VintageTool'));
const BlackWhiteTool = lazy(() => import('@/components/tools/configs/BlackWhiteTool'));
const MirrorTool = lazy(() => import('@/components/tools/configs/MirrorTool'));
const EdgeDetectTool = lazy(() => import('@/components/tools/configs/EdgeDetectTool'));
const PosterizeTool = lazy(() => import('@/components/tools/configs/PosterizeTool'));
const PixelateTool = lazy(() => import('@/components/tools/configs/PixelateTool'));
const GlitchTool = lazy(() => import('@/components/tools/configs/GlitchTool'));
const VolumeNormTool = lazy(() => import('@/components/tools/configs/VolumeNormalizeTool'));
const AudioFadeTool = lazy(() => import('@/components/tools/configs/AudioFadeTool'));
const BassBoostTool = lazy(() => import('@/components/tools/configs/BassBoostTool'));
const EchoTool = lazy(() => import('@/components/tools/configs/EchoTool'));
const TextOverlayTool = lazy(() => import('@/components/tools/configs/TextOverlayTool'));
const TimestampTool = lazy(() => import('@/components/tools/configs/TimestampOverlayTool'));
const PipTool = lazy(() => import('@/components/tools/configs/PipTool'));
const SideBySideTool = lazy(() => import('@/components/tools/configs/SideBySideTool'));
const ThumbnailGridTool = lazy(() => import('@/components/tools/configs/ThumbnailGridTool'));
const SpeedChangeTool = lazy(() => import('@/components/tools/configs/SpeedChangeTool'));
const RemoveSilenceTool = lazy(() => import('@/components/tools/configs/RemoveSilenceTool'));
const SceneDetectTool = lazy(() => import('@/components/tools/configs/SceneDetectTool'));
const WebpMakerTool = lazy(() => import('@/components/tools/configs/WebpMakerTool'));
const ImageOverlayTool = lazy(() => import('@/components/tools/configs/ImageOverlayTool'));
const StackVerticalTool = lazy(() => import('@/components/tools/configs/StackVerticalTool'));
const Grid2x2Tool = lazy(() => import('@/components/tools/configs/Grid2x2Tool'));
const FrameCountTool = lazy(() => import('@/components/tools/configs/FrameCountTool'));
const MetadataTool = lazy(() => import('@/components/tools/configs/MetadataTool'));
const AudioVisualizerTool = lazy(() => import('@/components/tools/configs/AudioVisualizerTool'));

// ===== NEW 45 tools =====
const FadeToBlackTool = lazy(() => import('@/components/tools/configs/FadeToBlackTool'));
const ExtractSegmentTool = lazy(() => import('@/components/tools/configs/ExtractSegmentTool'));
const Scale2xTool = lazy(() => import('@/components/tools/configs/Scale2xTool'));
const FitToCanvasTool = lazy(() => import('@/components/tools/configs/FitToCanvasTool'));
const FreezeFrameTool = lazy(() => import('@/components/tools/configs/FreezeFrameTool'));
const StepPrintTool = lazy(() => import('@/components/tools/configs/StepPrintTool'));
const SepiaTool = lazy(() => import('@/components/tools/configs/SepiaTool'));
const InvertTool = lazy(() => import('@/components/tools/configs/InvertTool'));
const ColorBalanceTool = lazy(() => import('@/components/tools/configs/ColorBalanceTool'));
const HueShiftTool = lazy(() => import('@/components/tools/configs/HueShiftTool'));
const CurvesTool = lazy(() => import('@/components/tools/configs/CurvesTool'));
const ChromaticAberrationTool = lazy(() => import('@/components/tools/configs/ChromaticAberrationTool'));
const FilmGrainTool = lazy(() => import('@/components/tools/configs/FilmGrainTool'));
const EmbossTool = lazy(() => import('@/components/tools/configs/EmbossTool'));
const ThermalTool = lazy(() => import('@/components/tools/configs/ThermalTool'));
const SolarizeTool = lazy(() => import('@/components/tools/configs/SolarizeTool'));
const CartoonTool = lazy(() => import('@/components/tools/configs/CartoonTool'));
const DitherTool = lazy(() => import('@/components/tools/configs/DitherTool'));
const TrebleBoostTool = lazy(() => import('@/components/tools/configs/TrebleBoostTool'));
const AudioSpeedTool = lazy(() => import('@/components/tools/configs/AudioSpeedTool'));
const PitchShiftTool = lazy(() => import('@/components/tools/configs/PitchShiftTool'));
const StereoWidenTool = lazy(() => import('@/components/tools/configs/StereoWidenTool'));
const AudioReverseTool = lazy(() => import('@/components/tools/configs/AudioReverseTool'));
const NoiseGateTool = lazy(() => import('@/components/tools/configs/NoiseGateTool'));
const ApngMakerTool = lazy(() => import('@/components/tools/configs/ApngMakerTool'));
const ExtractFramesTool = lazy(() => import('@/components/tools/configs/ExtractFramesTool'));
const Av1EncodeTool = lazy(() => import('@/components/tools/configs/Av1EncodeTool'));
const ProResExportTool = lazy(() => import('@/components/tools/configs/ProResExportTool'));
const AudioOnlyExportTool = lazy(() => import('@/components/tools/configs/AudioOnlyExportTool'));
const CountdownTimerTool = lazy(() => import('@/components/tools/configs/CountdownTimerTool'));
const ScrollingTextTool = lazy(() => import('@/components/tools/configs/ScrollingTextTool'));
const BorderFrameTool = lazy(() => import('@/components/tools/configs/BorderFrameTool'));
const BlurBackgroundTool = lazy(() => import('@/components/tools/configs/BlurBackgroundTool'));
const Grid3x3Tool = lazy(() => import('@/components/tools/configs/Grid3x3Tool'));
const SplitScreenTool = lazy(() => import('@/components/tools/configs/SplitScreenTool'));
const OverlayBlendTool = lazy(() => import('@/components/tools/configs/OverlayBlendTool'));
const CrossDissolveTool = lazy(() => import('@/components/tools/configs/CrossDissolveTool'));
const FirstFrameTool = lazy(() => import('@/components/tools/configs/FirstFrameTool'));
const LastFrameTool = lazy(() => import('@/components/tools/configs/LastFrameTool'));
const FrameAtTimeTool = lazy(() => import('@/components/tools/configs/FrameAtTimeTool'));
const EveryNthFrameTool = lazy(() => import('@/components/tools/configs/EveryNthFrameTool'));
const DurationInfoTool = lazy(() => import('@/components/tools/configs/DurationInfoTool'));
const BitrateGraphTool = lazy(() => import('@/components/tools/configs/BitrateGraphTool'));
const ColorHistogramTool = lazy(() => import('@/components/tools/configs/ColorHistogramTool'));
const SilenceDetectTool = lazy(() => import('@/components/tools/configs/SilenceDetectTool'));

// ===== Caption tools =====
const CaptionsProTool = lazy(() => import('@/components/tools/configs/CaptionsProTool'));
const CaptionFadeInTool = lazy(() => import('@/components/tools/configs/CaptionFadeInTool'));
const CaptionOutlineTool = lazy(() => import('@/components/tools/configs/CaptionOutlineTool'));
const CaptionShadowTool = lazy(() => import('@/components/tools/configs/CaptionShadowTool'));
const CaptionBoxTool = lazy(() => import('@/components/tools/configs/CaptionBoxTool'));
const CaptionPositionTool = lazy(() => import('@/components/tools/configs/CaptionPositionTool'));
const CaptionColorTool = lazy(() => import('@/components/tools/configs/CaptionColorTool'));
const CaptionSizeTool = lazy(() => import('@/components/tools/configs/CaptionSizeTool'));
const UppercaseCaptionsTool = lazy(() => import('@/components/tools/configs/UppercaseCaptionsTool'));
const KaraokeCaptionsTool = lazy(() => import('@/components/tools/configs/KaraokeCaptionsTool'));
const MultiLineCaptionsTool = lazy(() => import('@/components/tools/configs/MultiLineCaptionsTool'));
const CaptionStrokeTool = lazy(() => import('@/components/tools/configs/CaptionStrokeTool'));
const AnimatedCaptionSlideTool = lazy(() => import('@/components/tools/configs/AnimatedCaptionSlideTool'));
const CaptionGradientBgTool = lazy(() => import('@/components/tools/configs/CaptionGradientBgTool'));
const SrtBurnInTool = lazy(() => import('@/components/tools/configs/SrtBurnInTool'));
const AutoCaptionStyleTool = lazy(() => import('@/components/tools/configs/AutoCaptionStyleTool'));

// ===== Phase 15 new tools =====
const DuotoneTool = lazy(() => import('@/components/tools/configs/DuotoneTool'));
const NightVisionTool = lazy(() => import('@/components/tools/configs/NightVisionTool'));
const HalftoneTool = lazy(() => import('@/components/tools/configs/HalftoneTool'));
const OilPaintTool = lazy(() => import('@/components/tools/configs/OilPaintTool'));
const PencilSketchTool = lazy(() => import('@/components/tools/configs/PencilSketchTool'));
const TiltShiftTool = lazy(() => import('@/components/tools/configs/TiltShiftTool'));
const CompressorTool = lazy(() => import('@/components/tools/configs/CompressorTool'));
const EqualizerTool = lazy(() => import('@/components/tools/configs/EqualizerTool'));
const DeEsserTool = lazy(() => import('@/components/tools/configs/DeEsserTool'));
const LoudnormTool = lazy(() => import('@/components/tools/configs/LoudnormTool'));
const KenBurnsTool = lazy(() => import('@/components/tools/configs/KenBurnsTool'));
const LensCorrectionTool = lazy(() => import('@/components/tools/configs/LensCorrectionTool'));
const DeinterlaceTool = lazy(() => import('@/components/tools/configs/DeinterlaceTool'));
const AudioDelayTool = lazy(() => import('@/components/tools/configs/AudioDelayTool'));
const LowerThirdTool = lazy(() => import('@/components/tools/configs/LowerThirdTool'));
const ProgressBarTool = lazy(() => import('@/components/tools/configs/ProgressBarTool'));
const ChromaKeyTool = lazy(() => import('@/components/tools/configs/ChromaKeyTool'));
const MotionBlurTool = lazy(() => import('@/components/tools/configs/MotionBlurTool'));
const AutoLevelsTool = lazy(() => import('@/components/tools/configs/AutoLevelsTool'));

// ===== New Categories: Transitions, Pro Color, Social Export, Stabilize & Fix, AI Smart =====
const FadeBlackTransitionTool = lazy(() => import('@/components/tools/configs/FadeBlackTransitionTool'));
const FadeWhiteTransitionTool = lazy(() => import('@/components/tools/configs/FadeWhiteTransitionTool'));
const CrossZoomTransitionTool = lazy(() => import('@/components/tools/configs/CrossZoomTransitionTool'));
const Spin360TransitionTool = lazy(() => import('@/components/tools/configs/Spin360TransitionTool'));
const SlideLeftTransitionTool = lazy(() => import('@/components/tools/configs/SlideLeftTransitionTool'));
const SlideRightTransitionTool = lazy(() => import('@/components/tools/configs/SlideRightTransitionTool'));
const SlideUpTransitionTool = lazy(() => import('@/components/tools/configs/SlideUpTransitionTool'));
const SlideDownTransitionTool = lazy(() => import('@/components/tools/configs/SlideDownTransitionTool'));
const PushTransitionTool = lazy(() => import('@/components/tools/configs/PushTransitionTool'));
const WipeLeftTransitionTool = lazy(() => import('@/components/tools/configs/WipeLeftTransitionTool'));
const WipeRightTransitionTool = lazy(() => import('@/components/tools/configs/WipeRightTransitionTool'));
const CircleWipeTransitionTool = lazy(() => import('@/components/tools/configs/CircleWipeTransitionTool'));
const ClockWipeTransitionTool = lazy(() => import('@/components/tools/configs/ClockWipeTransitionTool'));
const IrisInTransitionTool = lazy(() => import('@/components/tools/configs/IrisInTransitionTool'));
const IrisOutTransitionTool = lazy(() => import('@/components/tools/configs/IrisOutTransitionTool'));
const FilmBurnTransitionTool = lazy(() => import('@/components/tools/configs/FilmBurnTransitionTool'));
const GlitchTransitionTool = lazy(() => import('@/components/tools/configs/GlitchTransitionTool'));
const WhipPanTransitionTool = lazy(() => import('@/components/tools/configs/WhipPanTransitionTool'));
const ZoomInTransitionTool = lazy(() => import('@/components/tools/configs/ZoomInTransitionTool'));
const ZoomOutTransitionTool = lazy(() => import('@/components/tools/configs/ZoomOutTransitionTool'));

const LutImportTool = lazy(() => import('@/components/tools/configs/LutImportTool'));
const CinematicOrangeTealTool = lazy(() => import('@/components/tools/configs/CinematicOrangeTealTool'));
const FilmPrintTool = lazy(() => import('@/components/tools/configs/FilmPrintTool'));
const KodakPortraTool = lazy(() => import('@/components/tools/configs/KodakPortraTool'));
const FujiVelviaTool = lazy(() => import('@/components/tools/configs/FujiVelviaTool'));
const KodachromeTool = lazy(() => import('@/components/tools/configs/KodachromeTool'));
const AcesConvertTool = lazy(() => import('@/components/tools/configs/AcesConvertTool'));
const LogToRec709Tool = lazy(() => import('@/components/tools/configs/LogToRec709Tool'));
const HdrToSdrTool = lazy(() => import('@/components/tools/configs/HdrToSdrTool'));
const SdrToHdrTool = lazy(() => import('@/components/tools/configs/SdrToHdrTool'));
const ColorMatchTool = lazy(() => import('@/components/tools/configs/ColorMatchTool'));
const WhiteBalanceAutoTool = lazy(() => import('@/components/tools/configs/WhiteBalanceAutoTool'));
const SkinToneFixTool = lazy(() => import('@/components/tools/configs/SkinToneFixTool'));
const RgbParadeTool = lazy(() => import('@/components/tools/configs/RgbParadeTool'));
const VectorscopeTool = lazy(() => import('@/components/tools/configs/VectorscopeTool'));
const WaveformMonitorTool = lazy(() => import('@/components/tools/configs/WaveformMonitorTool'));
const FalseColorTool = lazy(() => import('@/components/tools/configs/FalseColorTool'));
const ZebraStripesTool = lazy(() => import('@/components/tools/configs/ZebraStripesTool'));
const ExposureFixTool = lazy(() => import('@/components/tools/configs/ExposureFixTool'));
const SplitToneTool = lazy(() => import('@/components/tools/configs/SplitToneTool'));

const TikTok916Tool = lazy(() => import('@/components/tools/configs/TikTok916Tool'));
const InstagramReelsTool = lazy(() => import('@/components/tools/configs/InstagramReelsTool'));
const YouTubeShortsTool = lazy(() => import('@/components/tools/configs/YouTubeShortsTool'));
const StoriesExportTool = lazy(() => import('@/components/tools/configs/StoriesExportTool'));
const TwitterXVideoTool = lazy(() => import('@/components/tools/configs/TwitterXVideoTool'));
const LinkedInVideoTool = lazy(() => import('@/components/tools/configs/LinkedInVideoTool'));
const FacebookCoverTool = lazy(() => import('@/components/tools/configs/FacebookCoverTool'));
const PinterestPinTool = lazy(() => import('@/components/tools/configs/PinterestPinTool'));
const ThumbnailGeneratorTool = lazy(() => import('@/components/tools/configs/ThumbnailGeneratorTool'));
const SquareExportTool = lazy(() => import('@/components/tools/configs/SquareExportTool'));

const VideoStabilizeTool = lazy(() => import('@/components/tools/configs/VideoStabilizeTool'));
const ShakeReduceTool = lazy(() => import('@/components/tools/configs/ShakeReduceTool'));
const RollingShutterFixTool = lazy(() => import('@/components/tools/configs/RollingShutterFixTool'));
const HorizonLevelTool = lazy(() => import('@/components/tools/configs/HorizonLevelTool'));
const AutoRotateFixTool = lazy(() => import('@/components/tools/configs/AutoRotateFixTool'));
const FlickerRemoveTool = lazy(() => import('@/components/tools/configs/FlickerRemoveTool'));
const DeadPixelFixTool = lazy(() => import('@/components/tools/configs/DeadPixelFixTool'));
const AudioHumRemoveTool = lazy(() => import('@/components/tools/configs/AudioHumRemoveTool'));
const AudioClickRemoveTool = lazy(() => import('@/components/tools/configs/AudioClickRemoveTool'));
const SyncAudioVideoTool = lazy(() => import('@/components/tools/configs/SyncAudioVideoTool'));

const AutoEnhanceTool = lazy(() => import('@/components/tools/configs/AutoEnhanceTool'));
const SmartCropAiTool = lazy(() => import('@/components/tools/configs/SmartCropAiTool'));
const AutoColorCorrectAiTool = lazy(() => import('@/components/tools/configs/AutoColorCorrectAiTool'));
const ObjectBlurTool = lazy(() => import('@/components/tools/configs/ObjectBlurTool'));
const FaceTrackZoomTool = lazy(() => import('@/components/tools/configs/FaceTrackZoomTool'));
const AutoReframeTool = lazy(() => import('@/components/tools/configs/AutoReframeTool'));
const BackgroundRemoveTool = lazy(() => import('@/components/tools/configs/BackgroundRemoveTool'));
const UpscaleAiTool = lazy(() => import('@/components/tools/configs/UpscaleAiTool'));

export const TOOLS: ToolDef[] = [
  // ==================== Cut & Trim ====================
  { id: 'trim', title: 'Trim', description: 'Cut video to perfect length', category: 'cut-trim', icon: Scissors, keywords: ['trim', 'cut', 'clip', 'shorten'], component: ExistingTrim },
  { id: 'split', title: 'Split', description: 'Split video into segments', category: 'cut-trim', icon: Split, keywords: ['split', 'divide', 'segment'], component: ExistingSplit },
  { id: 'remove-silence', title: 'Remove Silence', description: 'Cut silent segments automatically', category: 'cut-trim', icon: VolumeX, keywords: ['silence', 'remove', 'cut', 'quiet', 'mute'], component: RemoveSilenceTool },
  { id: 'scene-detect', title: 'Scene Detect', description: 'Split by scene changes', category: 'cut-trim', icon: Scan, keywords: ['scene', 'detect', 'split', 'auto', 'change'], component: SceneDetectTool },
  { id: 'fade-to-black', title: 'Fade to Black', description: 'Fade video to black at end', category: 'cut-trim', icon: Moon, keywords: ['fade', 'black', 'end', 'out', 'transition'], component: FadeToBlackTool },
  { id: 'extract-segment', title: 'Extract Segment', description: 'Extract time range without re-encoding', category: 'cut-trim', icon: Scissors, keywords: ['extract', 'segment', 'range', 'copy', 'lossless'], component: ExtractSegmentTool },

  // ==================== Transform ====================
  { id: 'resize', title: 'Resize', description: 'Change resolution', category: 'transform', icon: Maximize2, keywords: ['resize', 'resolution', 'scale', 'dimension'], component: ExistingResize },
  { id: 'crop', title: 'Crop', description: 'Crop to region', category: 'transform', icon: Crop, keywords: ['crop', 'cut', 'region'], component: CropTool },
  { id: 'rotate', title: 'Rotate', description: 'Rotate 90°/180°/270°', category: 'transform', icon: RotateCw, keywords: ['rotate', 'turn', 'orientation'], component: RotateTool },
  { id: 'flip', title: 'Flip', description: 'Flip horizontal/vertical', category: 'transform', icon: FlipHorizontal2, keywords: ['flip', 'mirror', 'horizontal', 'vertical'], component: FlipTool },
  { id: 'pad', title: 'Pad', description: 'Add letterbox/pillarbox', category: 'transform', icon: Square, keywords: ['pad', 'letterbox', 'pillarbox', 'border'], component: PadTool },
  { id: 'aspect-ratio', title: 'Aspect Ratio', description: 'Force aspect ratio', category: 'transform', icon: RatioIcon, keywords: ['aspect', 'ratio', '16:9', '4:3'], component: AspectRatioTool },
  { id: 'scale-2x', title: 'Scale 2x', description: 'Double resolution with lanczos', category: 'transform', icon: ZoomIn, keywords: ['scale', 'upscale', '2x', 'double', 'lanczos', 'enlarge'], component: Scale2xTool },
  { id: 'fit-canvas', title: 'Fit to Canvas', description: 'Scale + pad to exact dimensions', category: 'transform', icon: Frame, keywords: ['fit', 'canvas', 'pad', 'aspect', 'letterbox'], component: FitToCanvasTool },

  // ==================== Speed & Time ====================
  { id: 'reverse', title: 'Reverse', description: 'Play backwards', category: 'speed-time', icon: Undo2, keywords: ['reverse', 'backwards', 'rewind'], component: ExistingReverse },
  { id: 'loop', title: 'Loop', description: 'Repeat video', category: 'speed-time', icon: Repeat, keywords: ['loop', 'repeat', 'cycle'], component: ExistingLoop },
  { id: 'speed-change', title: 'Speed Change', description: 'Change playback speed 0.25x-4x', category: 'speed-time', icon: Gauge, keywords: ['speed', 'fast', 'slow', 'playback', 'velocity'], component: SpeedChangeTool },
  { id: 'slow-motion', title: 'Slow Motion', description: '0.25x to 0.5x speed', category: 'speed-time', icon: Gauge, keywords: ['slow', 'motion', 'speed', 'slowmo'], component: SlowMotionTool },
  { id: 'timelapse', title: 'Timelapse', description: '4x to 32x speed', category: 'speed-time', icon: FastForward, keywords: ['timelapse', 'fast', 'speed', 'accelerate'], component: TimelapseTool },
  { id: 'boomerang', title: 'Boomerang', description: 'Forward then reverse', category: 'speed-time', icon: IterationCw, keywords: ['boomerang', 'bounce', 'instagram'], component: BoomerangTool },
  { id: 'freeze-frame', title: 'Freeze Frame', description: 'Hold a single frame for N seconds', category: 'speed-time', icon: Pause, keywords: ['freeze', 'frame', 'hold', 'still', 'pause'], component: FreezeFrameTool },
  { id: 'step-print', title: 'Step Printing', description: 'Stuttery stop-motion effect', category: 'speed-time', icon: Footprints, keywords: ['step', 'print', 'stop', 'motion', 'stutter', 'drop'], component: StepPrintTool },

  // ==================== Color & Filters ====================
  { id: 'color', title: 'Color Adjust', description: 'Brightness, contrast, saturation', category: 'color-filters', icon: Paintbrush, keywords: ['color', 'brightness', 'contrast', 'saturation'], component: ExistingColor },
  { id: 'blur', title: 'Blur', description: 'Gaussian & box blur', category: 'color-filters', icon: CircleDot, keywords: ['blur', 'gaussian', 'smooth', 'soft'], component: BlurTool },
  { id: 'sharpen', title: 'Sharpen', description: 'Sharpen video', category: 'color-filters', icon: Sparkles, keywords: ['sharpen', 'crisp', 'clear'], component: SharpenTool },
  { id: 'denoise', title: 'Denoise', description: 'Reduce noise', category: 'color-filters', icon: SunDim, keywords: ['denoise', 'noise', 'grain', 'clean'], component: DenoiseTool },
  { id: 'vignette', title: 'Vignette', description: 'Dark edge effect', category: 'color-filters', icon: Eclipse, keywords: ['vignette', 'edges', 'dark'], component: VignetteTool },
  { id: 'fade', title: 'Fade', description: 'Fade in/out', category: 'color-filters', icon: SunMedium, keywords: ['fade', 'transition', 'in', 'out'], component: FadeTool },
  { id: 'vintage', title: 'Vintage', description: 'Sepia + grain look', category: 'color-filters', icon: Film, keywords: ['vintage', 'retro', 'sepia', 'old'], component: VintageTool },
  { id: 'bw', title: 'Black & White', description: 'Desaturate to grayscale', category: 'color-filters', icon: Eclipse, keywords: ['black', 'white', 'grayscale', 'mono', 'bw'], component: BlackWhiteTool },
  { id: 'mirror', title: 'Mirror', description: 'Mirror effect', category: 'color-filters', icon: FlipVertical2, keywords: ['mirror', 'reflect', 'symmetry'], component: MirrorTool },
  { id: 'edge-detect', title: 'Edge Detect', description: 'Artistic edge filter', category: 'color-filters', icon: Scan, keywords: ['edge', 'detect', 'outline', 'artistic'], component: EdgeDetectTool },
  { id: 'posterize', title: 'Posterize', description: 'Reduce color palette', category: 'color-filters', icon: Grid3x3, keywords: ['posterize', 'poster', 'colors', 'reduce'], component: PosterizeTool },
  { id: 'pixelate', title: 'Pixelate', description: 'Pixelation effect', category: 'color-filters', icon: Grid3x3, keywords: ['pixelate', 'pixel', 'mosaic', 'censor'], component: PixelateTool },
  { id: 'glitch', title: 'Glitch', description: 'RGB channel glitch', category: 'color-filters', icon: Droplets, keywords: ['glitch', 'rgb', 'distort', 'error'], component: GlitchTool },
  { id: 'sepia', title: 'Sepia', description: 'Warm brown sepia tone', category: 'color-filters', icon: Palette, keywords: ['sepia', 'brown', 'warm', 'tone'], component: SepiaTool },
  { id: 'invert', title: 'Invert / Negative', description: 'Invert all colors', category: 'color-filters', icon: CircleOff, keywords: ['invert', 'negative', 'reverse', 'colors'], component: InvertTool },
  { id: 'color-balance', title: 'Color Balance', description: 'Adjust shadow/midtone/highlight RGB', category: 'color-filters', icon: Sliders, keywords: ['color', 'balance', 'shadows', 'midtones', 'highlights', 'rgb'], component: ColorBalanceTool },
  { id: 'hue-shift', title: 'Hue Shift', description: 'Rotate hue angle', category: 'color-filters', icon: Rainbow, keywords: ['hue', 'shift', 'rotate', 'color', 'wheel'], component: HueShiftTool },
  { id: 'curves', title: 'Curves', description: 'Apply tone curve preset', category: 'color-filters', icon: Spline, keywords: ['curves', 'tone', 'contrast', 'brighter', 'darker', 'vintage'], component: CurvesTool },
  { id: 'chromatic-aberration', title: 'Chromatic Aberration', description: 'Strong RGB channel split', category: 'color-filters', icon: Crosshair, keywords: ['chromatic', 'aberration', 'rgb', 'split', 'shift'], component: ChromaticAberrationTool },
  { id: 'film-grain', title: 'Film Grain', description: 'Add noise for cinematic film look', category: 'color-filters', icon: Sparkles, keywords: ['film', 'grain', 'noise', 'cinematic', 'texture'], component: FilmGrainTool },
  { id: 'emboss', title: 'Emboss', description: 'Convolution-based emboss effect', category: 'color-filters', icon: Stamp, keywords: ['emboss', 'relief', 'raised', '3d'], component: EmbossTool },
  { id: 'thermal', title: 'Thermal / Heat Map', description: 'Pseudocolor thermal look', category: 'color-filters', icon: Thermometer, keywords: ['thermal', 'heat', 'map', 'infrared', 'pseudocolor'], component: ThermalTool },
  { id: 'solarize', title: 'Solarize', description: 'Invert pixels above threshold', category: 'color-filters', icon: Sun, keywords: ['solarize', 'threshold', 'invert', 'partial'], component: SolarizeTool },
  { id: 'cartoon', title: 'Cartoon / Cel Shade', description: 'Edge + posterize cartoon look', category: 'color-filters', icon: PenTool, keywords: ['cartoon', 'cel', 'shade', 'comic', 'anime'], component: CartoonTool },
  { id: 'dither', title: 'Dither', description: 'Ordered dither retro effect', category: 'color-filters', icon: Dice1, keywords: ['dither', 'retro', 'ordered', 'pixel', '8bit'], component: DitherTool },

  // ==================== Audio ====================
  { id: 'audio', title: 'Audio', description: 'Extract, remove, replace audio', category: 'audio', icon: Volume2, keywords: ['audio', 'sound', 'extract', 'remove', 'replace'], component: ExistingAudio },
  { id: 'volume-normalize', title: 'Volume Normalize', description: 'Normalize audio levels', category: 'audio', icon: AudioLines, keywords: ['volume', 'normalize', 'loudness', 'level'], component: VolumeNormTool },
  { id: 'audio-fade', title: 'Audio Fade', description: 'Fade audio in/out', category: 'audio', icon: Music, keywords: ['audio', 'fade', 'in', 'out'], component: AudioFadeTool },
  { id: 'bass-boost', title: 'Bass Boost', description: 'Boost bass frequencies', category: 'audio', icon: Headphones, keywords: ['bass', 'boost', 'equalizer', 'eq'], component: BassBoostTool },
  { id: 'echo', title: 'Echo', description: 'Add echo effect', category: 'audio', icon: VolumeX, keywords: ['echo', 'reverb', 'delay'], component: EchoTool },
  { id: 'audio-visualizer', title: 'Audio Visualizer', description: 'Generate waveform or spectrum', category: 'audio', icon: Activity, keywords: ['visualizer', 'waveform', 'spectrum', 'audio', 'bars'], component: AudioVisualizerTool },
  { id: 'treble-boost', title: 'Treble Boost', description: 'Boost high frequencies', category: 'audio', icon: Music2, keywords: ['treble', 'boost', 'high', 'frequency', 'eq'], component: TrebleBoostTool },
  { id: 'audio-speed', title: 'Audio Speed', description: 'Change tempo without pitch change', category: 'audio', icon: Gauge, keywords: ['audio', 'speed', 'tempo', 'atempo'], component: AudioSpeedTool },
  { id: 'pitch-shift', title: 'Pitch Shift', description: 'Change pitch up or down', category: 'audio', icon: Mic, keywords: ['pitch', 'shift', 'semitone', 'tune', 'key'], component: PitchShiftTool },
  { id: 'stereo-widen', title: 'Stereo Widen', description: 'Widen the stereo field', category: 'audio', icon: Radio, keywords: ['stereo', 'widen', 'field', 'spatial'], component: StereoWidenTool },
  { id: 'audio-reverse', title: 'Audio Reverse', description: 'Reverse audio track only', category: 'audio', icon: Undo2, keywords: ['audio', 'reverse', 'backwards'], component: AudioReverseTool },
  { id: 'noise-gate', title: 'Noise Gate', description: 'Gate audio below threshold', category: 'audio', icon: ShieldAlert, keywords: ['noise', 'gate', 'threshold', 'silence'], component: NoiseGateTool },

  // ==================== Format & Export ====================
  { id: 'compress', title: 'Compress', description: 'Reduce file size', category: 'format-export', icon: Minimize2, keywords: ['compress', 'shrink', 'reduce', 'smaller'], component: ExistingCompress },
  { id: 'convert', title: 'Convert', description: 'Change format', category: 'format-export', icon: RefreshCw, keywords: ['convert', 'format', 'mp4', 'webm', 'avi'], component: ExistingConvert },
  { id: 'gif', title: 'GIF Maker', description: 'Convert to animated GIF', category: 'format-export', icon: FileImage, keywords: ['gif', 'animated', 'image'], component: ExistingGif },
  { id: 'fps', title: 'Frame Rate', description: 'Change FPS', category: 'format-export', icon: Timer, keywords: ['fps', 'frame', 'rate', 'framerate'], component: ExistingFrameRate },
  { id: 'webp', title: 'WebP Maker', description: 'Convert to animated WebP', category: 'format-export', icon: Globe, keywords: ['webp', 'animated', 'web', 'image'], component: WebpMakerTool },
  { id: 'apng', title: 'APNG Maker', description: 'Convert to animated PNG', category: 'format-export', icon: FileImage, keywords: ['apng', 'animated', 'png', 'image'], component: ApngMakerTool },
  { id: 'extract-frames', title: 'Extract Frames', description: 'Export frames as image sequence', category: 'format-export', icon: FileDown, keywords: ['extract', 'frames', 'sequence', 'images', 'png'], component: ExtractFramesTool },
  { id: 'av1-encode', title: 'AV1 Encode', description: 'Re-encode as AV1 for max compression', category: 'format-export', icon: FileVideo, keywords: ['av1', 'encode', 'compress', 'libaom'], component: Av1EncodeTool },
  { id: 'prores-export', title: 'ProRes Export', description: 'Export as ProRes for editing', category: 'format-export', icon: Clapperboard, keywords: ['prores', 'export', 'professional', 'editing', 'mov'], component: ProResExportTool },
  { id: 'audio-only-export', title: 'Audio Only Export', description: 'Extract audio to MP3/AAC/WAV/FLAC', category: 'format-export', icon: Download, keywords: ['audio', 'export', 'extract', 'mp3', 'aac', 'wav', 'flac'], component: AudioOnlyExportTool },

  // ==================== Text & Overlay ====================
  { id: 'subtitles', title: 'Subtitles', description: 'Add captions', category: 'text-overlay', icon: MessageSquare, keywords: ['subtitle', 'caption', 'srt', 'text'], component: ExistingSubtitles },
  { id: 'text-overlay', title: 'Text Overlay', description: 'Burn text on video', category: 'text-overlay', icon: Type, keywords: ['text', 'overlay', 'title', 'watermark'], component: TextOverlayTool },
  { id: 'timestamp', title: 'Timestamp', description: 'Burn timecode', category: 'text-overlay', icon: Clock, keywords: ['timestamp', 'timecode', 'time', 'clock'], component: TimestampTool },
  { id: 'image-overlay', title: 'Image Overlay', description: 'Overlay image/logo on video', category: 'text-overlay', icon: ImagePlus, keywords: ['image', 'overlay', 'logo', 'watermark', 'stamp'], component: ImageOverlayTool },
  { id: 'countdown-timer', title: 'Countdown Timer', description: 'Burn countdown timecode overlay', category: 'text-overlay', icon: TimerOff, keywords: ['countdown', 'timer', 'count', 'overlay'], component: CountdownTimerTool },
  { id: 'scrolling-text', title: 'Scrolling Text', description: 'Scrolling marquee credits-style', category: 'text-overlay', icon: ScrollText, keywords: ['scrolling', 'text', 'marquee', 'credits', 'roll'], component: ScrollingTextTool },
  { id: 'border-frame', title: 'Border / Frame', description: 'Add colored border around video', category: 'text-overlay', icon: Box, keywords: ['border', 'frame', 'outline', 'surround'], component: BorderFrameTool },
  { id: 'blur-background', title: 'Blur Background', description: 'Blurred pad for vertical-to-landscape', category: 'text-overlay', icon: CircleDot, keywords: ['blur', 'background', 'vertical', 'landscape', 'pad', 'tiktok'], component: BlurBackgroundTool },

  // ==================== Combine & Layout ====================
  { id: 'merge', title: 'Merge', description: 'Join videos', category: 'combine-layout', icon: Merge, keywords: ['merge', 'join', 'combine', 'concatenate'], component: ExistingMerge },
  { id: 'pip', title: 'Picture in Picture', description: 'Overlay video on video', category: 'combine-layout', icon: PictureInPicture2, keywords: ['pip', 'picture', 'overlay', 'inset'], component: PipTool },
  { id: 'side-by-side', title: 'Side by Side', description: 'Stack videos horizontally', category: 'combine-layout', icon: LayoutGrid, keywords: ['side', 'horizontal', 'compare', 'stack'], component: SideBySideTool },
  { id: 'stack-vertical', title: 'Stack Vertical', description: 'Stack videos vertically', category: 'combine-layout', icon: ArrowDownUp, keywords: ['stack', 'vertical', 'top', 'bottom'], component: StackVerticalTool },
  { id: 'grid-2x2', title: 'Grid 2×2', description: '2×2 video grid layout', category: 'combine-layout', icon: LayoutGrid, keywords: ['grid', '2x2', 'four', 'quadrant', 'mosaic'], component: Grid2x2Tool },
  { id: 'grid-3x3', title: 'Grid 3×3', description: '3×3 video grid layout', category: 'combine-layout', icon: Grid3x3, keywords: ['grid', '3x3', 'nine', 'mosaic'], component: Grid3x3Tool },
  { id: 'split-screen', title: 'Split Screen', description: 'Split left/right with different filters', category: 'combine-layout', icon: SplitSquareHorizontal, keywords: ['split', 'screen', 'compare', 'before', 'after'], component: SplitScreenTool },
  { id: 'overlay-blend', title: 'Overlay Blend', description: 'Blend video with a blend mode', category: 'combine-layout', icon: Layers2, keywords: ['overlay', 'blend', 'multiply', 'screen', 'addition'], component: OverlayBlendTool },
  { id: 'cross-dissolve', title: 'Cross Dissolve', description: 'Dissolve transition at midpoint', category: 'combine-layout', icon: Layers, keywords: ['cross', 'dissolve', 'transition', 'fade'], component: CrossDissolveTool },

  // ==================== Extract & Analyze ====================
  { id: 'utilities', title: 'Utilities', description: 'Metadata, screenshots & more', category: 'extract-analyze', icon: Wrench, keywords: ['utilities', 'metadata', 'info', 'screenshot'], component: ExistingUtilities },
  { id: 'thumbnail-grid', title: 'Thumbnail Grid', description: 'Contact sheet of frames', category: 'extract-analyze', icon: TableProperties, keywords: ['thumbnail', 'grid', 'contact', 'sheet', 'preview'], component: ThumbnailGridTool },
  { id: 'frame-count', title: 'Frame Count', description: 'Display frame numbers', category: 'extract-analyze', icon: Hash, keywords: ['frame', 'count', 'number', 'overlay', 'analysis'], component: FrameCountTool },
  { id: 'metadata', title: 'Metadata Viewer', description: 'View file metadata & info', category: 'extract-analyze', icon: Info, keywords: ['metadata', 'info', 'details', 'technical', 'properties'], component: MetadataTool },
  { id: 'audio-visualizer-extract', title: 'Audio Waveform', description: 'Render audio waveform image', category: 'extract-analyze', icon: Activity, keywords: ['waveform', 'audio', 'render', 'visualize'], component: AudioVisualizerTool },
  { id: 'first-frame', title: 'First Frame', description: 'Extract first frame as PNG', category: 'extract-analyze', icon: ImageDown, keywords: ['first', 'frame', 'extract', 'thumbnail', 'png'], component: FirstFrameTool },
  { id: 'last-frame', title: 'Last Frame', description: 'Extract last frame as PNG', category: 'extract-analyze', icon: ImageMinus, keywords: ['last', 'frame', 'extract', 'end', 'png'], component: LastFrameTool },
  { id: 'frame-at-time', title: 'Frame at Time', description: 'Extract frame at specific timestamp', category: 'extract-analyze', icon: Clock4, keywords: ['frame', 'time', 'timestamp', 'extract', 'screenshot'], component: FrameAtTimeTool },
  { id: 'every-nth-frame', title: 'Every Nth Frame', description: 'Export every Nth frame', category: 'extract-analyze', icon: Hash, keywords: ['every', 'nth', 'frame', 'sample', 'interval'], component: EveryNthFrameTool },
  { id: 'duration-info', title: 'Duration Info', description: 'Burn duration/timecode info overlay', category: 'extract-analyze', icon: Clock, keywords: ['duration', 'info', 'codec', 'bitrate', 'overlay'], component: DurationInfoTool },
  { id: 'bitrate-graph', title: 'Bitrate Graph', description: 'Bitrate analysis overlay', category: 'extract-analyze', icon: BarChart3, keywords: ['bitrate', 'graph', 'analysis', 'chart', 'rate'], component: BitrateGraphTool },
  { id: 'color-histogram', title: 'Color Histogram', description: 'Color histogram overlay', category: 'extract-analyze', icon: PieChart, keywords: ['color', 'histogram', 'levels', 'waveform', 'parade'], component: ColorHistogramTool },
  { id: 'silence-detect', title: 'Silence Detect', description: 'Detect and mark silent intervals', category: 'extract-analyze', icon: MicOff, keywords: ['silence', 'detect', 'quiet', 'intervals', 'analyze'], component: SilenceDetectTool },

  // ==================== Captions ====================
  { id: 'captions-pro', title: 'Captions Pro', description: 'Full caption studio: typography, colors, position, animation, karaoke', category: 'captions', icon: Captions, keywords: ['captions', 'pro', 'subtitle', 'style', 'karaoke', 'animation', 'typography'], component: CaptionsProTool },
  { id: 'caption-fade-in', title: 'Caption Fade In', description: 'Captions that fade in with alpha animation', category: 'captions', icon: SunMedium, keywords: ['caption', 'fade', 'in', 'alpha', 'animation'], component: CaptionFadeInTool },
  { id: 'caption-outline', title: 'Caption Outline', description: 'Bold outlined captions with border', category: 'captions', icon: Bold, keywords: ['caption', 'outline', 'border', 'bold'], component: CaptionOutlineTool },
  { id: 'caption-shadow', title: 'Caption Shadow', description: 'Captions with customizable drop shadow', category: 'captions', icon: Eclipse, keywords: ['caption', 'shadow', 'drop', 'effect'], component: CaptionShadowTool },
  { id: 'caption-box', title: 'Caption Box', description: 'Captions with colored background box', category: 'captions', icon: RectangleHorizontal, keywords: ['caption', 'box', 'background', 'highlight'], component: CaptionBoxTool },
  { id: 'caption-position', title: 'Caption Position', description: 'Place captions at any position', category: 'captions', icon: MoveHorizontal, keywords: ['caption', 'position', 'top', 'bottom', 'center', 'custom'], component: CaptionPositionTool },
  { id: 'caption-color', title: 'Caption Color', description: 'Colored captions with presets', category: 'captions', icon: Palette, keywords: ['caption', 'color', 'preset', 'text'], component: CaptionColorTool },
  { id: 'caption-size', title: 'Caption Size', description: 'Adjustable caption font size', category: 'captions', icon: LetterText, keywords: ['caption', 'size', 'font', 'large', 'small'], component: CaptionSizeTool },
  { id: 'uppercase-captions', title: 'Uppercase Captions', description: 'Force uppercase text for impact', category: 'captions', icon: Type, keywords: ['uppercase', 'caption', 'caps', 'bold', 'impact'], component: UppercaseCaptionsTool },
  { id: 'karaoke-captions', title: 'Karaoke Captions', description: 'Word-by-word highlight TikTok style', category: 'captions', icon: Highlighter, keywords: ['karaoke', 'caption', 'word', 'highlight', 'tiktok', 'reels'], component: KaraokeCaptionsTool },
  { id: 'multi-line-captions', title: 'Multi-Line Captions', description: 'Stacked multi-line text captions', category: 'captions', icon: Rows3, keywords: ['multi', 'line', 'caption', 'stacked', 'two'], component: MultiLineCaptionsTool },
  { id: 'caption-stroke', title: 'Caption Stroke', description: 'Thick stroke/outline for readability', category: 'captions', icon: PenTool, keywords: ['caption', 'stroke', 'thick', 'outline'], component: CaptionStrokeTool },
  { id: 'animated-caption-slide', title: 'Animated Caption Slide', description: 'Captions that slide in from sides', category: 'captions', icon: MoveHorizontal, keywords: ['animated', 'caption', 'slide', 'motion', 'entrance'], component: AnimatedCaptionSlideTool },
  { id: 'caption-gradient-bg', title: 'Caption Gradient BG', description: 'Gradient bar background behind text', category: 'captions', icon: PaintBucket, keywords: ['caption', 'gradient', 'background', 'bar'], component: CaptionGradientBgTool },
  { id: 'srt-burn-in', title: 'SRT Burn-In', description: 'Burn timed subtitle text into video', category: 'captions', icon: Subtitles, keywords: ['srt', 'burn', 'subtitle', 'timed', 'hardcode'], component: SrtBurnInTool },
  { id: 'auto-caption-style', title: 'Auto Caption Style', description: 'Pre-built styles: YouTube, TikTok, News, Minimal', category: 'captions', icon: Wand2, keywords: ['auto', 'caption', 'style', 'preset', 'youtube', 'tiktok', 'news'], component: AutoCaptionStyleTool },

  // ==================== Phase 15: New Tools ====================
  { id: 'duotone', title: 'Duotone', description: 'Two-color tonal effect', category: 'color-filters', icon: Contrast, keywords: ['duotone', 'two', 'color', 'tone', 'gradient'], component: DuotoneTool },
  { id: 'night-vision', title: 'Night Vision', description: 'Green-tinted night camera look', category: 'color-filters', icon: Eye, keywords: ['night', 'vision', 'green', 'infrared', 'military'], component: NightVisionTool },
  { id: 'halftone', title: 'Halftone', description: 'Newspaper dot pattern effect', category: 'color-filters', icon: CircleDashed, keywords: ['halftone', 'dot', 'newspaper', 'retro', 'print'], component: HalftoneTool },
  { id: 'oil-paint', title: 'Oil Paint', description: 'Smooth oil painting look', category: 'color-filters', icon: Brush, keywords: ['oil', 'paint', 'artistic', 'smooth', 'painting'], component: OilPaintTool },
  { id: 'pencil-sketch', title: 'Pencil Sketch', description: 'Line drawing sketch effect', category: 'color-filters', icon: Pencil, keywords: ['pencil', 'sketch', 'drawing', 'line', 'art'], component: PencilSketchTool },
  { id: 'tilt-shift', title: 'Tilt Shift', description: 'Miniature diorama blur effect', category: 'color-filters', icon: Focus, keywords: ['tilt', 'shift', 'miniature', 'blur', 'diorama'], component: TiltShiftTool },
  { id: 'motion-blur', title: 'Motion Blur', description: 'Temporal motion blur effect', category: 'color-filters', icon: Wind, keywords: ['motion', 'blur', 'temporal', 'blend'], component: MotionBlurTool },
  { id: 'auto-levels', title: 'Auto Levels', description: 'Auto contrast via histogram equalization', category: 'color-filters', icon: SunSnow, keywords: ['auto', 'levels', 'histogram', 'contrast', 'equalize'], component: AutoLevelsTool },

  { id: 'compressor', title: 'Audio Compressor', description: 'Dynamic range compression', category: 'audio', icon: Disc, keywords: ['compressor', 'dynamic', 'range', 'compression', 'audio'], component: CompressorTool },
  { id: 'equalizer', title: 'Equalizer', description: '5-band audio equalizer', category: 'audio', icon: SlidersHorizontal, keywords: ['equalizer', 'eq', 'band', 'frequency', 'audio'], component: EqualizerTool },
  { id: 'de-esser', title: 'De-Esser', description: 'Reduce sibilance in speech', category: 'audio', icon: BellOff, keywords: ['de-esser', 'sibilance', 'speech', 'harsh'], component: DeEsserTool },
  { id: 'loudnorm', title: 'Loudness Normalize', description: 'LUFS loudness normalization', category: 'audio', icon: Volume1, keywords: ['loudnorm', 'lufs', 'loudness', 'normalize', 'broadcast'], component: LoudnormTool },
  { id: 'audio-delay', title: 'Audio Sync / Delay', description: 'Shift audio to fix sync', category: 'audio', icon: AlarmClock, keywords: ['audio', 'delay', 'sync', 'shift', 'offset'], component: AudioDelayTool },

  { id: 'ken-burns', title: 'Ken Burns', description: 'Slow zoom and pan effect', category: 'speed-time', icon: Move, keywords: ['ken', 'burns', 'zoom', 'pan', 'slideshow'], component: KenBurnsTool },
  { id: 'lens-correction', title: 'Lens Correction', description: 'Fix barrel/pincushion distortion', category: 'transform', icon: Glasses, keywords: ['lens', 'correction', 'barrel', 'pincushion', 'distortion'], component: LensCorrectionTool },
  { id: 'deinterlace', title: 'Deinterlace', description: 'Remove interlacing artifacts', category: 'format-export', icon: Monitor, keywords: ['deinterlace', 'interlace', 'yadif', 'broadcast', 'dvd'], component: DeinterlaceTool },

  { id: 'lower-third', title: 'Lower Third', description: 'Name/title banner overlay', category: 'text-overlay', icon: CreditCard, keywords: ['lower', 'third', 'name', 'title', 'banner'], component: LowerThirdTool },
  { id: 'progress-bar', title: 'Progress Bar', description: 'Animated progress bar overlay', category: 'text-overlay', icon: BarChart2, keywords: ['progress', 'bar', 'animated', 'loading'], component: ProgressBarTool },
  { id: 'chroma-key', title: 'Chroma Key', description: 'Green/blue screen removal', category: 'color-filters', icon: Pipette, keywords: ['chroma', 'key', 'green', 'screen', 'remove', 'background'], component: ChromaKeyTool },

  // ==================== Transitions ====================
  { id: 'fade-black-transition', title: 'Fade Black', description: 'Fade-to-black transition effect', category: 'transitions', icon: ArrowRightLeft, keywords: ['fade', 'black', 'transition'], component: FadeBlackTransitionTool },
  { id: 'fade-white-transition', title: 'Fade White', description: 'Fade-through-white transition effect', category: 'transitions', icon: ArrowRightLeft, keywords: ['fade', 'white', 'transition'], component: FadeWhiteTransitionTool },
  { id: 'cross-zoom-transition', title: 'Cross Zoom', description: 'Zoom transition feel', category: 'transitions', icon: ArrowRightLeft, keywords: ['cross', 'zoom', 'transition'], component: CrossZoomTransitionTool },
  { id: 'spin-360-transition', title: 'Spin 360', description: 'Rotational transition effect', category: 'transitions', icon: ArrowRightLeft, keywords: ['spin', 'rotate', 'transition'], component: Spin360TransitionTool },
  { id: 'slide-left-transition', title: 'Slide Left', description: 'Slide-left transition', category: 'transitions', icon: ArrowRightLeft, keywords: ['slide', 'left', 'transition'], component: SlideLeftTransitionTool },
  { id: 'slide-right-transition', title: 'Slide Right', description: 'Slide-right transition', category: 'transitions', icon: ArrowRightLeft, keywords: ['slide', 'right', 'transition'], component: SlideRightTransitionTool },
  { id: 'slide-up-transition', title: 'Slide Up', description: 'Slide-up transition', category: 'transitions', icon: ArrowRightLeft, keywords: ['slide', 'up', 'transition'], component: SlideUpTransitionTool },
  { id: 'slide-down-transition', title: 'Slide Down', description: 'Slide-down transition', category: 'transitions', icon: ArrowRightLeft, keywords: ['slide', 'down', 'transition'], component: SlideDownTransitionTool },
  { id: 'push-transition', title: 'Push', description: 'Push transition effect', category: 'transitions', icon: ArrowRightLeft, keywords: ['push', 'transition'], component: PushTransitionTool },
  { id: 'wipe-left-transition', title: 'Wipe Left', description: 'Wipe-left transition', category: 'transitions', icon: ArrowRightLeft, keywords: ['wipe', 'left', 'transition'], component: WipeLeftTransitionTool },
  { id: 'wipe-right-transition', title: 'Wipe Right', description: 'Wipe-right transition', category: 'transitions', icon: ArrowRightLeft, keywords: ['wipe', 'right', 'transition'], component: WipeRightTransitionTool },
  { id: 'circle-wipe-transition', title: 'Circle Wipe', description: 'Circular wipe transition', category: 'transitions', icon: ArrowRightLeft, keywords: ['circle', 'wipe', 'transition'], component: CircleWipeTransitionTool },
  { id: 'clock-wipe-transition', title: 'Clock Wipe', description: 'Clock wipe transition', category: 'transitions', icon: ArrowRightLeft, keywords: ['clock', 'wipe', 'transition'], component: ClockWipeTransitionTool },
  { id: 'iris-in-transition', title: 'Iris In', description: 'Iris-in transition', category: 'transitions', icon: ArrowRightLeft, keywords: ['iris', 'in', 'transition'], component: IrisInTransitionTool },
  { id: 'iris-out-transition', title: 'Iris Out', description: 'Iris-out transition', category: 'transitions', icon: ArrowRightLeft, keywords: ['iris', 'out', 'transition'], component: IrisOutTransitionTool },
  { id: 'film-burn-transition', title: 'Film Burn', description: 'Film burn transition effect', category: 'transitions', icon: ArrowRightLeft, keywords: ['film', 'burn', 'transition'], component: FilmBurnTransitionTool },
  { id: 'glitch-transition', title: 'Glitch Transition', description: 'Glitch transition effect', category: 'transitions', icon: ArrowRightLeft, keywords: ['glitch', 'transition'], component: GlitchTransitionTool },
  { id: 'whip-pan-transition', title: 'Whip Pan', description: 'Whip pan transition effect', category: 'transitions', icon: ArrowRightLeft, keywords: ['whip', 'pan', 'transition'], component: WhipPanTransitionTool },
  { id: 'zoom-in-transition', title: 'Zoom In', description: 'Zoom-in transition effect', category: 'transitions', icon: ArrowRightLeft, keywords: ['zoom', 'in', 'transition'], component: ZoomInTransitionTool },
  { id: 'zoom-out-transition', title: 'Zoom Out', description: 'Zoom-out transition effect', category: 'transitions', icon: ArrowRightLeft, keywords: ['zoom', 'out', 'transition'], component: ZoomOutTransitionTool },

  // ==================== Pro Color ====================
  { id: 'lut-import', title: 'LUT Import', description: 'LUT-style cinematic grade', category: 'pro-color', icon: Palette, keywords: ['lut', 'grade', 'cinematic'], component: LutImportTool },
  { id: 'cinematic-orange-teal', title: 'Cinematic Orange Teal', description: 'Orange teal cinematic grade', category: 'pro-color', icon: Palette, keywords: ['orange', 'teal', 'cinematic'], component: CinematicOrangeTealTool },
  { id: 'film-print', title: 'Film Print', description: 'Film print emulation', category: 'pro-color', icon: Palette, keywords: ['film', 'print', 'emulation'], component: FilmPrintTool },
  { id: 'kodak-portra', title: 'Kodak Portra', description: 'Portra-style film look', category: 'pro-color', icon: Palette, keywords: ['kodak', 'portra', 'film'], component: KodakPortraTool },
  { id: 'fuji-velvia', title: 'Fuji Velvia', description: 'Velvia-style saturation look', category: 'pro-color', icon: Palette, keywords: ['fuji', 'velvia', 'film'], component: FujiVelviaTool },
  { id: 'kodachrome', title: 'Kodachrome', description: 'Kodachrome-inspired look', category: 'pro-color', icon: Palette, keywords: ['kodachrome', 'film', 'look'], component: KodachromeTool },
  { id: 'aces-convert', title: 'ACES Convert', description: 'ACES-style tone conversion', category: 'pro-color', icon: Palette, keywords: ['aces', 'convert', 'tone'], component: AcesConvertTool },
  { id: 'log-to-rec709', title: 'Log to Rec709', description: 'Convert flat log to Rec709', category: 'pro-color', icon: Palette, keywords: ['log', 'rec709', 'convert'], component: LogToRec709Tool },
  { id: 'hdr-to-sdr', title: 'HDR to SDR', description: 'HDR-style to SDR conversion', category: 'pro-color', icon: Palette, keywords: ['hdr', 'sdr', 'convert'], component: HdrToSdrTool },
  { id: 'sdr-to-hdr', title: 'SDR to HDR', description: 'Boost SDR toward HDR look', category: 'pro-color', icon: Palette, keywords: ['sdr', 'hdr', 'boost'], component: SdrToHdrTool },
  { id: 'color-match', title: 'Color Match', description: 'Automatic color balancing', category: 'pro-color', icon: Palette, keywords: ['color', 'match', 'balance'], component: ColorMatchTool },
  { id: 'white-balance-auto', title: 'White Balance Auto', description: 'Auto white balance correction', category: 'pro-color', icon: Palette, keywords: ['white', 'balance', 'auto'], component: WhiteBalanceAutoTool },
  { id: 'skin-tone-fix', title: 'Skin Tone Fix', description: 'Natural skin tone correction', category: 'pro-color', icon: Palette, keywords: ['skin', 'tone', 'fix'], component: SkinToneFixTool },
  { id: 'rgb-parade', title: 'RGB Parade', description: 'RGB parade analysis', category: 'pro-color', icon: Palette, keywords: ['rgb', 'parade', 'analysis'], component: RgbParadeTool },
  { id: 'vectorscope', title: 'Vectorscope', description: 'Vectorscope analysis view', category: 'pro-color', icon: Palette, keywords: ['vectorscope', 'analysis'], component: VectorscopeTool },
  { id: 'waveform-monitor', title: 'Waveform Monitor', description: 'Waveform monitor analysis', category: 'pro-color', icon: Palette, keywords: ['waveform', 'monitor', 'analysis'], component: WaveformMonitorTool },
  { id: 'false-color', title: 'False Color', description: 'False-color exposure view', category: 'pro-color', icon: Palette, keywords: ['false', 'color', 'exposure'], component: FalseColorTool },
  { id: 'zebra-stripes', title: 'Zebra Stripes', description: 'Overexposure zebra stripes', category: 'pro-color', icon: Palette, keywords: ['zebra', 'stripes', 'exposure'], component: ZebraStripesTool },
  { id: 'exposure-fix', title: 'Exposure Fix', description: 'Quick exposure adjustment', category: 'pro-color', icon: Palette, keywords: ['exposure', 'fix', 'brightness'], component: ExposureFixTool },
  { id: 'split-tone', title: 'Split Tone', description: 'Split-tone highlights/shadows', category: 'pro-color', icon: Palette, keywords: ['split', 'tone', 'grade'], component: SplitToneTool },

  // ==================== Social Export ====================
  { id: 'tiktok-916', title: 'TikTok 9:16', description: 'TikTok vertical export preset', category: 'social-export', icon: Share2, keywords: ['tiktok', 'vertical', 'export'], component: TikTok916Tool },
  { id: 'instagram-reels', title: 'Instagram Reels', description: 'Instagram Reels export preset', category: 'social-export', icon: Share2, keywords: ['instagram', 'reels', 'export'], component: InstagramReelsTool },
  { id: 'youtube-shorts', title: 'YouTube Shorts', description: 'YouTube Shorts export preset', category: 'social-export', icon: Share2, keywords: ['youtube', 'shorts', 'export'], component: YouTubeShortsTool },
  { id: 'stories-export', title: 'Stories Export', description: 'Stories export preset', category: 'social-export', icon: Share2, keywords: ['stories', 'social', 'export'], component: StoriesExportTool },
  { id: 'twitter-x-video', title: 'Twitter/X Video', description: 'Twitter/X export preset', category: 'social-export', icon: Share2, keywords: ['twitter', 'x', 'export'], component: TwitterXVideoTool },
  { id: 'linkedin-video', title: 'LinkedIn Video', description: 'LinkedIn export preset', category: 'social-export', icon: Share2, keywords: ['linkedin', 'export'], component: LinkedInVideoTool },
  { id: 'facebook-cover', title: 'Facebook Cover', description: 'Facebook cover video preset', category: 'social-export', icon: Share2, keywords: ['facebook', 'cover', 'export'], component: FacebookCoverTool },
  { id: 'pinterest-pin', title: 'Pinterest Pin', description: 'Pinterest pin export preset', category: 'social-export', icon: Share2, keywords: ['pinterest', 'pin', 'export'], component: PinterestPinTool },
  { id: 'thumbnail-generator', title: 'Thumbnail Generator', description: 'Generate social thumbnails', category: 'social-export', icon: Share2, keywords: ['thumbnail', 'social', 'image'], component: ThumbnailGeneratorTool },
  { id: 'square-export', title: 'Square 1:1', description: 'Square social export preset', category: 'social-export', icon: Share2, keywords: ['square', '1:1', 'social'], component: SquareExportTool },

  // ==================== Stabilize & Fix ====================
  { id: 'video-stabilize', title: 'Video Stabilize', description: 'Stabilize handheld shake', category: 'stabilize-fix', icon: Anchor, keywords: ['stabilize', 'shake', 'fix'], component: VideoStabilizeTool },
  { id: 'shake-reduce', title: 'Shake Reduce', description: 'Reduce camera shake', category: 'stabilize-fix', icon: Anchor, keywords: ['shake', 'reduce', 'stabilize'], component: ShakeReduceTool },
  { id: 'rolling-shutter-fix', title: 'Rolling Shutter Fix', description: 'Reduce rolling shutter artifacts', category: 'stabilize-fix', icon: Anchor, keywords: ['rolling', 'shutter', 'fix'], component: RollingShutterFixTool },
  { id: 'horizon-level', title: 'Horizon Level', description: 'Level tilted horizons', category: 'stabilize-fix', icon: Anchor, keywords: ['horizon', 'level', 'rotate'], component: HorizonLevelTool },
  { id: 'auto-rotate-fix', title: 'Auto Rotate Fix', description: 'Fix wrong orientation', category: 'stabilize-fix', icon: Anchor, keywords: ['rotate', 'orientation', 'fix'], component: AutoRotateFixTool },
  { id: 'flicker-remove', title: 'Flicker Remove', description: 'Reduce light flicker', category: 'stabilize-fix', icon: Anchor, keywords: ['flicker', 'remove', 'lights'], component: FlickerRemoveTool },
  { id: 'dead-pixel-fix', title: 'Dead Pixel Fix', description: 'Reduce dead/hot pixels', category: 'stabilize-fix', icon: Anchor, keywords: ['dead', 'pixel', 'fix'], component: DeadPixelFixTool },
  { id: 'audio-hum-remove', title: 'Audio Hum Remove', description: 'Remove electrical hum', category: 'stabilize-fix', icon: Anchor, keywords: ['audio', 'hum', 'remove'], component: AudioHumRemoveTool },
  { id: 'audio-click-remove', title: 'Audio Click Remove', description: 'Remove clicks in audio', category: 'stabilize-fix', icon: Anchor, keywords: ['audio', 'click', 'remove'], component: AudioClickRemoveTool },
  { id: 'sync-audio-video', title: 'Sync Audio Video', description: 'Fix audio-video sync offset', category: 'stabilize-fix', icon: Anchor, keywords: ['sync', 'audio', 'video'], component: SyncAudioVideoTool },

  // ==================== AI Smart ====================
  { id: 'auto-enhance', title: 'Auto Enhance', description: 'Automatic visual enhancement', category: 'ai-smart', icon: Sparkles, keywords: ['auto', 'enhance', 'ai'], component: AutoEnhanceTool },
  { id: 'smart-crop-ai', title: 'Smart Crop', description: 'AI-style smart crop and framing', category: 'ai-smart', icon: Sparkles, keywords: ['smart', 'crop', 'ai'], component: SmartCropAiTool },
  { id: 'auto-color-correct-ai', title: 'Auto Color Correct', description: 'Automatic color correction', category: 'ai-smart', icon: Sparkles, keywords: ['auto', 'color', 'correct'], component: AutoColorCorrectAiTool },
  { id: 'object-blur', title: 'Object Blur', description: 'Blur object regions', category: 'ai-smart', icon: Sparkles, keywords: ['object', 'blur', 'privacy'], component: ObjectBlurTool },
  { id: 'face-track-zoom', title: 'Face Track Zoom', description: 'Face-follow zoom style effect', category: 'ai-smart', icon: Sparkles, keywords: ['face', 'track', 'zoom'], component: FaceTrackZoomTool },
  { id: 'auto-reframe', title: 'Auto Reframe', description: 'Automatic reframing for socials', category: 'ai-smart', icon: Sparkles, keywords: ['auto', 'reframe', 'social'], component: AutoReframeTool },
  { id: 'background-remove', title: 'Background Remove', description: 'Background removal by keying', category: 'ai-smart', icon: Sparkles, keywords: ['background', 'remove', 'key'], component: BackgroundRemoveTool },
  { id: 'upscale-ai', title: 'Upscale AI', description: 'AI-style detail upscaling', category: 'ai-smart', icon: Sparkles, keywords: ['upscale', 'ai', 'resolution'], component: UpscaleAiTool },
];

export function searchTools(query: string): ToolDef[] {
  const q = query.toLowerCase().trim();
  if (!q) return TOOLS;
  return TOOLS.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.keywords.some((k) => k.includes(q))
  );
}

export function getToolsByCategory(category: ToolCategory): ToolDef[] {
  return TOOLS.filter((t) => t.category === category);
}

export function getToolById(id: string): ToolDef | undefined {
  return TOOLS.find((t) => t.id === id);
}
