import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Skin Tone Fix',
  description: 'Natural skin-tone correction and balancing.',
  params: [{ id: 'sat', label: 'Skin Saturation', type: 'slider', defaultValue: 1.05, min: 0.8, max: 1.4, step: 0.05 }],
  buildArgs: (p, ext) => ({ args: ['-i', 'input', '-vf', `eq=saturation=${p.sat}:gamma=1.03`, '-c:a', 'copy', `output.${ext}`], outputFileName: `output.${ext}` }),
};

export default function SkinToneFixTool() { return <GenericFilterTool config={config} />; }
