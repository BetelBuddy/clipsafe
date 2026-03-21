import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Audio Visualizer',
  description: 'Generate a visual waveform or frequency spectrum from audio in your video.',
  params: [
    { id: 'mode', label: 'Visualization Mode', type: 'select', defaultValue: 'line', options: [
      { label: 'Waveform (Line)', value: 'line' },
      { label: 'Waveform (Filled)', value: 'p2p' },
      { label: 'Frequency Bars', value: 'bars' },
    ]},
    { id: 'width', label: 'Width (px)', type: 'number', defaultValue: 1280, min: 320, max: 3840, placeholder: '1280' },
    { id: 'height', label: 'Height (px)', type: 'number', defaultValue: 720, min: 180, max: 2160, placeholder: '720' },
    { id: 'color', label: 'Color', type: 'select', defaultValue: '0xff3b3b', options: [
      { label: 'Red', value: '0xff3b3b' },
      { label: 'Cyan', value: '0x00ffff' },
      { label: 'Green', value: '0x00ff00' },
      { label: 'White', value: '0xffffff' },
      { label: 'Orange', value: '0xff8800' },
    ]},
  ],
  buildArgs: (p, ext) => {
    const mode = p.mode as string;
    const w = p.width as number;
    const h = p.height as number;
    const color = p.color as string;

    if (mode === 'bars') {
      return {
        args: ['-i', 'input.' + ext, '-filter_complex', `showfreqs=s=${w}x${h}:mode=bar:fscale=log:colors=${color}`, '-y', 'output.mp4'],
        outputFileName: 'audio_visualizer.mp4',
      };
    }

    return {
      args: ['-i', 'input.' + ext, '-filter_complex', `showwaves=s=${w}x${h}:mode=${mode}:colors=${color}`, '-y', 'output.mp4'],
      outputFileName: 'audio_visualizer.mp4',
    };
  },
};

export default function AudioVisualizerTool() {
  return <GenericFilterTool config={config} />;
}
