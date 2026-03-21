import { AiProvider, AI_MODELS, AiToolCallInfo, useAiStore } from '@/stores/aiStore';
import { useEditorStore, getNextClipColor } from '@/stores/editorStore';
import { useCaptionsStore, generateSRT } from '@/stores/captionsStore';
import { useKeyframeStore, ANIMATABLE_PROPERTIES } from '@/stores/keyframeStore';
import { detectBeats, estimateBPM, generateBeatSyncCuts } from '@/lib/audioAnalysis';
import { analyzeVideoForReframe, buildReframeCropArgs, type TargetAspect } from '@/lib/smartCrop';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface StreamCallbacks {
  onDelta: (text: string) => void;
  onToolCall: (tc: AiToolCallInfo) => void;
  onToolCallUpdate: (id: string, updates: Partial<AiToolCallInfo>) => void;
  onDone: () => void;
  onError: (err: string) => void;
}

function getProviderForModel(modelId: string): AiProvider {
  const model = AI_MODELS.find((m) => m.id === modelId);
  return model?.provider || 'openai';
}

function getEndpoint(provider: AiProvider): string {
  switch (provider) {
    case 'openai': return 'https://api.openai.com/v1/chat/completions';
    case 'gemini': return 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
    case 'anthropic': return 'https://api.anthropic.com/v1/messages';
  }
}

/** Build context about the current timeline state for the AI */
function buildTimelineContext(): string {
  const state = useEditorStore.getState();
  const clips = Object.values(state.clips);
  if (clips.length === 0) return '\n\nTimeline: Empty. No clips on timeline.';

  const selected = state.selection;
  const lines = ['\n\nCurrent Timeline State:'];
  lines.push(`Tracks: ${state.tracks.map((t) => `${t.label} (${t.type})`).join(', ')}`);
  lines.push(`Playhead: ${state.playhead.toFixed(2)}s`);
  lines.push(`Clips:`);
  clips.forEach((c) => {
    const sel = selected.includes(c.id) ? ' [SELECTED]' : '';
    const kfCount = useKeyframeStore.getState().getClipKeyframes(c.id).length;
    lines.push(`  - "${c.label}" on track ${c.trackId}: ${c.startOnTimeline.toFixed(1)}s-${(c.startOnTimeline + c.duration).toFixed(1)}s (dur: ${c.duration.toFixed(1)}s, speed: ${c.speed}x, opacity: ${c.opacity}, volume: ${c.volume}, filters: ${c.filters.length}, keyframes: ${kfCount})${sel}`);
  });
  return lines.join('\n');
}

/** Build context about current captions/transcript state */
function buildCaptionsContext(): string {
  const state = useCaptionsStore.getState();
  if (state.segments.length === 0) return '\n\nCaptions: No transcript loaded.';

  const allWords = state.segments.flatMap((s) => s.words);
  const total = allWords.length;
  const deleted = allWords.filter((w) => w.deleted).length;
  const fillers = allWords.filter((w) => w.type === 'filler').length;
  const silences = allWords.filter((w) => w.type === 'silence').length;
  const speakers = [...new Set(state.segments.map((s) => s.speaker))];
  const activeText = allWords.filter((w) => !w.deleted && w.type === 'word').map((w) => w.text).join(' ');
  const preview = activeText.length > 200 ? activeText.slice(0, 200) + '...' : activeText;

  const lines = ['\n\nCaptions/Transcript State:'];
  lines.push(`Source clip: ${state.sourceClipId || 'unknown'}`);
  lines.push(`Words: ${total} total, ${deleted} deleted, ${fillers} fillers, ${silences} silences`);
  lines.push(`Speakers: ${speakers.join(', ')}`);
  lines.push(`Active transcript preview: "${preview}"`);
  return lines.join('\n');
}

