import { Suspense } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { TOOLS } from '@/lib/toolRegistry';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export function DynamicToolLoader() {
  const { toolId } = useParams<{ toolId: string }>();

  const tool = TOOLS.find((t) => t.id === toolId);

  if (!tool) {
    // Tool not found, redirect to default
    return <Navigate to="/app/trim" replace />;
  }

  const ToolComponent = tool.component;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ToolComponent />
    </Suspense>
  );
}
