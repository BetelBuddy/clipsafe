import { Outlet, Link, useLocation } from 'react-router-dom';
import { Film, Menu, Search, Keyboard, ChevronDown, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { FFmpegLoader } from '@/components/FFmpegLoader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { AppSidebar } from '@/components/AppSidebar';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { TOOLS, CATEGORIES } from '@/lib/toolRegistry';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

function MobileNavSheet() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const location = useLocation();

  const currentToolId = location.pathname.replace('/app/', '');

  const filteredTools = useMemo(() => {
    if (!search.trim()) return TOOLS;
    const q = search.toLowerCase();
    return TOOLS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [search]);

  const toolsByCategory = useMemo(() => {
    const grouped: Record<string, typeof TOOLS> = {};
    for (const cat of CATEGORIES) {
      grouped[cat.id] = filteredTools.filter((t) => t.category === cat.id);
    }
    return grouped;
  }, [filteredTools]);

  const activeTool = TOOLS.find((t) => t.id === currentToolId);
  const activeCategory = activeTool?.category;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="p-2 hover:bg-muted/50 rounded-md transition-colors">
          <Menu className="w-5 h-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="flex items-center gap-1.5">
            <img src="/logo.png" className="w-16 h-16 object-contain" alt="ClipSafe Logo" />
            <span>ClipSafe Tools</span>
          </SheetTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-2">
          {CATEGORIES.map((cat) => {
            const catTools = toolsByCategory[cat.id];
            if (catTools.length === 0) return null;

            const isActiveCategory = activeCategory === cat.id;

            return (
              <Collapsible
                key={cat.id}
                defaultOpen={isActiveCategory || search.length > 0}
                className="group/collapsible"
              >
                <CollapsibleTrigger className="w-full">
                  <div
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/50',
                      isActiveCategory && 'text-primary'
                    )}
                  >
                    <cat.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left truncate">{cat.title}</span>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {catTools.length}
                    </Badge>
                    <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="pl-6 space-y-0.5">
                    {catTools.map((tool) => {
                      const isActive = tool.id === currentToolId;
                      return (
                        <Link
                          key={tool.id}
                          to={`/app/${tool.id}`}
                          onClick={() => setOpen(false)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors',
                            isActive
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          )}
                        >
                          <tool.icon className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{tool.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function AppLayout() {
  const { theme, setTheme } = useTheme();
  const { showHelp, setShowHelp } = useKeyboardShortcuts();

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AppSidebar onShortcutsClick={() => setShowHelp(true)} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <header className="md:hidden flex items-center gap-2 h-14 px-4 border-b border-border bg-background/80 backdrop-blur-sm fixed top-0 w-full z-20">
            <MobileNavSheet />
            <Link to="/" className="flex items-center gap-1.5">
              <img src="/logo.png" className="w-8 md:w-14 h-8 md:h-14 object-contain" alt="ClipSafe Logo" />
              <span className="font-bold">ClipSafe</span>
              <Badge variant="secondary" className="px-1 py-0 h-3 text-[8px] font-bold opacity-70">BETA</Badge>
            </Link>
            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 rounded-md"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              <button
                onClick={() => setShowHelp(true)}
                className="p-2 hover:bg-muted/50 rounded-md transition-colors"
              >
                <Keyboard className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </header>

          {/* Desktop Header with Sidebar Toggle */}
          <header className="hidden md:flex items-center justify-between h-12 px-4 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-8 w-8" />
              <div className="w-px h-4 bg-border mx-1" />
              <span className="text-xs font-bold">ClipSafe</span>
              <Badge variant="secondary" className="px-1 py-0 h-3 text-[8px] font-bold opacity-70">BETA</Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-8 w-8 rounded-md"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </header>

          {/* Main Area */}
          <main className="flex-1 overflow-y-auto">
            <FFmpegLoader>
              <div className="p-4 md:p-6">
                <Outlet />
              </div>
            </FFmpegLoader>
          </main>
        </div>

        <KeyboardShortcutsModal open={showHelp} onOpenChange={setShowHelp} />
      </div>
    </SidebarProvider>
  );
}
