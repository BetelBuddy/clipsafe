import { useState, useRef } from 'react';
import { useVideoStore } from '@/stores/videoStore';
import { FileDropZone } from '@/components/FileDropZone';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { DownloadOutput } from '@/components/DownloadOutput';
import { runFFmpegCommand, loadFFmpeg, fetchFile } from '@/lib/ffmpeg';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload } from 'lucide-react';

export default function AudioTool() {
  const { file, fileUrl, isProcessing } = useVideoStore();
  const [audioFormat, setAudioFormat] = useState('mp3');
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const replaceRef = useRef<HTMLInputElement>(null);

  const handleRemoveAudio = async () => {
    if (!file) return;
    useVideoStore.getState().setProcessing(true, 'Removing audio...');
    await runFFmpegCommand(file, ['-i', 'input', '-c:v', 'copy', '-an', 'output.mp4'], 'output.mp4');
  };

  const handleExtractAudio = async () => {
    if (!file) return;
    const ext = audioFormat;
    const codecArgs: Record<string, string[]> = {
      mp3: ['-vn', '-c:a', 'libmp3lame', '-b:a', '192k'],
      aac: ['-vn', '-c:a', 'aac', '-b:a', '192k'],
      wav: ['-vn'],
      ogg: ['-vn', '-c:a', 'libvorbis'],
    };
    useVideoStore.getState().setProcessing(true, 'Extracting audio...');
    await runFFmpegCommand(file, ['-i', 'input', ...codecArgs[ext], `output.${ext}`], `output.${ext}`);
  };

  const handleReplaceAudio = async () => {
    if (!file || !replaceFile) return;
    const store = useVideoStore.getState();
    store.setProcessing(true, 'Replacing audio...');
    const ffmpeg = await loadFFmpeg();
    await ffmpeg.writeFile('input', await fetchFile(file));
    await ffmpeg.writeFile('audio_input', await fetchFile(replaceFile));
    await ffmpeg.exec(['-i', 'input', '-i', 'audio_input', '-c:v', 'copy', '-map', '0:v:0', '-map', '1:a:0', '-shortest', 'output.mp4']);
    const data = await ffmpeg.readFile('output.mp4');
    const blob = new Blob([data as unknown as BlobPart], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    try { await ffmpeg.deleteFile('input'); } catch (e) { /* Intentionally empty */ }
    try { await ffmpeg.deleteFile('audio_input'); } catch (e) { /* Intentionally empty */ }
    try { await ffmpeg.deleteFile('output.mp4'); } catch (e) { /* Intentionally empty */ }
    store.setOutput(url, blob.size, 'replaced_audio.mp4');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <div>
        <h1 className="text-2xl font-bold">Audio Tools</h1>
        <p className="text-sm text-muted-foreground mt-1">Remove, extract or replace audio</p>
      </div>

      <FileDropZone />

      {file && fileUrl && (
        <Tabs defaultValue="remove" className="space-y-4">
          <TabsList className="bg-surface-elevated border border-border">
            <TabsTrigger value="remove">Remove Audio</TabsTrigger>
            <TabsTrigger value="extract">Extract Audio</TabsTrigger>
            <TabsTrigger value="replace">Replace Audio</TabsTrigger>
          </TabsList>

          <TabsContent value="remove" className="space-y-4">
            <div className="rounded-lg bg-card border border-border p-6 text-center space-y-4">
              <p className="text-muted-foreground">Remove the audio track entirely, keeping only the video.</p>
              <Button onClick={handleRemoveAudio} disabled={isProcessing} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Remove Audio Track
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="extract" className="space-y-4">
            <div className="rounded-lg bg-card border border-border p-4 space-y-4">
              <p className="text-sm text-muted-foreground">Extract audio to a separate file</p>
              <div className="grid grid-cols-4 gap-2">
                {['mp3', 'aac', 'wav', 'ogg'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setAudioFormat(fmt)}
                    className={`rounded-lg border p-3 text-center font-bold uppercase transition-all ${
                      audioFormat === fmt ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-muted-foreground'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
              <Button onClick={handleExtractAudio} disabled={isProcessing} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Extract as {audioFormat.toUpperCase()}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="replace" className="space-y-4">
            <div className="rounded-lg bg-card border border-border p-4 space-y-4">
              <p className="text-sm text-muted-foreground">Replace the video's audio with a new audio file</p>
              <div
                className="rounded-lg border-2 border-dashed border-border hover:border-muted-foreground transition-colors cursor-pointer p-6 flex flex-col items-center gap-2"
                onClick={() => replaceRef.current?.click()}
              >
                <input ref={replaceRef} type="file" accept="audio/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setReplaceFile(e.target.files[0]); }} />
                <Upload className="w-6 h-6 text-muted-foreground" />
                <p className="text-sm">{replaceFile ? replaceFile.name : 'Drop replacement audio (MP3, WAV, AAC)'}</p>
              </div>
              <Button onClick={handleReplaceAudio} disabled={isProcessing || !replaceFile} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Replace Audio
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}

      <DownloadOutput />
      <ProcessingOverlay />
    </div>
  );
}
