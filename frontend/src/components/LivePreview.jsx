import { useMemo } from 'react';
import { buildPreviewDoc } from '../utils/buildPreviewDoc';
import { RefreshCw } from 'lucide-react';

const LivePreview = ({ files, refreshKey, onRefresh }) => {
  const srcDoc = useMemo(() => buildPreviewDoc(files), [files, refreshKey]);

  return (
    <div className="flex flex-col h-full border-l border-white/10">
      <div className="flex items-center justify-between px-4 h-9 border-b border-white/5 bg-white/[0.02] shrink-0">
        <span className="text-xs text-white/40">Live Preview</span>
        <button
          onClick={onRefresh}
          className="text-white/30 hover:text-white/70 transition-colors"
          title="Refresh preview"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
      <iframe
        title="live-preview"
        srcDoc={srcDoc}
        sandbox="allow-scripts allow-modals allow-forms"
        className="flex-1 w-full bg-white"
      />
    </div>
  );
};

export default LivePreview;