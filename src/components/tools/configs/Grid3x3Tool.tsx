import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Grid 3×3',
  description: '3×3 grid layout of the same video.',
  params: [
    { id: 'size', label: 'Cell Size', type: 'number', defaultValue: 320, min: 100, step: 10, placeholder: '320' },
  ],
  buildArgs: (p, ext) => {
    const s = Number(p.size);
    return {
      args: ['-i', 'input', '-filter_complex',
        `[0:v]scale=${s}:${s}[c];[c][c]hstack[r1];[c][r1]hstack[row1];[row1][row1]vstack[g1];[c][c]hstack[rr];[c][rr]hstack[row3];[g1][row3]vstack`,
        '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function Grid3x3Tool() { return <GenericFilterTool config={config} />; }
