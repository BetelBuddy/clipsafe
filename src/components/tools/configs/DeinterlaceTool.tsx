import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Deinterlace',
  description: 'Remove interlacing artifacts from broadcast/DVD footage.',
  params: [
    { id: 'mode', label: 'Mode', type: 'select', defaultValue: '0', options: [
      { label: 'Send Frame', value: '0' },
      { label: 'Send Field', value: '1' },
      { label: 'Send Frame (No Spatial)', value: '2' },
      { label: 'Send Field (No Spatial)', value: '3' },
    ]},
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `yadif=mode=${p.mode}`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function DeinterlaceTool() { return <GenericFilterTool config={config} />; }
