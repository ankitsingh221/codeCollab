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
  Settings,
  Loader2,
  Files,
  Eye,
  EyeOff,
  Code2,
  Terminal,
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

// Connect socket for the lifetime of this page; listen for cross-user file sidebar sync
useEffect(() => {
  connectSocket();
  const socket = getSocket();

  const handleCreated = ({ file }) => {
    setFiles((prev) => {
      if (prev.some((f) => f._id === file._id)) return prev;
      return [...prev, file].sort((a, b) => a.name.localeCompare(b.name));
    });
  };

  const handleRenamed = ({ file }) => {
    setFiles((prev) => prev.map((f) => (f._id === file._id ? { ...f, ...file } : f)));
    setActiveFile((prev) => (prev?._id === file._id ? { ...prev, ...file } : prev));
  };

  const handleDeleted = ({ fileId }) => {
    setFiles((prev) => prev.filter((f) => f._id !== fileId));
    setActiveFile((prev) => (prev?._id === fileId ? null : prev));
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
}, [workspaceId]);

  const handleFileCreated = (file) => {
    setFiles((prev) => [...prev, file].sort((a, b) => a.name.localeCompare(b.name)));
    setActiveFile(file);
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
      <div className="flex items-center justify-between px-4 h-14 border-b border-white/10 bg-white/5 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-white/40 hover:text-white hover:bg-white/10 rounded-lg h-8 w-8"
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidePanel((s) => !s)}
              className="text-white/50 hover:text-white hover:bg-white/10 rounded-lg h-8 text-xs"
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
          )}
          <Link to={`/workspace/${workspaceId}/members`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-white hover:bg-white/10 rounded-lg h-8 text-xs"
            >
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Members
            </Button>
          </Link>
          {isOwner && (
            <Link to={`/workspace/${workspaceId}/settings`}>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/50 hover:text-white hover:bg-white/10 rounded-lg h-8 text-xs"
              >
                <Settings className="w-3.5 h-3.5 mr-1.5" />
                Settings
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 border-r border-white/10 bg-white/[0.02] flex flex-col">
          <div className="flex items-center gap-2 px-3 pt-4 pb-2">
            <Files className="w-3.5 h-3.5 text-white/30" />
            <span className="text-xs font-medium text-white/40 uppercase tracking-wide">
              Files ({files.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-2 space-y-1">
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
        </aside>

        {/* Editor + Preview/Run */}
        <main className="flex-1 flex min-w-0">
          {activeFile ? (
            <div className={`min-w-0 ${showSidePanel && activeMode ? 'w-1/2' : 'w-full'}`}>
              <FileEditor file={activeFile} onContentSynced={handleContentSynced} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-[#0b0b0b]">
              <div className="text-center">
                <Code2 className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm">Select a file to start editing</p>
              </div>
            </div>
          )}

          {showSidePanel && activeMode === 'preview' && activeFile && (
            <div className="w-1/2 min-w-0">
              <LivePreview
                files={files}
                refreshKey={previewRefreshKey}
                onRefresh={() => setPreviewRefreshKey((k) => k + 1)}
              />
            </div>
          )}

          {showSidePanel && activeMode === 'run' && activeFile && (
            <div className="w-1/2 min-w-0">
              <RunPanel workspaceId={workspaceId} file={activeFile} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default WorkSpace;