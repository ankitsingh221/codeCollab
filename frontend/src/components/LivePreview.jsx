import { useMemo } from 'react';
import { buildPreviewDoc } from '../utils/buildPreviewDoc';
import { RefreshCw, Eye, Monitor } from 'lucide-react';

const LivePreview = ({ files, refreshKey, onRefresh }) => {
  // Design tokens matching Landing page
  const raised = {
    background: "linear-gradient(160deg, #F7F8FA 0%, #E5E7EB 100%)",
    boxShadow:
      "7px 7px 16px rgba(163,167,178,0.45), -7px -7px 16px rgba(255,255,255,0.85), inset 0 1px 0 rgba(255,255,255,0.6)",
    border: "1px solid rgba(255,255,255,0.5)",
  };

  const raisedSm = {
    background: "linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)",
    boxShadow:
      "4px 4px 10px rgba(163,167,178,0.4), -4px -4px 10px rgba(255,255,255,0.85)",
    border: "1px solid rgba(255,255,255,0.5)",
  };

  const pressed = {
    background: "linear-gradient(160deg, #E3E5E9 0%, #F0F1F4 100%)",
    boxShadow:
      "inset 3px 3px 7px rgba(163,167,178,0.5), inset -3px -3px 7px rgba(255,255,255,0.9)",
  };

  const srcDoc = useMemo(() => buildPreviewDoc(files), [files, refreshKey]);

  return (
    <div className="flex flex-col h-full rounded-[20px] overflow-hidden" style={raised}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-10 shrink-0"
        style={{
          background: 'linear-gradient(160deg, #F7F8FA 0%, #E5E7EB 100%)',
          borderBottom: '1px solid rgba(163,167,178,0.2)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)'
        }}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #ff6b6b, #cc3333)',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.1)'
              }}
            />
            <div className="w-2.5 h-2.5 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #ffd93d, #cc9900)',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.1)'
              }}
            />
            <div className="w-2.5 h-2.5 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #6bcf7f, #2d8f47)',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.1)'
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Monitor className="w-3.5 h-3.5" style={{ color: '#787B85' }} />
            <span className="text-xs font-mono font-medium" style={{ color: '#787B85' }}>
              Live Preview
            </span>
          </div>
        </div>
        
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
          style={raisedSm}
          title="Refresh preview"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#C1652F';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#787B85';
          }}
        >
          <RefreshCw className="w-3.5 h-3.5 transition-transform duration-500 hover:rotate-180" style={{ color: '#787B85' }} />
        </button>
      </div>

      {/* Preview container */}
      <div className="flex-1 min-h-0 relative"
        style={{
          boxShadow: 'inset 0 2px 4px rgba(163,167,178,0.2)',
          background: '#F7F8FA'
        }}
      >
        {/* Preview frame */}
        <div className="absolute inset-2 rounded-xl overflow-hidden"
          style={{
            boxShadow: 'inset 0 1px 2px rgba(163,167,178,0.2), 0 1px 0 rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.5)',
            background: '#ffffff'
          }}
        >
          <iframe
            title="live-preview"
            srcDoc={srcDoc}
            sandbox="allow-scripts allow-modals allow-forms"
            className="w-full h-full"
            style={{
              background: '#ffffff',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }}
          />
        </div>

        {/* Corner decorations - subtle skeuomorphic */}
        <div className="absolute top-3 left-3 w-4 h-4 pointer-events-none opacity-10"
          style={{
            borderTop: '2px solid rgba(163,167,178,0.3)',
            borderLeft: '2px solid rgba(163,167,178,0.3)',
            borderRadius: '2px 0 0 0'
          }}
        />
        <div className="absolute top-3 right-3 w-4 h-4 pointer-events-none opacity-10"
          style={{
            borderTop: '2px solid rgba(163,167,178,0.3)',
            borderRight: '2px solid rgba(163,167,178,0.3)',
            borderRadius: '0 2px 0 0'
          }}
        />
        <div className="absolute bottom-3 left-3 w-4 h-4 pointer-events-none opacity-10"
          style={{
            borderBottom: '2px solid rgba(163,167,178,0.3)',
            borderLeft: '2px solid rgba(163,167,178,0.3)',
            borderRadius: '0 0 0 2px'
          }}
        />
        <div className="absolute bottom-3 right-3 w-4 h-4 pointer-events-none opacity-10"
          style={{
            borderBottom: '2px solid rgba(163,167,178,0.3)',
            borderRight: '2px solid rgba(163,167,178,0.3)',
            borderRadius: '0 0 2px 0'
          }}
        />
      </div>
    </div>
  );
};

export default LivePreview;