import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Lower Third',
  description: 'Professional name/title banner overlay at the bottom.',
  params: [
    { id: 'name', label: 'Name', type: 'text', defaultValue: 'John Doe', placeholder: 'Name' },
    { id: 'title', label: 'Title', type: 'text', defaultValue: 'CEO & Founder', placeholder: 'Title/Role' },
    { id: 'bgColor', label: 'Background', type: 'select', defaultValue: 'black@0.7', options: [
      { label: 'Dark', value: 'black@0.7' }, { label: 'Blue', value: '0x1a73e8@0.85' },
      { label: 'Red', value: '0xcc0000@0.85' }, { label: 'White', value: 'white@0.85' },
    ]},
  ],
  buildArgs: (p, ext) => {
    const name = String(p.name).replace(/'/g, "\\'");
    const title = String(p.title).replace(/'/g, "\\'");
    const bg = p.bgColor as string;
    return {
      args: ['-i', 'input', '-vf', `drawbox=x=0:y=ih*0.78:w=iw*0.5:h=ih*0.12:color=${bg}:t=fill,drawtext=text='${name}':fontsize=28:fontcolor=white:x=20:y=h*0.80,drawtext=text='${title}':fontsize=20:fontcolor=white@0.8:x=20:y=h*0.80+32`, '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function LowerThirdTool() { return <GenericFilterTool config={config} />; }
