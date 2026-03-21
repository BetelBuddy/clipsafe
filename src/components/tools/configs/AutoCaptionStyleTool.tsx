import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Auto Caption Style',
  description: 'Pre-built caption style presets: YouTube, TikTok, News, Minimal.',
  params: [
    { id: 'text', label: 'Caption Text', type: 'text', defaultValue: 'Your Caption', placeholder: 'Enter caption...' },
    { id: 'style', label: 'Style Preset', type: 'select', defaultValue: 'youtube', options: [
      { label: 'YouTube', value: 'youtube' },
      { label: 'TikTok', value: 'tiktok' },
      { label: 'News', value: 'news' },
      { label: 'Minimal', value: 'minimal' },
    ]},
  ],
  buildArgs: (p, ext) => {
    const styles: Record<string, string> = {
      youtube: `drawtext=text='${p.text}':fontsize=48:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h-80`,
      tiktok: `drawtext=text='${p.text}':fontsize=56:fontcolor=white:borderw=4:bordercolor=black:box=1:boxcolor=black@0.3:boxborderw=8:x=(w-text_w)/2:y=(h-text_h)/2`,
      news: `drawbox=x=0:y=h-70:w=iw:h=60:color=0x003366@0.85:t=fill,drawtext=text='${p.text}':fontsize=32:fontcolor=white:x=20:y=h-60`,
      minimal: `drawtext=text='${p.text}':fontsize=36:fontcolor=white@0.9:x=(w-text_w)/2:y=h-60`,
    };
    return {
      args: ['-i', 'input', '-vf', styles[p.style as string] || styles.youtube, '-c:a', 'copy', `output.${ext}`],
      outputFileName: `output.${ext}`,
    };
  },
};

export default function AutoCaptionStyleTool() { return <GenericFilterTool config={config} />; }
