import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { workspaceApi } from '../api/workspaceApi';
import CreateFileDialog from '../components/CreateFileDialog';
import FileTreeItem from '../components/FileTreeItem';
import { Button } from '@/components/ui/button';
import { fileApi } from '../api/fileApi';
import {
  ArrowLeft,
  Users,
  Settings,
  Loader2,
  FileCode2,
  Files,
} from 'lucide-react';

const Workspace = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wsRes, filesRes] = await Promise.all([
        workspaceApi.getById(workspaceId),
        fileApi.getAll(workspaceId),
      ]);
      setWorkspace(wsRes.data.workspace);
      setFiles(filesRes.data.files);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  const isOwner = workspace?.myRole === 'owner';

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
        </div>

        <div className="flex items-center gap-2 shrink-0">
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

        {/* Editor area — placeholder until Phase 5 */}
        <main className="flex-1 flex items-center justify-center bg-[#0b0b0b]">
          {activeFile ? (
            <div className="text-center">
              <FileCode2 className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 text-sm">
                Opened <span className="text-white font-medium">{activeFile.name}</span>
              </p>
              <p className="text-white/25 text-xs mt-1">Monaco Editor integration coming in Phase 5</p>
            </div>
          ) : (
            <div className="text-center">
              <Files className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Select a file to start editing</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Workspace;