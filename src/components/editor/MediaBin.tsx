import { useState, useMemo, useRef, useCallback } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { Plus, Film, Music, Image, Trash2, Search, LayoutGrid, List, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatBytes, formatTime } from '@/lib/ffmpeg';
import { buildMediaFile } from '@/lib/mediaImport';

type SortMode = 'name' | 'date' | 'size' | 'duration';

export function MediaBin() {
  const { mediaFiles, removeMediaFile, importAndAddToTimeline } = useEditorStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortMode>('date');
  const [gridView, setGridView] = useState(true);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const media = await buildMediaFile(file);
      importAndAddToTimeline(media);
    }
  }, [importAndAddToTimeline]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const filtered = useMemo(() => {
    let items = [...mediaFiles];
    if (search) items = items.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
    items.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'size': return b.size - a.size;
        case 'duration': return b.duration - a.duration;
        default: return b.addedAt - a.addedAt;
      }
    });
    return items;
  }, [mediaFiles, search, sortBy]);

  const TypeIcon = ({ type }: { type: string }) => {
    if (type === 'video') return <Film className="w-3.5 h-3.5 text-primary" />;
    if (type === 'audio') return <Music className="w-3.5 h-3.5 text-secondary" />;
    return <Image className="w-3.5 h-3.5 text-accent-foreground" />;
  };

  return (
    <div className="h-full flex flex-col bg-card" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-border gap-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-shrink-0">Media</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setGridView(!gridView)}>
            {gridView ? <List className="w-3 h-3" /> : <LayoutGrid className="w-3 h-3" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => inputRef.current?.click()}>
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
        <input ref={inputRef} type="file" multiple accept="video/*,audio/*,image/*" className="hidden" onChange={(e) => { handleFiles(e.target.files); e.currentTarget.value = ''; }} />
      </div>

      {mediaFiles.length > 0 && (
        <div className="px-2 py-1.5 flex gap-1 border-b border-border">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="h-6 text-[10px] pl-6" />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortMode)}
            className="h-6 text-[10px] bg-transparent border border-border rounded px-1 text-muted-foreground"
          >
            <option value="date">Recent</option>
            <option value="name">Name</option>
            <option value="size">Size</option>
            <option value="duration">Length</option>
          </select>
        </div>
      )}

      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          /* Clickable empty state */
          <button
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center h-40 w-full text-muted-foreground text-xs gap-3 p-4 hover:bg-accent/30 transition-colors cursor-pointer"
          >
            <div className="w-14 h-14 rounded-xl bg-muted/50 flex items-center justify-center">
              <Upload className="w-6 h-6 opacity-50" />
            </div>
            <span className="font-medium">{search ? 'No results' : 'Import Media'}</span>
            {!search && <span className="text-[10px] opacity-60">Click or drop files here</span>}
          </button>
        ) : gridView ? (
          <div className="p-2 grid grid-cols-2 gap-1.5">
            {filtered.map((f) => (
              <div
                key={f.id}
                className="rounded-md border border-border overflow-hidden cursor-grab hover:border-primary/50 transition-colors group relative"
                draggable
                onDragStart={(e) => e.dataTransfer.setData('media-id', f.id)}
              >
                <div className="aspect-video bg-surface-elevated flex items-center justify-center overflow-hidden">
                  {f.thumbnailUrl ? (
                    <img src={f.thumbnailUrl} className="w-full h-full object-cover" alt={f.name} />
                  ) : (
                    <TypeIcon type={f.type} />
                  )}
                </div>
                {f.duration > 0 && (
                  <span className="absolute top-1 right-1 bg-background/80 backdrop-blur-sm text-[9px] font-mono text-muted-foreground px-1 rounded">
                    {formatTime(f.duration)}
                  </span>
                )}
                <div className="px-1.5 py-1 flex items-center gap-1">
                  <span className="text-[10px] truncate flex-1">{f.name}</span>
                  <button onClick={() => removeMediaFile(f.id)} className="opacity-0 group-hover:opacity-100 text-destructive flex-shrink-0">
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {filtered.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-surface-elevated transition-colors group cursor-grab"
                draggable
                onDragStart={(e) => e.dataTransfer.setData('media-id', f.id)}
              >
                <TypeIcon type={f.type} />
                <span className="truncate flex-1">{f.name}</span>
                {f.duration > 0 && <span className="text-muted-foreground font-mono text-[10px]">{formatTime(f.duration)}</span>}
                <span className="text-muted-foreground text-[10px]">{formatBytes(f.size)}</span>
                <button onClick={() => removeMediaFile(f.id)} className="opacity-0 group-hover:opacity-100 text-destructive">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
