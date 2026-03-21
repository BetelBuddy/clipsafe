import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { MediaBin } from './MediaBin';
import { PreviewPlayer } from './PreviewPlayer';
import { PropertiesPanel } from './PropertiesPanel';
import { Timeline } from './Timeline';
import { ToolBar } from './ToolBar';
import { AiChat } from '@/components/ai/AiChat';
import { CaptionsPanel } from './CaptionsPanel';
import { useAiStore } from '@/stores/aiStore';
import { useLayoutStore } from '@/stores/layoutStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Film, Layers, Sparkles, FolderOpen, Mic } from 'lucide-react';

function DesktopLayout() {
  const { isPanelOpen } = useAiStore();
  const { panelSizes, showMediaBin, showProperties, showCaptions, theaterMode } = useLayoutStore();

  const showRightPanel = showProperties || isPanelOpen || showCaptions;

  if (theaterMode) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <ToolBar />
        <ResizablePanelGroup direction="vertical" className="flex-1">
          <ResizablePanel defaultSize={75} minSize={40}>
            <div className="h-full flex">
              <div className="flex-1">
                <PreviewPlayer />
              </div>
              {(isPanelOpen || showCaptions) && (
                <div className="w-[300px] border-l border-border flex-shrink-0">
                  {showCaptions ? <CaptionsPanel /> : <AiChat />}
                </div>
              )}
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={25} minSize={10} maxSize={50}>
            <Timeline />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <ToolBar />
      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={65} minSize={30}>
          <ResizablePanelGroup direction="horizontal">
            {showMediaBin && (
              <>
                <ResizablePanel defaultSize={panelSizes.mediaBin} minSize={10} maxSize={30}>
                  <MediaBin />
                </ResizablePanel>
                <ResizableHandle withHandle />
              </>
            )}
            <ResizablePanel defaultSize={panelSizes.preview} minSize={30}>
              <PreviewPlayer />
            </ResizablePanel>
            {showRightPanel && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={panelSizes.properties} minSize={15} maxSize={45}>
                  {showCaptions ? <CaptionsPanel /> : isPanelOpen ? <AiChat /> : <PropertiesPanel />}
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={35} minSize={15} maxSize={60}>
          <Timeline />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

function MobileLayout() {
  const { activeMobileTab, setActiveMobileTab } = useLayoutStore();

  return (
    <div className="h-screen flex flex-col bg-background">
      <ToolBar />
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeMobileTab} onValueChange={(v) => setActiveMobileTab(v as typeof activeMobileTab)} className="h-full flex flex-col">
          <div className="flex-1 overflow-hidden">
            <TabsContent value="preview" className="h-full m-0"><PreviewPlayer /></TabsContent>
            <TabsContent value="timeline" className="h-full m-0"><Timeline /></TabsContent>
            <TabsContent value="ai" className="h-full m-0"><AiChat /></TabsContent>
            <TabsContent value="media" className="h-full m-0"><MediaBin /></TabsContent>
            <TabsContent value="captions" className="h-full m-0"><CaptionsPanel /></TabsContent>
          </div>
          <TabsList className="w-full rounded-none h-12 bg-card border-t border-border safe-bottom">
            <TabsTrigger value="preview" className="flex-1 gap-1 text-xs"><Film className="w-4 h-4" /> Preview</TabsTrigger>
            <TabsTrigger value="timeline" className="flex-1 gap-1 text-xs"><Layers className="w-4 h-4" /> Timeline</TabsTrigger>
            <TabsTrigger value="media" className="flex-1 gap-1 text-xs"><FolderOpen className="w-4 h-4" /> Media</TabsTrigger>
            <TabsTrigger value="captions" className="flex-1 gap-1 text-xs"><Mic className="w-4 h-4" /> Captions</TabsTrigger>
            <TabsTrigger value="ai" className="flex-1 gap-1 text-xs"><Sparkles className="w-4 h-4" /> AI</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}

export default function EditorLayout() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}
