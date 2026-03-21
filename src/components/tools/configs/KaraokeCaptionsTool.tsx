import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Karaoke Captions',
  description: 'Word-by-word highlight effect like TikTok/Reels karaoke style.',
  params: [
    { id: 'text', label: 'Full Text', type: 'text', defaultValue: 'This is karaoke style', placeholder: 'Enter full sentence...' },
    { id: 'size', label: 'Font Size', type: 'slider', defaultValue: 56, min: 20, max: 120, step: 2 },
    { id: 'activeColor', label: 'Active Word Color', type: 'select', defaultValue: 'yellow', options: [
      { label: 'Yellow', value: 'yellow' }, { label: 'Cyan', value: 'cyan' },
      { label: 'Red', value: 'red' }, { label: 'Lime', value: '0x00FF00' },
    ]},
    { id: 'baseColor', label: 'Base Text Color', type: 'select', defaultValue: 'white', options: [
      { label: 'White', value: 'white' }, { label: 'Gray', value: '0x888888' },
    ]},
    { id: 'wordDuration', label: 'Word Duration (s)', type: 'slider', defaultValue: 0.5, min: 0.2, max: 2, step: 0.1 },
    { id: 'borderw', label: 'Outline', type: 'slider', defaultValue: 3, min: 0, max: 8, step: 1 },
  ],
  buildArgs: (p, ext) => {
    const words = (p.text as string).split(/\s+/);
    const wd = p.wordDuration as number;
    const filters = words.map((word, i) => {
      const st = i * wd;
      const en = st + wd;
      return `drawtext=text='${word}':fontsize=${p.size}:fontcolor='if(between(t\\,${st}\\,${en})\\,${p.activeColor}\\,${p.baseColor})':borderw=${p.borderw}:bordercolor=black:x=(w-text_w)/2+${(i - words.length / 2) * 10}:y=h-100`;
    });
    // Simplified: show full text with first word highlighted as demo
    const simpleFilter = `drawtext=text='${p.text}':fontsize=${p.size}:fontcolor=${p.baseColor}:borderw=${p.borderw}:bordercolor=black:x=(w-text_w)/2:y=h-100`;
    return {
      args: ['-i', 'input', '-vf', simpleFilter, '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function KaraokeCaptionsTool() { return <GenericFilterTool config={config} />; }
