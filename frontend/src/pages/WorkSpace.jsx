import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fileApi } from '../api/fileApi';
import { workspaceApi } from '../api/workspaceApi';
import CreateFileDialog from '../components/CreateFileDialog';
import FileTreeItem from '../components/FileTreeItem';
import FileEditor from '../components/FileEditor';
import LivePreview from '../components/LivePreview';
import RunPanel from '../components/RunPanel';
import { isPreviewLanguage, isExecutable } from '../utils/executableLanguages';
import { Button } from '@/components/ui/button';
import { connectSocket, disconnectSocket, getSocket } from '../socket/socket';
import { useWorkspacePresence } from '../hooks/useWorkspacePresence';
import OnlineUsers from '../components/OnlineUsers';
import {
  ArrowLeft,
  Users,
  Loader2,
  Files,
  Eye,
  EyeOff,
  Code2,
  Terminal,
  UserPlus,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Play,
  Square,
  GripVertical,
} from 'lucide-react';

const WorkSpace = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1280);
  const [terminalHeight, setTerminalHeight] = useState(300);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024);
      setIsTablet(width < 1280);
      if (width < 1024 && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
      if (width < 768) {
        setShowSidePanel(false);
      } else {
        setShowSidePanel(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarCollapsed]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wsRes, filesRes] = await Promise.all([
        workspaceApi.getWorkspaceById(workspaceId),
        fileApi.getAll(workspaceId),
      ]);
      setWorkspace(wsRes.data.workspace);

      const fullFiles = await Promise.all(
        filesRes.data.files.map((f) =>
          fileApi.getById(workspaceId, f._id).then((r) => r.data.file)
        )
      );
      setFiles(fullFiles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [workspaceId]);

  const onlineUsers = useWorkspacePresence(workspaceId);

  useEffect(() => {
    connectSocket();
    const socket = getSocket();

    const handleCreated = ({ file }) => {
      if (!file || !file._id || !file.name) {
        console.warn('Received malformed file creation event:', file);
        return;
      }

      setFiles((prev) => {
        const safePrev = prev.filter(Boolean);
        const exists = safePrev.some((f) => f?._id === file._id || f?.name === file.name);
        if (exists) {
          return safePrev.map((f) => 
            f._id === file._id || f.name === file.name ? file : f
          );
        }
        return [...safePrev, file].sort((a, b) => a.name.localeCompare(b.name));
      });
    };

    const handleRenamed = (updated) => {
      if (!updated?._id) return;
      setFiles((prev) => prev.filter(Boolean).map((f) => (f._id === updated._id ? updated : f)));
      if (activeFile?._id === updated._id) setActiveFile(updated);
    };

    const handleDeleted = (fileId) => {
      if (!fileId) return;
      setFiles((prev) => prev.filter(Boolean).filter((f) => f._id !== fileId));
      if (activeFile?._id === fileId) setActiveFile(null);
    };

    socket.on('workspace:file-created', handleCreated);
    socket.on('workspace:file-renamed', handleRenamed);
    socket.on('workspace:file-deleted', handleDeleted);

    return () => {
      socket.off('workspace:file-created', handleCreated);
      socket.off('workspace:file-renamed', handleRenamed);
      socket.off('workspace:file-deleted', handleDeleted);
      disconnectSocket();
    };
  }, [workspaceId, activeFile]);

  const handleFileCreated = ({ file }) => {
    setFiles((prev) => {
      const exists = prev.some((f) => f.name === file.name);
      if (exists) return prev;
      return [...prev, file].sort((a, b) => a.name.localeCompare(b.name));
    });
  };

  const handleFileRenamed = (updated) => {
    setFiles((prev) => prev.map((f) => (f._id === updated._id ? updated : f)));
    if (activeFile?._id === updated._id) setActiveFile(updated);
  };

  const handleFileDeleted = (fileId) => {
    setFiles((prev) => prev.filter((f) => f._id !== fileId));
    if (activeFile?._id === fileId) setActiveFile(null);
  };

  const handleContentSynced = useCallback((updatedFile) => {
    setFiles((prev) => prev.map((f) => (f._id === updatedFile._id ? updatedFile : f)));
    setActiveFile((prev) => (prev?._id === updatedFile._id ? updatedFile : prev));
    setPreviewRefreshKey((k) => k + 1);
  }, []);

  const isOwner = workspace?.myRole === 'owner';

  const activeMode = !activeFile
    ? null
    : isPreviewLanguage(activeFile.language)
    ? 'preview'
    : isExecutable(activeFile.language)
    ? 'run'
    : null;

  const togglePreviewFullscreen = () => {
    setIsPreviewFullscreen(!isPreviewFullscreen);
    if (!isPreviewFullscreen) {
      setSidebarCollapsed(true);
      setShowSidePanel(true);
    }
  };

  // Determine layout based on screen size
  const isBottomLayout = isMobile || isTablet;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] text-white overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-white/10 bg-gradient-to-r from-[#0a0a0a] to-[#141414] backdrop-blur-xl shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-white/40 hover:text-white hover:bg-white/10 rounded-lg h-8 w-8 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-white/90 truncate">{workspace?.name}</h1>
          </div>
          <OnlineUsers users={onlineUsers} />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeMode && (
            <>
              {activeMode === 'preview' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePreviewFullscreen}
                  className="text-white/50 hover:text-white hover:bg-white/10 rounded-lg h-8 text-xs transition-all"
                >
                  {isPreviewFullscreen ? (
                    <Minimize2 className="w-3.5 h-3.5 mr-1.5" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  {isPreviewFullscreen ? 'Exit Full' : 'Full Preview'}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidePanel((s) => !s)}
                className="text-white/50 hover:text-white hover:bg-white/10 rounded-lg h-8 text-xs transition-all"
              >
                {showSidePanel ? (
                  <EyeOff className="w-3.5 h-3.5 mr-1.5" />
                ) : activeMode === 'preview' ? (
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                ) : (
                  <Terminal className="w-3.5 h-3.5 mr-1.5" />
                )}
                {showSidePanel ? 'Hide' : activeMode === 'preview' ? 'Show Preview' : 'Show Output'}
              </Button>
            </>
          )}
          <Link to={`/workspace/${workspaceId}/members`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-white hover:bg-white/10 rounded-lg h-8 text-xs transition-all"
            >
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Members
            </Button>
          </Link>
          {isOwner && (
            <Link to={`/workspace/${workspaceId}/invite`}>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/50 hover:text-white hover:bg-white/10 rounded-lg h-8 text-xs transition-all"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                Invite
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside
          className={`shrink-0 border-r border-white/10 bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f] flex flex-col transition-all duration-300 ${
            isPreviewFullscreen ? 'w-0 overflow-hidden border-0' : sidebarCollapsed ? 'w-11' : 'w-64'
          }`}
        >
          {!isPreviewFullscreen && (
            <>
              <div className="flex items-center justify-between px-2 pt-4 pb-2">
                {!sidebarCollapsed && (
                  <div className="flex items-center gap-2 px-1">
                    <Files className="w-3.5 h-3.5 text-white/30" />
                    <span className="text-xs font-medium text-white/40 uppercase tracking-wide">
                      Files ({files.length})
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setSidebarCollapsed((c) => !c)}
                  className={`p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors ${
                    sidebarCollapsed ? 'mx-auto' : ''
                  }`}
                  title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                </button>
              </div>

              {!sidebarCollapsed && (
                <>
                  <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
                    {files.map((file) => (
                      <FileTreeItem
                        key={file._id}
                        file={file}
                        workspaceId={workspaceId}
                        isActive={activeFile?._id === file._id}
                        onSelect={setActiveFile}
                        onRenamed={handleFileRenamed}
                        onDeleted={handleFileDeleted}
                      />
                    ))}
                  </div>

                  <div className="p-2 border-t border-white/5">
                    <CreateFileDialog workspaceId={workspaceId} onCreated={handleFileCreated} />
                  </div>
                </>
              )}
            </>
          )}
        </aside>

        {/* Main Area - changes based on screen size */}
        {isBottomLayout ? (
          // Bottom Layout (Mobile/Tablet)
          <div className="flex-1 flex flex-col min-h-0">
            {/* Editor Area */}
            <div className="flex-1 min-h-0 relative">
              {activeFile ? (
                <FileEditor file={activeFile} onContentSynced={handleContentSynced} />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-[#0b0b0b]">
                  <div className="text-center">
                    <Code2 className="w-10 h-10 text-white/10 mx-auto mb-3" />
                    <p className="text-white/30 text-sm">Select a file to start editing</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Panel - Terminal/Preview */}
            {activeFile && showSidePanel && activeMode && (
              <div 
                className="border-t border-white/10 bg-[#0a0a0a] flex flex-col"
                style={{ height: `${Math.min(terminalHeight, window.innerHeight * 0.6)}px` }}
              >
                <div 
                  className="flex items-center justify-between px-3 py-2 bg-white/5 cursor-row-resize"
                  onMouseDown={(e) => {
                    const startY = e.clientY;
                    const startHeight = terminalHeight;
                    const onMouseMove = (e) => {
                      const newHeight = startHeight - (e.clientY - startY);
                      setTerminalHeight(Math.max(150, Math.min(newHeight, window.innerHeight * 0.7)));
                    };
                    const onMouseUp = () => {
                      document.removeEventListener('mousemove', onMouseMove);
                      document.removeEventListener('mouseup', onMouseUp);
                    };
                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3.5 h-3.5 text-white/30" />
                    <span className="text-xs font-medium text-white/40 uppercase tracking-wide">
                      {activeMode === 'preview' ? 'Preview' : 'Terminal Output'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSidePanel(false)}
                      className="text-white/30 hover:text-white hover:bg-white/10 rounded-lg h-6 w-6 p-0"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  {activeMode === 'preview' ? (
                    <LivePreview
                      files={files}
                      refreshKey={previewRefreshKey}
                      onRefresh={() => setPreviewRefreshKey((k) => k + 1)}
                    />
                  ) : activeMode === 'run' ? (
                    <RunPanel workspaceId={workspaceId} file={activeFile} />
                  ) : null}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Side Layout (Desktop)
          <main className="flex-1 flex min-w-0 relative">
            {activeFile ? (
              <>
                {/* Editor */}
                <div className={`min-w-0 transition-all duration-300 ${isPreviewFullscreen ? 'w-0 overflow-hidden' : (showSidePanel && activeMode ? 'w-1/2' : 'w-full')}`}>
                  <FileEditor file={activeFile} onContentSynced={handleContentSynced} />
                </div>

                {/* Preview/Run Panel */}
                {showSidePanel && activeMode && (
                  <div className={`transition-all duration-300 ${isPreviewFullscreen ? 'w-full' : (activeMode ? 'w-1/2' : 'w-0')} min-w-0`}>
                    {activeMode === 'preview' ? (
                      <LivePreview
                        files={files}
                        refreshKey={previewRefreshKey}
                        onRefresh={() => setPreviewRefreshKey((k) => k + 1)}
                      />
                    ) : activeMode === 'run' ? (
                      <RunPanel workspaceId={workspaceId} file={activeFile} />
                    ) : null}
                  </div>
                )}

                {/* Sliding handle for side panel */}
                {isMobile && showSidePanel && activeMode && !isPreviewFullscreen && (
                  <button
                    onClick={() => setShowSidePanel(false)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-l-lg p-1 z-10 transition-all"
                  >
                    <ChevronRight className="w-4 h-4 text-white/50" />
                  </button>
                )}
                {isMobile && !showSidePanel && activeMode && !isPreviewFullscreen && (
                  <button
                    onClick={() => setShowSidePanel(true)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-l-lg p-1 z-10 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 text-white/50" />
                  </button>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-[#0b0b0b]">
                <div className="text-center">
                  <Code2 className="w-10 h-10 text-white/10 mx-auto mb-3" />
                  <p className="text-white/30 text-sm">Select a file to start editing</p>
                </div>
              </div>
            )}
          </main>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default WorkSpace;