/** Execute an AI tool call against the editor state */
export function executeToolCall(name: string, args: Record<string, unknown>): string {
  const store = useEditorStore.getState();
  const selected = store.selection;
  const selectedClip = selected.length === 1 ? store.clips[selected[0]] : null;

  switch (name) {
    case 'trim_video': {
      if (!selectedClip) return 'Error: No clip selected. Select a clip first.';
      const start = (args.start as number) ?? 0;
      const end = (args.end as number) ?? selectedClip.duration;
      store.updateClip(selectedClip.id, { trimStart: start, trimEnd: end, duration: end - start });
      return `Trimmed "${selectedClip.label}" to ${start}s-${end}s`;
    }
    case 'change_speed': {
      if (!selectedClip) return 'Error: No clip selected.';
      const speed = (args.speed as number) ?? 1;
      store.setClipSpeed(selectedClip.id, speed);
      return `Set speed of "${selectedClip.label}" to ${speed}x`;
    }
    case 'adjust_color': {
      if (!selectedClip) return 'Error: No clip selected.';
      const filter = { id: crypto.randomUUID(), type: 'color-adjust', params: args as Record<string, number | string | boolean> };
      store.addFilterToClip(selectedClip.id, filter);
      return `Applied color adjustment to "${selectedClip.label}"`;
    }
    case 'add_blur': {
      if (!selectedClip) return 'Error: No clip selected.';
      store.addFilterToClip(selectedClip.id, { id: crypto.randomUUID(), type: 'blur', params: { intensity: (args.intensity as number) ?? 5 } });
      return `Applied blur (intensity: ${args.intensity ?? 5}) to "${selectedClip.label}"`;
    }
    case 'add_sharpen': {
      if (!selectedClip) return 'Error: No clip selected.';
      store.addFilterToClip(selectedClip.id, { id: crypto.randomUUID(), type: 'sharpen', params: { intensity: (args.intensity as number) ?? 3 } });
      return `Applied sharpen to "${selectedClip.label}"`;
    }
    case 'add_fade': {
      if (!selectedClip) return 'Error: No clip selected.';
      const fadeType = (args.type as string) ?? 'in';
      const dur = (args.duration as number) ?? 1;
      store.addFilterToClip(selectedClip.id, { id: crypto.randomUUID(), type: `fade-${fadeType}`, params: { duration: dur } });
      return `Applied fade ${fadeType} (${dur}s) to "${selectedClip.label}"`;
    }
    case 'add_vignette': {
      if (!selectedClip) return 'Error: No clip selected.';
      store.addFilterToClip(selectedClip.id, { id: crypto.randomUUID(), type: 'vignette', params: { intensity: (args.intensity as number) ?? 0.5 } });
      return `Applied vignette to "${selectedClip.label}"`;
    }
    case 'add_text': {
      if (!selectedClip) return 'Error: No clip selected.';
      store.addFilterToClip(selectedClip.id, { id: crypto.randomUUID(), type: 'text-overlay', params: args as Record<string, number | string | boolean> });
      return `Added text overlay "${args.text}" to "${selectedClip.label}"`;
    }
    case 'rotate_video': {
      if (!selectedClip) return 'Error: No clip selected.';
      store.addFilterToClip(selectedClip.id, { id: crypto.randomUUID(), type: 'rotate', params: { degrees: (args.degrees as number) ?? 90 } });
      return `Rotated "${selectedClip.label}" by ${args.degrees ?? 90}°`;
    }
    case 'flip_video': {
      if (!selectedClip) return 'Error: No clip selected.';
      store.addFilterToClip(selectedClip.id, { id: crypto.randomUUID(), type: 'flip', params: { direction: (args.direction as string) ?? 'horizontal' } });
      return `Flipped "${selectedClip.label}" ${args.direction ?? 'horizontal'}ly`;
    }
    case 'denoise': {
      if (!selectedClip) return 'Error: No clip selected.';
      store.addFilterToClip(selectedClip.id, { id: crypto.randomUUID(), type: 'denoise', params: { strength: (args.strength as string) ?? 'medium' } });
      return `Applied denoise to "${selectedClip.label}"`;
    }
    case 'reverse_video': {
      if (!selectedClip) return 'Error: No clip selected.';
      store.addFilterToClip(selectedClip.id, { id: crypto.randomUUID(), type: 'reverse', params: {} });
      return `Applied reverse to "${selectedClip.label}"`;
    }
    case 'remove_audio': {
      if (!selectedClip) return 'Error: No clip selected.';
      store.setClipVolume(selectedClip.id, 0);
      return `Removed audio from "${selectedClip.label}"`;
    }
    case 'normalize_audio': {
      if (!selectedClip) return 'Error: No clip selected.';
      store.setClipVolume(selectedClip.id, 1);
      return `Normalized audio on "${selectedClip.label}"`;
    }
    case 'remove_fillers': {
      const captionStore = useCaptionsStore.getState();
      captionStore.removeAllFillers();
      const fillerCount = captionStore.segments.flatMap(s => s.words).filter(w => w.type === 'filler').length;
      return `Removed ${fillerCount} filler words from captions`;
    }
    case 'remove_silences': {
      useCaptionsStore.getState().removeAllSilences();
      return 'Removed all silence gaps from captions';
    }
    case 'auto_clean_captions': {
      useCaptionsStore.getState().autoClean();
      return 'Auto-cleaned captions: removed all fillers and silences';
    }
    case 'restore_captions': {
      useCaptionsStore.getState().restoreAll();
      return 'Restored all deleted words in captions';
    }
    case 'export_srt': {
      const srt = generateSRT(useCaptionsStore.getState().segments);
      if (!srt) return 'No active captions to export';
      return `SRT generated (${srt.split('\n\n').length} subtitle blocks):\n\n${srt.slice(0, 500)}${srt.length > 500 ? '...' : ''}`;
    }
    case 'set_caption_style': {
      const style = (args.style as string) ?? 'youtube';
      if (!selectedClip) return 'Error: No clip selected.';
      const styleMap: Record<string, Record<string, number | string | boolean>> = {
        youtube: { fontSize: 48, color: 'white', outline: 3, outlineColor: 'black', bg: false },
        tiktok: { fontSize: 56, color: 'white', outline: 4, outlineColor: 'black', bg: true, bgColor: 'black@0.3' },
        news: { fontSize: 32, color: 'white', outline: 0, bg: true, bgColor: '0x003366@0.85' },
        minimal: { fontSize: 36, color: 'white', outline: 1, bg: false },
      };
      const params = styleMap[style] || styleMap.youtube;
      store.addFilterToClip(selectedClip.id, { id: crypto.randomUUID(), type: 'caption-style', params: { ...params, style } });
      return `Applied "${style}" caption style to "${selectedClip.label}"`;
    }
    case 'add_styled_text': {
      if (!selectedClip) return 'Error: No clip selected.';
      store.addFilterToClip(selectedClip.id, {
        id: crypto.randomUUID(),
        type: 'styled-text-overlay',
        params: args as Record<string, number | string | boolean>,
      });
      return `Added styled text "${args.text}" to "${selectedClip.label}" with ${Object.keys(args).filter(k => k !== 'text').join(', ')}`;
    }
    case 'add_keyframe': {
      if (!selectedClip) return 'Error: No clip selected.';
      const property = (args.property as string) ?? 'opacity';
      const time = (args.time as number) ?? store.playhead;
      const value = (args.value as number) ?? 1;
      const easing = (args.easing as string) ?? 'ease-in-out';
      const kfStore = useKeyframeStore.getState();
      kfStore.addKeyframe({
        clipId: selectedClip.id,
        property,
        time,
        value,
        easing: easing as any,
      });
      return `Added keyframe: ${property}=${value} at ${time.toFixed(2)}s with ${easing} easing on "${selectedClip.label}"`;
    }
    case 'analyze_pacing': {
      const clips = Object.values(store.clips);
      if (clips.length === 0) return 'No clips to analyze.';
      const durations = clips.map(c => c.duration);
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const longest = Math.max(...durations);
      const shortest = Math.min(...durations);
      const totalDuration = clips.reduce((a, c) => Math.max(a, c.startOnTimeline + c.duration), 0);
      const suggestions: string[] = [];
      if (longest > avg * 2.5) suggestions.push(`Clip "${clips.find(c => c.duration === longest)?.label}" is ${longest.toFixed(1)}s — consider splitting for better pacing.`);
      if (shortest < 0.5) suggestions.push(`Very short clip detected (${shortest.toFixed(1)}s) — may feel jarring.`);
      if (clips.length < 3 && totalDuration > 30) suggestions.push('Few cuts in a long video — add B-roll or cutaways to maintain engagement.');
      if (avg > 10) suggestions.push('Average clip duration is long — social media content works best with 2-5s cuts.');
      return `Pacing Analysis:\n- ${clips.length} clips, total ${totalDuration.toFixed(1)}s\n- Avg clip: ${avg.toFixed(1)}s, Shortest: ${shortest.toFixed(1)}s, Longest: ${longest.toFixed(1)}s\n${suggestions.length > 0 ? '\nSuggestions:\n' + suggestions.map(s => '• ' + s).join('\n') : '\nPacing looks good!'}`;
    }
    case 'suggest_dramatic_cuts': {
      const clips = Object.values(store.clips);
      if (clips.length === 0) return 'No clips to analyze.';
      const suggestions: string[] = [];
      clips.forEach(c => {
        if (c.duration > 8) {
          const midpoint = c.startOnTimeline + c.duration / 2;
          suggestions.push(`Split "${c.label}" at ${midpoint.toFixed(1)}s for a dramatic cut`);
        }
        if (c.speed === 1 && c.duration > 3) {
          suggestions.push(`Add speed ramp to "${c.label}": slow to 0.5x then snap to 2x for impact`);
        }
      });
      if (suggestions.length === 0) suggestions.push('Clips are already well-paced for dramatic effect.');
      return `Dramatic Cut Suggestions:\n${suggestions.map(s => '• ' + s).join('\n')}`;
    }
    case 'auto_color_grade': {
      if (!selectedClip) return 'Error: No clip selected.';
      const mood = (args.mood as string) ?? 'cinematic';
      const presets: Record<string, Record<string, number | string | boolean>> = {
        cinematic: { brightness: -0.05, contrast: 1.2, saturation: 0.9 },
        warm: { brightness: 0.05, contrast: 1.1, saturation: 1.2 },
        cold: { brightness: -0.02, contrast: 1.15, saturation: 0.8 },
        vintage: { brightness: -0.1, contrast: 1.3, saturation: 0.6 },
        vibrant: { brightness: 0.05, contrast: 1.2, saturation: 1.5 },
        moody: { brightness: -0.15, contrast: 1.4, saturation: 0.7 },
      };
      const params = presets[mood] || presets.cinematic;
      store.addFilterToClip(selectedClip.id, { id: crypto.randomUUID(), type: 'color-adjust', params });
      return `Applied "${mood}" color grading to "${selectedClip.label}": brightness ${params.brightness}, contrast ${params.contrast}, saturation ${params.saturation}. This creates a ${mood} look by ${mood === 'cinematic' ? 'slightly desaturating and boosting contrast for film-like depth' : mood === 'warm' ? 'warming tones to evoke comfort and nostalgia' : mood === 'cold' ? 'cooling tones for a clinical, tense atmosphere' : mood === 'vintage' ? 'reducing saturation and crushing blacks for retro feel' : mood === 'vibrant' ? 'boosting colors for energy and excitement' : 'darkening and desaturating for emotional weight'}.`;
    }
    case 'suggest_music_moment': {
      const captionState = useCaptionsStore.getState();
      if (captionState.segments.length === 0) return 'No transcript available. Load captions first for music moment detection.';
      const emotionalKeywords: Record<string, string[]> = {
        'tension': ['but', 'however', 'problem', 'challenge', 'difficult', 'struggle', 'fight'],
        'triumph': ['finally', 'achieved', 'success', 'won', 'amazing', 'incredible', 'breakthrough'],
        'sadness': ['lost', 'gone', 'miss', 'sad', 'unfortunately', 'tragic', 'never'],
        'excitement': ['wow', 'awesome', 'exciting', 'best', 'love', 'fantastic', 'great'],
      };
      const moments: string[] = [];
      for (const seg of captionState.segments) {
        for (const word of seg.words) {
          if (word.deleted) continue;
          const lower = word.text.toLowerCase();
          for (const [emotion, keywords] of Object.entries(emotionalKeywords)) {
            if (keywords.includes(lower)) {
              moments.push(`${word.start.toFixed(1)}s: "${word.text}" → ${emotion} — add ${emotion === 'tension' ? 'suspenseful drone' : emotion === 'triumph' ? 'uplifting swell' : emotion === 'sadness' ? 'soft piano' : 'energetic beat'}`);
            }
          }
        }
      }
      if (moments.length === 0) return 'No strong emotional moments detected in transcript. Consider adding background music throughout.';
      return `Music Moment Suggestions:\n${moments.slice(0, 10).map(m => '• ' + m).join('\n')}${moments.length > 10 ? `\n... and ${moments.length - 10} more` : ''}`;
    }
    default:
      return `Unknown tool: ${name}. Available: trim_video, change_speed, adjust_color, add_blur, add_sharpen, add_fade, add_vignette, add_text, rotate_video, flip_video, denoise, reverse_video, remove_audio, normalize_audio, remove_fillers, remove_silences, auto_clean_captions, restore_captions, export_srt, set_caption_style, add_styled_text, add_keyframe, analyze_pacing, suggest_dramatic_cuts, auto_color_grade, suggest_music_moment`;
  }
}

