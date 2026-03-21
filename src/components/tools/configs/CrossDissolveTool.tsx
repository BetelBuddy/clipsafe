import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Cross Dissolve',
  description: 'Add a dissolve transition at the midpoint of the video.',
  params: [
    { id: 'duration', label: 'Transition Duration (s)', type: 'slider', defaultValue: 1, min: 0.5, max: 5, step: 0.5 },
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-filter_complex', `[0:v]split[a][b];[a]fade=t=out:st=0:d=${p.duration}[va];[b]fade=t=in:st=0:d=${p.duration}[vb];[va][vb]overlay`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function CrossDissolveTool() { return <GenericFilterTool config={config} />; }
