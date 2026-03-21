import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Equalizer',
  description: '5-band audio equalizer to shape your sound.',
  params: [
    { id: 'b60', label: '60 Hz (Bass)', type: 'slider', defaultValue: 0, min: -20, max: 20, step: 1 },
    { id: 'b230', label: '230 Hz (Low Mid)', type: 'slider', defaultValue: 0, min: -20, max: 20, step: 1 },
    { id: 'b1k', label: '1 kHz (Mid)', type: 'slider', defaultValue: 0, min: -20, max: 20, step: 1 },
    { id: 'b3k', label: '3.5 kHz (High Mid)', type: 'slider', defaultValue: 0, min: -20, max: 20, step: 1 },
    { id: 'b12k', label: '12 kHz (Treble)', type: 'slider', defaultValue: 0, min: -20, max: 20, step: 1 },
  ],
  buildArgs: (p, ext) => {
    const bands = [
      `equalizer=f=60:t=o:w=2:g=${p.b60}`,
      `equalizer=f=230:t=o:w=2:g=${p.b230}`,
      `equalizer=f=1000:t=o:w=2:g=${p.b1k}`,
      `equalizer=f=3500:t=o:w=2:g=${p.b3k}`,
      `equalizer=f=12000:t=o:w=2:g=${p.b12k}`,
    ];
    return {
      args: ['-i', 'input', '-af', bands.join(','), `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function EqualizerTool() { return <GenericFilterTool config={config} />; }
