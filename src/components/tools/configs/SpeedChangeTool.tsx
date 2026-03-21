import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Speed Change',
  description: 'Change video playback speed from 0.25x to 4x with optional pitch preservation.',
  params: [
    { id: 'speed', label: 'Speed Multiplier', type: 'slider', defaultValue: 1, min: 0.25, max: 4, step: 0.25 },
    { id: 'preservePitch', label: 'Preserve Audio Pitch', type: 'toggle', defaultValue: true },
  ],
  buildArgs: (p, ext) => {
    const speed = p.speed as number;
    const preservePitch = p.preservePitch as boolean;
    const vf = `setpts=${(1 / speed).toFixed(4)}*PTS`;
    const af = preservePitch ? `atempo=${speed <= 0.5 ? `${speed * 2},atempo=0.5` : speed >= 2 ? `${speed / 2},atempo=2` : speed}` : `asetrate=44100*${speed},aresample=44100`;
    return { args: ['-i', 'input.' + ext, '-filter:v', vf, '-filter:a', af, '-y', 'output.' + ext], outputFileName: 'speed_changed.' + ext };
  },
};

export default function SpeedChangeTool() {
  return <GenericFilterTool config={config} />;
}
