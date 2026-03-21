import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Pitch Shift',
  description: 'Change pitch up or down via sample rate manipulation.',
  params: [
    { id: 'semitones', label: 'Semitones', type: 'slider', defaultValue: 0, min: -12, max: 12, step: 1 },
  ],
  buildArgs: (p, ext) => {
    const factor = Math.pow(2, Number(p.semitones) / 12);
    const rate = Math.round(44100 * factor);
    const tempoFix = 1 / factor;
    return {
      args: ['-i', 'input', '-af', `asetrate=${rate},atempo=${tempoFix.toFixed(4)},aresample=44100`, '-c:v', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function PitchShiftTool() { return <GenericFilterTool config={config} />; }
