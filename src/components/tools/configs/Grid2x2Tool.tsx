import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Grid 2×2',
  description: 'Arrange video in a 2×2 grid layout. Uses the same video in all 4 quadrants by default.',
  params: [
    { id: 'cellWidth', label: 'Cell Width (px)', type: 'number', defaultValue: 640, min: 160, max: 1920, placeholder: '640' },
    { id: 'cellHeight', label: 'Cell Height (px)', type: 'number', defaultValue: 360, min: 90, max: 1080, placeholder: '360' },
  ],
  buildArgs: (p, ext) => {
    const w = p.cellWidth as number;
    const h = p.cellHeight as number;
    return {
      args: ['-i', 'input.' + ext, '-filter_complex',
        `[0:v]scale=${w}:${h}[a];[0:v]scale=${w}:${h}[b];[0:v]scale=${w}:${h}[c];[0:v]scale=${w}:${h}[d];[a][b]hstack=inputs=2[top];[c][d]hstack=inputs=2[bot];[top][bot]vstack=inputs=2`,
        '-y', 'output.' + ext],
      outputFileName: 'grid_2x2.' + ext,
    };
  },
};

export default function Grid2x2Tool() {
  return <GenericFilterTool config={config} />;
}
