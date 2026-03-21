import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Scissors, Minimize2, RefreshCw, Merge, Volume2, Maximize2, MessageSquare, Wrench, Lock, ChevronRight, Film, Zap, Shield, Wifi, FileImage, Undo2, Repeat, Paintbrush, Timer, Split, Grid2x2, Gauge, Activity, Sun, Moon, Twitter, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const tools = [
  { icon: Scissors, title: 'Trim', desc: 'Cut your video to the perfect length', path: '/app/trim' },
  { icon: Minimize2, title: 'Compress', desc: 'Shrink file size without losing quality', path: '/app/compress' },
  { icon: RefreshCw, title: 'Convert', desc: 'Change format to MP4, WebM, GIF and more', path: '/app/convert' },
  { icon: Merge, title: 'Merge', desc: 'Join multiple videos into one', path: '/app/merge' },
  { icon: Volume2, title: 'Audio', desc: 'Remove, extract or replace audio', path: '/app/audio' },
  { icon: Maximize2, title: 'Resize', desc: 'Change resolution or crop to any dimension', path: '/app/resize' },
  { icon: MessageSquare, title: 'Subtitles', desc: 'Add captions and subtitles', path: '/app/subtitles' },
  { icon: FileImage, title: 'GIF Maker', desc: 'Convert any clip to an animated GIF', path: '/app/gif' },
  { icon: Undo2, title: 'Reverse', desc: 'Play your video backwards instantly', path: '/app/reverse' },
  { icon: Repeat, title: 'Loop', desc: 'Repeat your video multiple times', path: '/app/loop' },
  { icon: Paintbrush, title: 'Color', desc: 'Adjust brightness, contrast and color filters', path: '/app/color' },
  { icon: Timer, title: 'Frame Rate', desc: 'Change FPS for smooth playback or smaller files', path: '/app/fps' },
  { icon: Split, title: 'Split', desc: 'Split video into equal parts or by duration', path: '/app/split' },
  { icon: Gauge, title: 'Speed Change', desc: 'Speed up or slow down playback 0.25x-4x', path: '/app/speed-change' },
  { icon: Activity, title: 'Audio Visualizer', desc: 'Generate waveform or spectrum visualization', path: '/app/audio-visualizer' },
  { icon: Wrench, title: 'Utilities', desc: 'Rotate, speed, stabilize, watermark and more', path: '/app/tools' },
];

const badges = ['✓ No Upload', '✓ No Account', '✓ Works Offline', '✓ No File Size Limit', '✓ 200+ Tools', '✓ GDPR Compliant'];

const steps = [
  { icon: Film, title: 'Drop your video', desc: 'Drag and drop or click to select any video file.' },
  { icon: Zap, title: 'Choose your tool', desc: 'Pick from 200+ tools across 10 categories.' },
  { icon: ChevronRight, title: 'Download instantly', desc: 'Get your processed video — never uploaded anywhere.' },
];

export default function LandingPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5 font-bold text-xl">
            <img src="/logo.png" className="w-10 md:w-20 h-10 md:h-20 object-contain" alt="ClipSafe Logo" />
            <span>ClipSafe</span>
            <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[9px] font-bold uppercase tracking-wider ml-1">0.0.1 Beta</Badge>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#tools" className="hover:text-foreground transition-colors">Tools</a>
            <a href="#how" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#privacy" className="hover:text-foreground transition-colors">Privacy</a>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Link to="/editor">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-6">
                Open Editor
              </Button>
            </Link>
            <Link to="/tools">
              <Button variant="outline" className="border-border hover:bg-surface-elevated rounded-md px-6">
                Browse Tools
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden grain-overlay">
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-36 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05]"
          >
            Edit Video.<br />
            <span className="text-gradient-primary">Privately.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto"
          >
            200+ tools to trim, compress, convert, merge and more — right in your browser. Zero uploads. Zero accounts. AI-powered editor included.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
          >
            <Link to="/editor">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 text-base shadow-glow-primary">
                Open AI Editor
              </Button>
            </Link>
            <Link to="/tools">
              <Button size="lg" variant="outline" className="px-8 text-base border-border hover:bg-surface-elevated">
                Browse all 200+ tools
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Marquee */}
      <div className="border-y border-border overflow-hidden py-4">
        <div className="marquee-track">
          {[...badges, ...badges, ...badges, ...badges].map((b, i) => (
            <span key={i} className="flex-shrink-0 px-6 text-sm font-medium text-muted-foreground whitespace-nowrap">{b}</span>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <section id="tools" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Everything you need</h2>
        <p className="text-muted-foreground text-center mb-12">200+ professional video tools, all running locally in your browser</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="h-full"
            >
              <Link
                to={tool.path}
                className="flex flex-col h-full rounded-lg bg-card border border-border p-6 hover:border-primary/40 hover:shadow-glow-primary transition-all duration-300 group"
              >
                <tool.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg">{tool.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{tool.desc}</p>
                <span className="text-sm text-primary mt-auto pt-3 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Try it <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/tools">
            <Button variant="outline" size="lg">
              See all 200+ tools <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-32 h-32 rounded-full bg-surface-elevated flex items-center justify-center mx-auto mb-4">
                <img src="/logo.png" className="w-20 h-20 object-contain" alt="Step Icon" />
              </div>
              <div className="text-xs font-mono text-muted-foreground mb-2">Step {i + 1}</div>
              <h3 className="font-semibold text-lg">{step.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" className="max-w-4xl mx-auto px-6 py-20">
        <div className="rounded-xl bg-card border border-border p-8 md:p-12 text-center shadow-cinematic">
          <div className="w-16 h-16 rounded-full bg-surface-elevated flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Your videos stay on your device</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Your videos are processed entirely on your device using WebAssembly technology. We have no servers, no database, and no way to see your files even if we wanted to.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <img src="/logo.png" className="w-8 md:w-12 h-8 md:h-12 object-contain" alt="ClipSafe Logo" />
            <span className="font-medium text-foreground">ClipSafe</span>
          </div>
          <p>Powered by FFmpeg.wasm · 200+ tools · Runs 100% in your browser</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <span className="text-[10px] opacity-50 select-none">|</span>
            <a 
              href="https://github.com/BetelBuddy/clipsafe" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-primary transition-colors flex items-center gap-1.5 font-medium group"
            >
              <Twitter className="w-3 h-3 fill-current" />
              <span>@BetelBuddy</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-4 text-[11px] text-muted-foreground/70 text-center md:text-left leading-relaxed font-medium">
          ClipSafe is currently in Beta. By using this software, you acknowledge that functional components are subject to unexpected failure, and features may be modified or removed without prior notice. The software is provided "as is" without warranty of any kind.
        </div>
      </footer>
    </div>
  );
}
