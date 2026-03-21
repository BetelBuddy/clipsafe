import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Ken Burns',
  description: 'Slow zoom and pan effect, classic for photo slideshows.',
  params: [
    { id: 'direction', label: 'Direction', type: 'select', defaultValue: 'zoom-in', options: [
      { label: 'Zoom In', value: 'zoom-in' },
      { label: 'Zoom Out', value: 'zoom-out' },
      { label: 'Pan Left', value: 'pan-left' },
      { label: 'Pan Right', value: 'pan-right' },
    ]},
    { id: 'speed', label: 'Speed', type: 'slider', defaultValue: 3, min: 1, max: 10, step: 1 },
  ],
  buildArgs: (p, ext) => {
    const spd = (p.speed as number) / 1000;
    const dir = p.direction as string;
    let zpFilter = '';
    if (dir === 'zoom-in') zpFilter = `zoompan=z='min(zoom+${spd},1.5)':d=1:s=1920x1080:fps=30`;
    else if (dir === 'zoom-out') zpFilter = `zoompan=z='if(eq(on,1),1.5,max(zoom-${spd},1))':d=1:s=1920x1080:fps=30`;
    else if (dir === 'pan-left') zpFilter = `zoompan=z=1.2:x='iw/2-(iw/zoom/2)+on*${spd * 5}':d=1:s=1920x1080:fps=30`;
    else zpFilter = `zoompan=z=1.2:x='iw/2-(iw/zoom/2)-on*${spd * 5}':d=1:s=1920x1080:fps=30`;
    return {
      args: ['-i', 'input', '-vf', zpFilter, '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function KenBurnsTool() { return <GenericFilterTool config={config} />; }
