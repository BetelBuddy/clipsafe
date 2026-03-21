import { CaptionSegment, CaptionWord, classifyWord } from '@/stores/captionsStore';
import { useAiStore, AI_MODELS, type AiProvider } from '@/stores/aiStore';

/**
 * Transcribe audio/video using the configured AI provider.
 * Supports failover: Gemini -> OpenAI Whisper if primary fails.
 * Includes timeout and cancellation support.
 */
export async function transcribeMedia(
  mediaUrl: string,
  fileName: string,
  abortSignal?: AbortSignal,
): Promise<CaptionSegment[]> {
  const audioBase64 = await extractAudioBase64(mediaUrl);

  if (!audioBase64) {
    throw new Error('Could not extract audio from media file');
  }

  const aiState = useAiStore.getState();
  const modelId = aiState.selectedModel;
  const model = AI_MODELS.find((m) => m.id === modelId);
  const provider = model?.provider || 'openai';
  const apiKey = aiState.getKey(provider);

  if (!apiKey) {
    throw new Error('No AI API key configured. Go to the AI panel and set your API key to enable transcription.');
  }

  // Build attempt chain for failover
  const attempts: { provider: AiProvider; modelId: string; key: string }[] = [];

  if (provider === 'gemini' || provider === 'openai') {
    attempts.push({ provider, modelId, key: apiKey });
  }

  // Add cross-provider fallbacks
  const otherProviders: AiProvider[] = ['gemini', 'openai'].filter(p => p !== provider) as AiProvider[];
  for (const p of otherProviders) {
    const k = aiState.getKey(p);
    if (k) {
      const m = AI_MODELS.find(x => x.provider === p);
      if (m) attempts.push({ provider: p, modelId: m.id, key: k });
    }
  }

  if (attempts.length === 0) {
    throw new Error('Transcription requires a Gemini or OpenAI API key. Anthropic does not support audio transcription.');
  }

  let lastError: Error | null = null;

  for (const attempt of attempts) {
    if (abortSignal?.aborted) throw new Error('Transcription cancelled');

    try {
      if (attempt.provider === 'gemini') {
        return await transcribeWithGemini(audioBase64, attempt.key, attempt.modelId, fileName, abortSignal);
      } else {
        return await transcribeWithOpenAI(audioBase64, attempt.key, fileName, abortSignal);
      }
    } catch (err) {
      lastError = err as Error;
      const msg = (err as Error).message || '';
      const isTransient = msg.includes('503') || msg.includes('429') || msg.includes('UNAVAILABLE') || msg.includes('overloaded');
      if (!isTransient) throw err; // non-transient = don't retry
      console.warn(`[Transcribe] ${attempt.provider}/${attempt.modelId} failed (transient), trying fallback...`, err);
    }
  }

  throw lastError || new Error('Transcription failed after all attempts');
}

