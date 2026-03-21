import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TOOLS, CATEGORIES, searchTools, type ToolDef, type ToolCategory } from '@/lib/toolRegistry';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Star, Clock, ChevronRight, Film, ArrowLeft, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const FAVORITES_KEY = 'clipsafe_fav_tools';
const RECENTS_KEY = 'clipsafe_recent_tools';

function loadFavorites(): string[] {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); } catch { return []; }
}
function saveFavorites(ids: string[]) { localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids)); }

function loadRecents(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]'); } catch { return []; }
}
function addRecent(id: string) {
  const recents = loadRecents().filter((r) => r !== id);
  recents.unshift(id);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(recents.slice(0, 10)));
}

function ToolCard({ tool, isFav, onToggleFav }: { tool: ToolDef; isFav: boolean; onToggleFav: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      <div className="group relative rounded-lg bg-card border border-border hover:border-primary/40 hover:shadow-glow-primary transition-all duration-200">
        <Link
          to={`/app/${tool.id}`}
          onClick={() => addRecent(tool.id)}
          className="block p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
              <tool.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">{tool.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tool.description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
          </div>
        </Link>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFav(); }}
          className={cn(
            'absolute top-2 right-2 p-1 rounded-md transition-all',
            isFav ? 'text-secondary' : 'text-muted-foreground/30 hover:text-muted-foreground/60'
          )}
        >
          <Star className={cn('w-3.5 h-3.5', isFav && 'fill-current')} />
        </button>
      </div>
    </motion.div>
  );
}

export default function ToolsBrowserPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all' | 'favorites' | 'recent'>('all');
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);
  const recents = useMemo(() => loadRecents(), []);

  const toggleFav = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      saveFavorites(next);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    let tools = query ? searchTools(query) : TOOLS;
    if (activeCategory === 'favorites') tools = tools.filter((t) => favorites.includes(t.id));
    else if (activeCategory === 'recent') {
      const recentIds = loadRecents();
      tools = recentIds.map((id) => tools.find((t) => t.id === id)).filter(Boolean) as ToolDef[];
    }
    else if (activeCategory !== 'all') tools = tools.filter((t) => t.category === activeCategory);
    return tools;
  }, [query, activeCategory, favorites]);

  const groupedByCategory = useMemo(() => {
    if (activeCategory !== 'all' || query) return null;
    const groups: Record<string, ToolDef[]> = {};
    CATEGORIES.forEach((c) => { groups[c.id] = []; });
    TOOLS.forEach((t) => { if (groups[t.category]) groups[t.category].push(t); });
    return groups;
  }, [activeCategory, query]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-1.5 mb-4">
            <Link to="/" className="flex items-center gap-1.5">
              <img src="/logo.png" className="w-10 md:w-16 h-10 md:h-16 object-contain" alt="ClipSafe Logo" />
              <span className="font-bold text-lg">ClipSafe</span>
              <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[9px] font-bold opacity-70">0.0.1 BETA</Badge>
            </Link>
            <span className="text-muted-foreground text-sm">/ Tools</span>
            <span className="text-muted-foreground opacity-30 mx-1">|</span>
            <a 
              href="https://github.com/BetelBuddy/clipsafe" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <Twitter className="w-2.5 h-2.5 fill-current" />
              <span>@BetelBuddy</span>
            </a>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 55+ tools..."
                className="pl-9 h-10 bg-surface border-border"
              />
            </div>
            <Link to="/editor">
              <Button variant="outline" className="h-10 whitespace-nowrap">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Editor
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar categories */}
          <aside className="w-full md:w-48 flex-shrink-0">
            <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              <button
                onClick={() => setActiveCategory('all')}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm whitespace-nowrap transition-colors',
                  activeCategory === 'all' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
                )}
              >
                All Tools
                <span className="text-[10px] ml-auto opacity-60">{TOOLS.length}</span>
              </button>
              <button
                onClick={() => setActiveCategory('favorites')}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm whitespace-nowrap transition-colors',
                  activeCategory === 'favorites' ? 'bg-secondary/10 text-secondary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
                )}
              >
                <Star className="w-3.5 h-3.5" /> Favorites
                <span className="text-[10px] ml-auto opacity-60">{favorites.length}</span>
              </button>
              <button
                onClick={() => setActiveCategory('recent')}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm whitespace-nowrap transition-colors',
                  activeCategory === 'recent' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
                )}
              >
                <Clock className="w-3.5 h-3.5" /> Recent
              </button>
              <div className="hidden md:block w-full h-px bg-border my-2" />
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm whitespace-nowrap transition-colors',
                    activeCategory === cat.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
                  )}
                >
                  <cat.icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden md:inline">{cat.title}</span>
                  <span className="md:hidden">{cat.title}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Tool grid */}
          <div className="flex-1">
            {groupedByCategory && !query ? (
              // Grouped view
              <div className="space-y-8">
                {CATEGORIES.map((cat) => {
                  const tools = groupedByCategory[cat.id];
                  if (!tools || tools.length === 0) return null;
                  return (
                    <div key={cat.id}>
                      <div className="flex items-center gap-2 mb-3">
                        <cat.icon className="w-4 h-4 text-primary" />
                        <h2 className="font-semibold text-sm">{cat.title}</h2>
                        <span className="text-[10px] text-muted-foreground">{tools.length}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <AnimatePresence mode="popLayout">
                          {tools.map((tool) => (
                            <ToolCard key={tool.id} tool={tool} isFav={favorites.includes(tool.id)} onToggleFav={() => toggleFav(tool.id)} />
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Flat filtered view
              <div>
                <div className="text-xs text-muted-foreground mb-3">{filtered.length} tool{filtered.length !== 1 ? 's' : ''} found</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} isFav={favorites.includes(tool.id)} onToggleFav={() => toggleFav(tool.id)} />
                    ))}
                  </AnimatePresence>
                </div>
                {filtered.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No tools found for "{query}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
