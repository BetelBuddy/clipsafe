import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Frame Count',
  description: 'Display total frame count and frame number overlay on video for analysis.',
  params: [
    { id: 'showOverlay', label: 'Burn frame numbers on video', type: 'toggle', defaultValue: true },
    { id: 'fontSize', label: 'Font Size', type: 'slider', defaultValue: 24, min: 12, max: 72, step: 2 },
  ],
  buildArgs: (p, ext) => {
    const showOverlay = p.showOverlay as boolean;
    const fontSize = p.fontSize as number;
    const filter = showOverlay
      ? `drawtext=text='Frame\\: %{frame_num}':start_number=0:x=10:y=10:fontsize=${fontSize}:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=4`
      : 'null';
    return {
      args: ['-i', 'input.' + ext, '-vf', filter, '-y', 'output.' + ext],
      outputFileName: 'frame_count.' + ext,
    };
  },
};

export default function FrameCountTool() {
  return <GenericFilterTool config={config} />;
}