const VIDEO_EDITOR_SYSTEM_PROMPT = `You are ClipSafe AI, an intelligent video editing copilot. You help users edit videos by calling tools that modify the timeline. You run entirely in the browser.

IMPORTANT REASONING: Before calling tools, THINK step by step about what the user wants. Consider the video's duration, content, pacing, and style. Explain your creative reasoning — WHY each change improves the edit.

When you call a tool, it will be executed immediately on the selected clip in the timeline. Always confirm what you did after calling a tool and explain the creative rationale.

You understand video, audio, captions/transcripts, timing, and visual composition deeply. You can:
1. Analyze pacing and suggest dramatic cuts
2. Color grade with mood-based presets and explain the emotional impact
3. Add keyframe animations for motion, scale, rotation, opacity
4. Detect beats in audio and sync cuts
5. Suggest music moments based on transcript emotion
6. Auto-reframe for different platforms
7. Clean up captions intelligently

Available tools:
- trim_video: Trim selected clip. {start, end}
- change_speed: Change playback speed. {speed: 0.25-4}
- adjust_color: Adjust color. {brightness: -1 to 1, contrast: 0-3, saturation: 0-3}
- add_blur: Add blur. {intensity: 1-20}
- add_sharpen: Sharpen. {intensity: 1-10}
- add_fade: Add fade. {type: "in"|"out"|"both", duration: number}
- add_vignette: Add vignette. {intensity: 0-1}
- add_text: Overlay text. {text, x, y, fontSize, color}
- rotate_video: Rotate. {degrees: 90|180|270}
- flip_video: Flip. {direction: "horizontal"|"vertical"}
- denoise: Remove noise. {strength: "light"|"medium"|"heavy"}
- reverse_video: Reverse playback.
- remove_audio: Remove audio track.
- normalize_audio: Normalize audio volume.
- add_keyframe: Add keyframe animation. {property: "positionX"|"positionY"|"scale"|"rotation"|"opacity"|"blur"|"volume", time: number, value: number, easing: "linear"|"ease-in"|"ease-out"|"ease-in-out"}
- analyze_pacing: Analyze clip durations and suggest improvements. Returns pacing report.
- suggest_dramatic_cuts: Suggest where to add dramatic cuts for impact. Returns suggestions.
- auto_color_grade: Apply mood-based color grading. {mood: "cinematic"|"warm"|"cold"|"vintage"|"vibrant"|"moody"}
- suggest_music_moment: Analyze transcript for emotional moments where music would enhance impact.

Caption/Transcript tools:
- remove_fillers, remove_silences, auto_clean_captions, restore_captions, export_srt
- set_caption_style: {style: "youtube"|"tiktok"|"news"|"minimal"}
- add_styled_text: {text, fontSize, color, x, y, outline, outlineColor, shadow, bg, bgColor, animation}

When suggesting edits, be creative and explain the reasoning. For example:
"I'll add a slow push-in using scale keyframes — starting at 1.0 and easing to 1.15 over 3 seconds. This creates a subtle Ken Burns effect that draws the viewer's eye toward the subject, building focus and intimacy."`;


