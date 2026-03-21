import GenericFilterTool from '../GenericFilterTool';
import type { FilterToolConfig } from '../GenericFilterTool';

const config: FilterToolConfig = {
  title: 'Thumbnail Grid',
  description: 'Generate a contact sheet with frames extracted at intervals.',
  params: [
    { id: 'cols', label: 'Columns', type: 'slider', defaultValue: 4, min: 2, max: 8, step: 1 },
    { id: 'rows', label: 'Rows', type: 'slider', defaultValue: 4, min: 2, max: 8, step: 1 },
    { id: 'width', label: 'Tile Width', type: 'number', defaultValue: 320, min: 100, placeholder: '320' },
  ],
  buildArgs: (p, _ext) => {
    const total = (p.cols as number) * (p.rows as number);
    return {
      args: ['-i', 'input', '-vf', `select='not(mod(n\\,floor(n/${total})))',scale=${p.width}:-1,tile=${p.cols}x${p.rows}`, '-frames:v', '1', '-q:v', '2', 'output.jpg'],
      outputFileName: 'output.jpg',
    };
  },
};

export default function ThumbnailGridTool() { return <GenericFilterTool config={config} />; }
