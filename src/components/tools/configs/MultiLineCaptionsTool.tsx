import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Multi-Line Captions',
  description: 'Stacked multi-line text captions with line spacing control.',
  params: [
    { id: 'line1', label: 'Line 1', type: 'text', defaultValue: 'First line', placeholder: 'Line 1...' },
    { id: 'line2', label: 'Line 2', type: 'text', defaultValue: 'Second line', placeholder: 'Line 2...' },
    { id: 'line3', label: 'Line 3 (optional)', type: 'text', defaultValue: '', placeholder: 'Line 3...' },
    { id: 'size', label: 'Font Size', type: 'slider', defaultValue: 40, min: 16, max: 100, step: 2 },
    { id: 'spacing', label: 'Line Spacing', type: 'slider', defaultValue: 10, min: 0, max: 40, step: 2 },
    { id: 'color', label: 'Color', type: 'select', defaultValue: 'white', options: [
      { label: 'White', value: 'white' }, { label: 'Yellow', value: 'yellow' },
    ]},
  ],
  buildArgs: (p, ext) => {
    const sz = p.size as number;
    const sp = p.spacing as number;
    const lines = [p.line1 as string, p.line2 as string, p.line3 as string].filter(Boolean);
    const totalH = lines.length * sz + (lines.length - 1) * sp;
    const filters = lines.map((line, i) => {
      const y = `h-${totalH + 40}+${i * (sz + sp)}`;
      return `drawtext=text='${line}':fontsize=${sz}:fontcolor=${p.color}:borderw=2:bordercolor=black:x=(w-text_w)/2:y=${y}`;
    });
    return {
      args: ['-i', 'input', '-vf', filters.join(','), '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function MultiLineCaptionsTool() { return <GenericFilterTool config={config} />; }