function buildOpenAIToolDefs() {
  return [
    { type: 'function' as const, function: { name: 'trim_video', description: 'Trim video to start/end times', parameters: { type: 'object', properties: { start: { type: 'number' }, end: { type: 'number' } }, required: ['start', 'end'] } } },
    { type: 'function' as const, function: { name: 'compress_video', description: 'Compress video', parameters: { type: 'object', properties: { crf: { type: 'number' }, preset: { type: 'string', enum: ['ultrafast', 'fast', 'medium', 'slow'] } }, required: ['crf'] } } },
    { type: 'function' as const, function: { name: 'convert_format', description: 'Convert format', parameters: { type: 'object', properties: { format: { type: 'string', enum: ['mp4', 'webm', 'avi', 'mov', 'gif'] } }, required: ['format'] } } },
    { type: 'function' as const, function: { name: 'resize_video', description: 'Resize video', parameters: { type: 'object', properties: { width: { type: 'number' }, height: { type: 'number' } }, required: ['width', 'height'] } } },
    { type: 'function' as const, function: { name: 'change_speed', description: 'Change speed', parameters: { type: 'object', properties: { speed: { type: 'number' } }, required: ['speed'] } } },
    { type: 'function' as const, function: { name: 'adjust_color', description: 'Adjust color', parameters: { type: 'object', properties: { brightness: { type: 'number' }, contrast: { type: 'number' }, saturation: { type: 'number' } } } } },
    { type: 'function' as const, function: { name: 'add_blur', description: 'Add blur', parameters: { type: 'object', properties: { type: { type: 'string' }, intensity: { type: 'number' } }, required: ['intensity'] } } },
    { type: 'function' as const, function: { name: 'reverse_video', description: 'Reverse video', parameters: { type: 'object', properties: {} } } },
    { type: 'function' as const, function: { name: 'extract_audio', description: 'Extract audio', parameters: { type: 'object', properties: { format: { type: 'string', enum: ['mp3', 'aac', 'wav'] } }, required: ['format'] } } },
    { type: 'function' as const, function: { name: 'remove_audio', description: 'Remove audio', parameters: { type: 'object', properties: {} } } },
    { type: 'function' as const, function: { name: 'make_gif', description: 'Make GIF', parameters: { type: 'object', properties: { fps: { type: 'number' }, width: { type: 'number' } } } } },
    { type: 'function' as const, function: { name: 'rotate_video', description: 'Rotate video', parameters: { type: 'object', properties: { degrees: { type: 'number', enum: [90, 180, 270] } }, required: ['degrees'] } } },
    { type: 'function' as const, function: { name: 'flip_video', description: 'Flip video', parameters: { type: 'object', properties: { direction: { type: 'string', enum: ['horizontal', 'vertical'] } }, required: ['direction'] } } },
    { type: 'function' as const, function: { name: 'crop_video', description: 'Crop video', parameters: { type: 'object', properties: { x: { type: 'number' }, y: { type: 'number' }, width: { type: 'number' }, height: { type: 'number' } }, required: ['x', 'y', 'width', 'height'] } } },
    { type: 'function' as const, function: { name: 'add_fade', description: 'Add fade', parameters: { type: 'object', properties: { type: { type: 'string', enum: ['in', 'out', 'both'] }, duration: { type: 'number' } }, required: ['type', 'duration'] } } },
    { type: 'function' as const, function: { name: 'denoise', description: 'Remove noise', parameters: { type: 'object', properties: { strength: { type: 'string', enum: ['light', 'medium', 'heavy'] } } } } },
    { type: 'function' as const, function: { name: 'normalize_audio', description: 'Normalize audio', parameters: { type: 'object', properties: {} } } },
    { type: 'function' as const, function: { name: 'add_text', description: 'Overlay text', parameters: { type: 'object', properties: { text: { type: 'string' }, x: { type: 'number' }, y: { type: 'number' }, fontSize: { type: 'number' }, color: { type: 'string' } }, required: ['text'] } } },
    { type: 'function' as const, function: { name: 'add_vignette', description: 'Add vignette', parameters: { type: 'object', properties: { intensity: { type: 'number' } } } } },
    { type: 'function' as const, function: { name: 'add_sharpen', description: 'Sharpen video', parameters: { type: 'object', properties: { intensity: { type: 'number' } } } } },
    // Caption tools
    { type: 'function' as const, function: { name: 'remove_fillers', description: 'Remove all filler words from captions', parameters: { type: 'object', properties: {} } } },
    { type: 'function' as const, function: { name: 'remove_silences', description: 'Remove all silence gaps from captions', parameters: { type: 'object', properties: {} } } },
    { type: 'function' as const, function: { name: 'auto_clean_captions', description: 'Remove all fillers AND silences from captions at once', parameters: { type: 'object', properties: {} } } },
    { type: 'function' as const, function: { name: 'restore_captions', description: 'Restore all deleted words in captions', parameters: { type: 'object', properties: {} } } },
    { type: 'function' as const, function: { name: 'export_srt', description: 'Export current captions as SRT subtitle file', parameters: { type: 'object', properties: {} } } },
    { type: 'function' as const, function: { name: 'set_caption_style', description: 'Apply a preset caption style', parameters: { type: 'object', properties: { style: { type: 'string', enum: ['youtube', 'tiktok', 'news', 'minimal'] } }, required: ['style'] } } },
    { type: 'function' as const, function: { name: 'add_styled_text', description: 'Advanced styled text overlay with full control', parameters: { type: 'object', properties: { text: { type: 'string' }, fontSize: { type: 'number' }, color: { type: 'string' }, x: { type: 'number' }, y: { type: 'number' }, outline: { type: 'number' }, outlineColor: { type: 'string' }, shadow: { type: 'boolean' }, shadowX: { type: 'number' }, shadowY: { type: 'number' }, bg: { type: 'boolean' }, bgColor: { type: 'string' }, animation: { type: 'string', enum: ['none', 'fade-in', 'slide-up', 'slide-left'] } }, required: ['text'] } } },
    // New copilot tools
    { type: 'function' as const, function: { name: 'add_keyframe', description: 'Add keyframe animation to a property at a specific time', parameters: { type: 'object', properties: { property: { type: 'string', enum: ['positionX', 'positionY', 'scale', 'rotation', 'opacity', 'blur', 'volume'] }, time: { type: 'number', description: 'Time in seconds' }, value: { type: 'number' }, easing: { type: 'string', enum: ['linear', 'ease-in', 'ease-out', 'ease-in-out'] } }, required: ['property', 'time', 'value'] } } },
    { type: 'function' as const, function: { name: 'analyze_pacing', description: 'Analyze clip durations, pacing, and suggest improvements with reasoning', parameters: { type: 'object', properties: {} } } },
    { type: 'function' as const, function: { name: 'suggest_dramatic_cuts', description: 'Suggest dramatic cut points, speed ramps, and impact moments', parameters: { type: 'object', properties: {} } } },
    { type: 'function' as const, function: { name: 'auto_color_grade', description: 'Apply mood-based color grading with creative explanation', parameters: { type: 'object', properties: { mood: { type: 'string', enum: ['cinematic', 'warm', 'cold', 'vintage', 'vibrant', 'moody'] } }, required: ['mood'] } } },
    { type: 'function' as const, function: { name: 'suggest_music_moment', description: 'Analyze transcript for emotional moments and suggest music swells/cues', parameters: { type: 'object', properties: {} } } },
  ];
}

