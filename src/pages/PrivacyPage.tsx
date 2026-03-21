import { Link } from 'react-router-dom';
import { Shield, Film, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          </Link>
          <div className="flex items-center gap-2 font-bold">
            <Film className="w-5 h-5 text-primary" />
            ClipSafe
          </div>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center">
          <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold">Zero Server Architecture</h1>
          <p className="text-muted-foreground mt-4 text-lg">Your files never leave your browser. Period.</p>
        </div>

        <div className="rounded-xl bg-card border border-border p-8 text-center">
          <div className="flex items-center justify-center gap-4 text-sm font-mono flex-wrap">
            <span className="px-4 py-2 bg-surface-elevated rounded-md">Your Computer</span>
            <span className="text-primary">→</span>
            <span className="px-4 py-2 bg-surface-elevated rounded-md">Browser (FFmpeg.wasm)</span>
            <span className="text-primary">→</span>
            <span className="px-4 py-2 bg-surface-elevated rounded-md">Output File</span>
          </div>
          <p className="text-muted-foreground mt-4 text-sm">No arrows go to any server. Because there is no server.</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">FAQ</h2>
          {[
            { q: 'Can you see my videos?', a: 'Technically impossible. We have no server that receives your files.' },
            { q: 'Does it work offline?', a: 'Yes, after the first load, all processing works with no internet connection.' },
            { q: 'What data do you collect?', a: 'Page view analytics only (no personal data). Zero video/file data ever.' },
            { q: 'Is this GDPR compliant?', a: 'Yes, because we never process your personal data.' },
          ].map((faq) => (
            <div key={faq.q} className="rounded-lg bg-card border border-border p-6">
              <h3 className="font-semibold">{faq.q}</h3>
              <p className="text-sm text-muted-foreground mt-2">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
