import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Audio Only Export',
  description: 'Extract audio track to a standalone file.',
  params: [
    { id: 'format', label: 'Audio Format', type: 'select', defaultValue: 'mp3', options: [
      { label: 'MP3', value: 'mp3' },
      { label: 'AAC', value: 'aac' },
      { label: 'WAV', value: 'wav' },
      { label: 'FLAC', value: 'flac' },
    ]},
  ],
  buildArgs: (p) => ({
    args: ['-i', 'input', '-vn', '-acodec', p.format === 'mp3' ? 'libmp3lame' : p.format === 'aac' ? 'aac' : p.format === 'flac' ? 'flac' : 'pcm_s16le', `output.${p.format}`],
    outputFileName: `output.${p.format}`,
  }),
};

export default function AudioOnlyExportTool() { return <GenericFilterTool config={config} />; }
