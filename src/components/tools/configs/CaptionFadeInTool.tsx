import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Caption Fade In',
  description: 'Captions that fade in word by word with alpha animation.',
  params: [
    { id: 'text', label: 'Caption Text', type: 'text', defaultValue: 'Hello World', placeholder: 'Enter caption...' },
    { id: 'size', label: 'Font Size', type: 'slider', defaultValue: 48, min: 16, max: 120, step: 2 },
    { id: 'fadeDur', label: 'Fade Duration (s)', type: 'slider', defaultValue: 1, min: 0.2, max: 5, step: 0.1 },
    { id: 'startTime', label: 'Start Time (s)', type: 'number', defaultValue: 0, min: 0, placeholder: '0' },
    { id: 'color', label: 'Color', type: 'select', defaultValue: 'white', options: [
      { label: 'White', value: 'white' }, { label: 'Yellow', value: 'yellow' },
      { label: 'Cyan', value: 'cyan' }, { label: 'Red', value: 'red' },
    ]},
  ],
  buildArgs: (p, ext) => ({
    args: ['-i', 'input', '-vf', `drawtext=text='${p.text}':fontsize=${p.size}:fontcolor=${p.color}:x=(w-text_w)/2:y=h-80:alpha='if(lt(t\\,${p.startTime})\\,0\\,if(lt(t\\,${p.startTime}+${p.fadeDur})\\,(t-${p.startTime})/${p.fadeDur}\\,1))'`, '-c:a', 'copy', `output.${ext}`],
    outputFileName: `output.${ext}`,
  }),
};

export default function CaptionFadeInTool() { return <GenericFilterTool config={config} />; }