async function extractAudioBase64(mediaUrl: string): Promise<string | null> {
  try {
    const response = await fetch(mediaUrl);
    const arrayBuffer = await response.arrayBuffer();

    const audioCtx = new AudioContext({ sampleRate: 16000 });
    let audioBuffer: AudioBuffer;
    try {
      audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    } catch {
      const altCtx = new AudioContext();
      audioBuffer = await altCtx.decodeAudioData(arrayBuffer.slice(0));
      await altCtx.close();
    }

    const channelData = audioBuffer.getChannelData(0);
    const wavBuffer = encodeWAV(channelData, audioBuffer.sampleRate);
    await audioCtx.close();

    const bytes = new Uint8Array(wavBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch (err) {
    console.error('Audio extraction failed:', err);
    return null;
  }
}

function encodeWAV(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return buffer;
}

async function transcribeWithGemini(
  audioBase64: string,
  apiKey: string,
  modelId: string,
  fileName: string,
  abortSignal?: AbortSignal,
): Promise<CaptionSegment[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: abortSignal,
    body: JSON.stringify({
      contents: [{
        parts: [
          {
            inlineData: {
              mimeType: 'audio/wav',
              data: audioBase64,
            },
          },
          {
            text: `Transcribe this audio with precise word-level timestamps and speaker identification. Return ONLY valid JSON (no markdown, no code blocks) in this exact format:
{
  "segments": [
    {
      "speaker": "Speaker 1",
      "words": [
        {"text": "hello", "start": 0.0, "end": 0.5, "confidence": 0.95},
        {"text": "everyone", "start": 0.6, "end": 1.1, "confidence": 0.92}
      ]
    }
  ]
}

Rules:
- Every word must have start and end timestamps in seconds
- Identify different speakers (Speaker 1, Speaker 2, etc.)
- Include filler words like "um", "uh", "like" etc.
- Include confidence scores 0-1
- If there is no speech, return {"segments": []}
- Return ONLY the JSON, nothing else`,
          },
        ],
      }],
      generationConfig: {
        temperature: 0.1,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return parseTranscriptionJSON(text);
}

async function transcribeWithOpenAI(
  audioBase64: string,
  apiKey: string,
  fileName: string,
  abortSignal?: AbortSignal,
): Promise<CaptionSegment[]> {
  const binaryString = atob(audioBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: 'audio/wav' });

  const formData = new FormData();
  formData.append('file', blob, 'audio.wav');
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'verbose_json');
  formData.append('timestamp_granularities[]', 'word');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: formData,
    signal: abortSignal,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI Whisper error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return parseWhisperResponse(data);
}

function parseTranscriptionJSON(text: string): CaptionSegment[] {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error('Failed to parse transcription JSON:', cleaned);
    throw new Error('AI returned invalid transcription format. Please try again.');
  }

  const rawSegments = parsed.segments || [];
  if (rawSegments.length === 0) return [];

  return rawSegments.map((seg: any, si: number) => {
    const words: CaptionWord[] = (seg.words || []).map((w: any, wi: number) => ({
      id: `w-${si}-${wi}-${crypto.randomUUID().slice(0, 8)}`,
      text: w.text || '',
      start: w.start || 0,
      end: w.end || 0,
      speaker: seg.speaker || `Speaker ${si + 1}`,
      confidence: w.confidence || 0.5,
      type: classifyWord(w.text || ''),
      deleted: false,
    }));

    const wordsWithSilences: CaptionWord[] = [];
    for (let i = 0; i < words.length; i++) {
      if (i > 0) {
        const gap = words[i].start - words[i - 1].end;
        if (gap > 0.5) {
          wordsWithSilences.push({
            id: `silence-${si}-${i}-${crypto.randomUUID().slice(0, 8)}`,
            text: `[${gap.toFixed(1)}s]`,
            start: words[i - 1].end,
            end: words[i].start,
            speaker: seg.speaker,
            confidence: 1,
            type: 'silence',
            deleted: false,
          });
        }
      }
      wordsWithSilences.push(words[i]);
    }

    const allWords = wordsWithSilences;
    return {
      id: `seg-${si}-${crypto.randomUUID().slice(0, 8)}`,
      speaker: seg.speaker || `Speaker ${si + 1}`,
      words: allWords,
      start: allWords[0]?.start || 0,
      end: allWords[allWords.length - 1]?.end || 0,
    };
  });
}

function parseWhisperResponse(data: any): CaptionSegment[] {
  const words: CaptionWord[] = (data.words || []).map((w: any, i: number) => ({
    id: `w-0-${i}-${crypto.randomUUID().slice(0, 8)}`,
    text: w.word || '',
    start: w.start || 0,
    end: w.end || 0,
    confidence: 1,
    type: classifyWord(w.word || ''),
    deleted: false,
  }));

  if (words.length === 0) return [];

  const wordsWithSilences: CaptionWord[] = [];
  for (let i = 0; i < words.length; i++) {
    if (i > 0) {
      const gap = words[i].start - words[i - 1].end;
      if (gap > 0.5) {
        wordsWithSilences.push({
          id: `silence-0-${i}-${crypto.randomUUID().slice(0, 8)}`,
          text: `[${gap.toFixed(1)}s]`,
          start: words[i - 1].end,
          end: words[i].start,
          confidence: 1,
          type: 'silence',
          deleted: false,
        });
      }
    }
    wordsWithSilences.push(words[i]);
  }

  return [{
    id: `seg-0-${crypto.randomUUID().slice(0, 8)}`,
    speaker: 'Speaker 1',
    words: wordsWithSilences,
    start: wordsWithSilences[0]?.start || 0,
    end: wordsWithSilences[wordsWithSilences.length - 1]?.end || 0,
  }];
}
