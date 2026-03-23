import { useEffect } from 'react';
import { loadFFmpeg } from '@/lib/ffmpeg';
import { useVideoStore } from '@/stores/videoStore';
import { Loader2 } from 'lucide-react';

export function FFmpegLoader({ children }: { children: React.ReactNode }) {
  const { ffmpegLoaded, ffmpegLoading } = useVideoStore();

  useEffect(() => {
    loadFFmpeg();
  }, []);

  if (!ffmpegLoaded) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-8 p-12">
        <img src="/logo.png" className="w-48 h-48 object-contain animate-pulse mb-8 dark:hidden" alt="Loading Engine" />
        <img src="/logo-white.png" className="w-48 h-48 object-contain animate-pulse mb-8 hidden dark:block" alt="Loading Engine" />
        <div className="text-center max-w-md">
          <p className="font-medium text-lg">Loading video engine...</p>
          <p className="text-sm text-muted-foreground mt-2">
            ClipSafe loads a ~35MB video processing engine the first time. It's cached after that — so next time is instant.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