/** Flush any accumulated tool calls — execute them and notify callbacks */
function flushPendingToolCalls(
  toolCallAccumulator: Record<number, { id: string; name: string; args: string; emitted: boolean }>,
  callbacks: StreamCallbacks,
) {
  for (const [, tc] of Object.entries(toolCallAccumulator)) {
    if (!tc.name) continue; // incomplete tool call, skip
    let parsedArgs: Record<string, unknown> = {};
    try { parsedArgs = JSON.parse(tc.args || '{}'); } catch {
      // Try to salvage partial JSON
      try { parsedArgs = JSON.parse(tc.args + '}'); } catch {}
    }

    // Ensure we emitted the "calling" status
    if (!tc.emitted) {
      callbacks.onToolCall({ id: tc.id, name: tc.name, args: parsedArgs, status: 'calling' });
      tc.emitted = true;
    }

    const startTime = Date.now();
    try {
      const result = executeToolCall(tc.name, parsedArgs);
      const durationMs = Date.now() - startTime;
      callbacks.onToolCallUpdate(tc.id, { args: parsedArgs, status: 'done', result, durationMs });
      callbacks.onDelta(`\n\n✅ **${tc.name}**: ${result}`);
    } catch (err) {
      callbacks.onToolCallUpdate(tc.id, { args: parsedArgs, status: 'error', result: String(err) });
      callbacks.onDelta(`\n\n❌ **${tc.name}** failed: ${err}`);
    }
  }
}

