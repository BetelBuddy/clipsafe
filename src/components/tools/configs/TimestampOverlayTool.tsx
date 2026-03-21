import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Timestamp Overlay',
  description: 'Burn a running timecode onto the video.',
  params: [
    { id: 'size', label: 'Font Size', type: 'slider', defaultValue: 36, min: 12, max: 80, step: 2 },
    { id: 'position', label: 'Position', type: 'select', defaultValue: 'top-right', options: [
      { label: 'Top Left', value: 'top-left' },
      { label: 'Top Right', value: 'top-right' },
      { label: 'Bottom Left', value: 'bottom-left' },
      { label: 'Bottom Right', value: 'bottom-right' },
    ]},
  ],
  buildArgs: (p, ext) => {
    const posMap: Record<string, string> = {
      'top-left': 'x=10:y=10',
      'top-right': 'x=w-tw-10:y=10',
      'bottom-left': 'x=10:y=h-th-10',
      'bottom-right': 'x=w-tw-10:y=h-th-10',
    };
    const pos = posMap[p.position as string] || posMap['top-right'];
    return {
      args: ['-i', 'input', '-vf', `drawtext=text='%{pts\\:hms}':fontsize=${p.size}:fontcolor=white:${pos}:box=1:boxcolor=black@0.5:boxborderw=4`, '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function TimestampOverlayTool() { return <GenericFilterTool config={config} />; }
