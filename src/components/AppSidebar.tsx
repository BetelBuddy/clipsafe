import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Film, Keyboard, ChevronDown, Sun, Moon, Twitter } from 'lucide-react';
import { useTheme } from 'next-themes';
import { TOOLS, CATEGORIES } from '@/lib/toolRegistry';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface AppSidebarProps {
  onShortcutsClick?: () => void;
}

export function AppSidebar({ onShortcutsClick }: AppSidebarProps) {
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useState('');
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  // Get current tool ID from path
  const currentToolId = location.pathname.replace('/app/', '');

  // Filter tools by search
  const filteredTools = useMemo(() => {
    if (!search.trim()) return TOOLS;
    const q = search.toLowerCase();
    return TOOLS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [search]);

  // Group tools by category
  const toolsByCategory = useMemo(() => {
    const grouped: Record<string, typeof TOOLS> = {};
    for (const cat of CATEGORIES) {
      grouped[cat.id] = filteredTools.filter((t) => t.category === cat.id);
    }
    return grouped;
  }, [filteredTools]);

  // Determine which category is active
  const activeTool = TOOLS.find((t) => t.id === currentToolId);
  const activeCategory = activeTool?.category;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border">
        <Link
          to="/"
          className="flex items-center gap-1.5 px-2 py-3 hover:opacity-80 transition-opacity"
        >
          <img src="/logo.png" className="w-12 h-12 object-contain flex-shrink-0" alt="ClipSafe Logo" />
          {!collapsed && <span className="font-bold text-foreground">ClipSafe</span>}
        </Link>

        {!collapsed && (
          <div className="px-2 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search tools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-sm bg-muted/50"
              />
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
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
                    'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50',
                    isActiveCategory && 'text-primary'
                  )}
                >
                  <cat.icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left truncate">{cat.title}</span>
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        {catTools.length}
                      </Badge>
                      <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </>
                  )}
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <SidebarMenu className="pl-4">
                  {catTools.map((tool) => {
                    const isActive = tool.id === currentToolId;
                    return (
                      <SidebarMenuItem key={tool.id}>
                        <SidebarMenuButton asChild>
                          <Link
                            to={`/app/${tool.id}`}
                            className={cn(
                              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors',
                              isActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            )}
                          >
                            <tool.icon className="w-4 h-4 flex-shrink-0" />
                            {!collapsed && <span className="truncate">{tool.title}</span>}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-2 gap-1">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors w-full rounded-md"
        >
          <div className="relative w-4 h-4">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute inset-0 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </div>
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button
          onClick={onShortcutsClick}
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors w-full rounded-md"
        >
          <Keyboard className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Shortcuts</span>}
        </button>
        <div className="mt-2 px-3 py-2 border-t border-border/50 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-mono">0.0.1 Beta</span>
            <a 
              href="https://github.com/BetelBuddy/clipsafe" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <Twitter className="w-2.5 h-2.5 fill-current" />
              <span>@BetelBuddy</span>
            </a>
          </div>
          <p className="text-[10px] text-muted-foreground/70 leading-tight">Privacy-focused AI Media Platform</p>
          <p className="text-[9px] text-muted-foreground/60 leading-tight mt-1 pt-1 border-t border-border/30 italic">
            DISCLAIMER: ClipSafe is in Beta. Systems may fail unexpectedly. Features are subject to change without notice. Use at your own risk.
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