/** Get fallback models for transient errors (503/429) */
function getFallbackModels(primaryModelId: string): { modelId: string; provider: AiProvider }[] {
  const aiState = useAiStore.getState();
  const primary = AI_MODELS.find(m => m.id === primaryModelId);
  const fallbacks: { modelId: string; provider: AiProvider }[] = [];

  // Same-provider fallbacks
  if (primary) {
    const sameProvider = AI_MODELS.filter(m => m.provider === primary.provider && m.id !== primaryModelId);
    for (const m of sameProvider) {
      if (aiState.keys[m.provider]) fallbacks.push({ modelId: m.id, provider: m.provider });
    }
  }

  // Cross-provider fallbacks
  const otherProviders: AiProvider[] = ['openai', 'gemini', 'anthropic'].filter(p => p !== primary?.provider) as AiProvider[];
  for (const p of otherProviders) {
    if (aiState.keys[p]) {
      const model = AI_MODELS.find(m => m.provider === p);
      if (model) fallbacks.push({ modelId: model.id, provider: p });
    }
  }

  return fallbacks;
}

export async function streamAiChat(
  messages: ChatMessage[],
  modelId: string,
  apiKey: string,
  callbacks: StreamCallbacks,
  abortSignal?: AbortSignal,
) {
  const provider = getProviderForModel(modelId);

  if (provider === 'anthropic') {
    await streamAnthropic(messages, modelId, apiKey, callbacks, abortSignal);
    return;
  }

  // Try primary, then fallbacks on transient errors
  const attempts = [{ modelId, provider, key: apiKey }, ...getFallbackModels(modelId).map(f => ({
    ...f, key: useAiStore.getState().keys[f.provider]
  }))];

  for (let attemptIdx = 0; attemptIdx < attempts.length; attemptIdx++) {
    const attempt = attempts[attemptIdx];
    const isLast = attemptIdx === attempts.length - 1;

    if (attempt.provider === 'anthropic') {
      await streamAnthropic(messages, attempt.modelId, attempt.key, callbacks, abortSignal);
      return;
    }

    const endpoint = getEndpoint(attempt.provider);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${attempt.key}`,
    };

    const systemPrompt = VIDEO_EDITOR_SYSTEM_PROMPT + buildTimelineContext() + buildCaptionsContext();
    const body: Record<string, unknown> = {
      model: attempt.modelId,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: true,
      tools: buildOpenAIToolDefs(),
    };

    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: abortSignal,
      });

      // Retry on transient errors if we have fallbacks
      if (!resp.ok) {
        const errText = await resp.text();
        const isTransient = resp.status === 503 || resp.status === 429;
        if (isTransient && !isLast) {
          const nextModel = attempts[attemptIdx + 1];
          console.warn(`[AI] ${attempt.modelId} returned ${resp.status}, falling back to ${nextModel.modelId}`);
          callbacks.onDelta(`⚡ Model ${attempt.modelId} unavailable, switching to ${nextModel.modelId}...\n\n`);
          continue; // try next
        }
        callbacks.onError(`API error ${resp.status}: ${errText}`);
        return;
      }

      if (!resp.body) {
        callbacks.onError('No response body');
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      const toolCallAccumulator: Record<number, { id: string; name: string; args: string; emitted: boolean }> = {};

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);
            if (line.endsWith('\r')) line = line.slice(0, -1);
            if (!line.startsWith('data: ')) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') {
              // Stream done — flush any pending tool calls
              if (Object.keys(toolCallAccumulator).length > 0) {
                flushPendingToolCalls(toolCallAccumulator, callbacks);
              }
              break;
            }

            try {
              const parsed = JSON.parse(jsonStr);
              const choice = parsed.choices?.[0];
              if (!choice) continue;

              const contentDelta = choice.delta?.content;
              if (contentDelta) callbacks.onDelta(contentDelta);

              const tcDeltas = choice.delta?.tool_calls;
              if (tcDeltas) {
                for (const tcd of tcDeltas) {
                  const idx = tcd.index ?? 0;
                  if (!toolCallAccumulator[idx]) {
                    toolCallAccumulator[idx] = { id: tcd.id || crypto.randomUUID(), name: '', args: '', emitted: false };
                  }
                  if (tcd.function?.name) toolCallAccumulator[idx].name = tcd.function.name;
                  if (tcd.function?.arguments) toolCallAccumulator[idx].args += tcd.function.arguments;

                  // Emit "calling" badge on first name detection
                  if (toolCallAccumulator[idx].name && !toolCallAccumulator[idx].emitted) {
                    callbacks.onToolCall({
                      id: toolCallAccumulator[idx].id,
                      name: toolCallAccumulator[idx].name,
                      args: {},
                      status: 'calling',
                    });
                    toolCallAccumulator[idx].emitted = true;
                  }
                }
              }

              // Execute on explicit finish_reason === 'tool_calls'
              if (choice.finish_reason === 'tool_calls') {
                flushPendingToolCalls(toolCallAccumulator, callbacks);
                // Clear after execution
                for (const key of Object.keys(toolCallAccumulator)) delete toolCallAccumulator[Number(key)];
              }

              // Also flush on finish_reason === 'stop' if there are pending tool calls
              if (choice.finish_reason === 'stop' && Object.keys(toolCallAccumulator).length > 0) {
                flushPendingToolCalls(toolCallAccumulator, callbacks);
                for (const key of Object.keys(toolCallAccumulator)) delete toolCallAccumulator[Number(key)];
              }
            } catch {
              // partial JSON, skip
            }
          }
        }

        // Final safety net: flush any remaining tool calls after stream ends
        if (Object.keys(toolCallAccumulator).length > 0) {
          flushPendingToolCalls(toolCallAccumulator, callbacks);
        }
      } finally {
        // Always signal done, even if loop breaks unexpectedly
        callbacks.onDone();
      }

      return; // success — don't try more fallbacks
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;

      // Retry on network errors if we have fallbacks
      if (!isLast) {
        console.warn(`[AI] ${attempt.modelId} network error, trying fallback`, err);
        callbacks.onDelta(`⚡ Connection issue with ${attempt.modelId}, trying fallback...\n\n`);
        continue;
      }
      callbacks.onError((err as Error).message);
    }
  }
}

async function streamAnthropic(
  messages: ChatMessage[],
  modelId: string,
  apiKey: string,
  callbacks: StreamCallbacks,
  abortSignal?: AbortSignal,
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  };

  const systemPrompt = VIDEO_EDITOR_SYSTEM_PROMPT + buildTimelineContext() + buildCaptionsContext();

  const anthropicMessages = messages.filter((m) => m.role !== 'system').map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const body = {
    model: modelId,
    max_tokens: 4096,
    system: systemPrompt,
    messages: anthropicMessages,
    stream: true,
  };

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: abortSignal,
    });

    if (!resp.ok) {
      const errText = await resp.text();
      callbacks.onError(`Anthropic API error ${resp.status}: ${errText}`);
      return;
    }

    if (!resp.body) {
      callbacks.onError('No response body');
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            callbacks.onDelta(parsed.delta.text);
          }
        } catch {}
      }
    }

    callbacks.onDone();
  } catch (err) {
    if ((err as Error).name === 'AbortError') return;
    callbacks.onError((err as Error).message);
  }
}
