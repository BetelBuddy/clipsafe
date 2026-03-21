import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SHORTCUTS } from '@/hooks/useKeyboardShortcuts';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function KeyboardShortcutsModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          {SHORTCUTS.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.action}</span>
              <div className="flex gap-1.5">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="min-w-[28px] h-7 px-2 flex items-center justify-center rounded-md bg-muted border border-border text-xs font-mono-tech text-foreground"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
