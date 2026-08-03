import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fileApi } from "../api/fileApi";
import { workspaceApi } from "../api/workspaceApi";
import CreateFileDialog from "../components/CreateFileDialog";
import FileTreeItem from "../components/FileTreeItem";
import FileEditor from "../components/FileEditor";
import LivePreview from "../components/LivePreview";
import RunPanel from "../components/RunPanel";
import { isPreviewLanguage, isExecutable } from "../utils/executableLanguages";
import { Button } from "@/components/ui/button";
import { connectSocket, disconnectSocket, getSocket } from "../socket/socket";
import { useWorkspacePresence } from "../hooks/useWorkspacePresence";
import OnlineUsers from "../components/OnlineUsers";
import { useToast } from "../context/ToastContext";
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
  GripVertical,
} from "lucide-react";

const WorkSpace = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

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
  const activeFileRef = useRef(activeFile);
  const isCreatingRef = useRef(false);

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

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
          fileApi.getById(workspaceId, f._id).then((r) => r.data.file),
        ),
      );
      setFiles(fullFiles);
      toast({
        title: "Workspace Loaded",
        description: `"${wsRes.data.workspace.name}" ready to code`,
        variant: "success"
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to load workspace data",
        variant: "destructive"
      });
      if (err.response?.status === 403 || err.response?.status === 404) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [workspaceId]);

  useEffect(() => {
    activeFileRef.current = activeFile;
  }, [activeFile]);

  const onlineUsers = useWorkspacePresence(workspaceId);

  useEffect(() => {
    connectSocket();
    const socket = getSocket();

    const handleCreated = (payload) => {
      try {
        if (isCreatingRef.current) {
          console.log('Skipping socket event - we created this file');
          return;
        }

        const file = payload && payload.file ? payload.file : payload;
        if (!file || (!file._id && !file.id)) {
          console.warn("Received malformed file creation event:", payload);
          return;
        }

        const safeFile = {
          ...file,
          _id: String(file._id ?? file.id),
          name: typeof file.name === "string" ? file.name : String(file.name ?? ""),
        };

        setFiles((prev) => {
          try {
            const safePrev = (prev || []).filter(Boolean);
            const exists = safePrev.some(
              (f) => String(f?._id) === safeFile._id
            );
            if (exists) {
              return safePrev.map((f) =>
                String(f?._id) === safeFile._id ? safeFile : f,
              );
            }
            const merged = [...safePrev, safeFile];
            return merged.sort((a, b) =>
              String(a.name || "").localeCompare(String(b.name || "")),
            );
          } catch (inner) {
            console.error("Error updating files list on create:", inner, payload);
            return prev;
          }
        });

        toast({
          title: "New File",
          description: `${safeFile.name} was created by someone`,
          variant: "success"
        });
      } catch (err) {
        console.error("workspace:file-created handler error:", err, payload);
      }
    };

    const handleRenamed = (updated) => {
      if (!updated?._id) return;
      
      const oldName = files.find(f => f._id === updated._id)?.name || 'File';
      setFiles((prev) =>
        prev.filter(Boolean).map((f) => (f._id === updated._id ? updated : f)),
      );
      if (activeFileRef.current?._id === updated._id) setActiveFile(updated);
      
      toast({
        title: "File Renamed",
        description: `${oldName} → ${updated.name}`,
        variant: "success"
      });
    };

    const handleDeleted = (fileId) => {
      if (!fileId) return;
      const deletedFile = files.find(f => f._id === fileId);
      setFiles((prev) => prev.filter(Boolean).filter((f) => f._id !== fileId));
      if (activeFileRef.current?._id === fileId) setActiveFile(null);
      
      toast({
        title: "File Deleted",
        description: `${deletedFile?.name || 'File'} was deleted by someone`,
        variant: "destructive"
      });
    };

    socket.on("workspace:file-created", handleCreated);
    socket.on("workspace:file-renamed", handleRenamed);
    socket.on("workspace:file-deleted", handleDeleted);

    return () => {
      socket.off("workspace:file-created", handleCreated);
      socket.off("workspace:file-renamed", handleRenamed);
      socket.off("workspace:file-deleted", handleDeleted);
    };
  }, [workspaceId, files]);

  const handleFileCreated = async (file) => {
    try {
      isCreatingRef.current = true;
      
      setFiles((prev) => {
        const exists = prev.some((f) => f._id === file._id || f.name === file.name);
        if (exists) {
          return prev;
        }
        const merged = [...prev, file];
        return merged.sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || "")),
        );
      });
      
      toast({
        title: "File Created",
        description: `${file.name} created successfully`,
        variant: "success"
      });
      
      setTimeout(() => {
        isCreatingRef.current = false;
      }, 500);
    } catch (err) {
      console.error("handleFileCreated error:", err);
      toast({
        title: "Error",
        description: "Failed to create file",
        variant: "destructive"
      });
      isCreatingRef.current = false;
    }
  };

  const handleFileRenamed = (updated) => {
    const oldName = files.find(f => f._id === updated._id)?.name || 'File';
    setFiles((prev) => prev.map((f) => (f._id === updated._id ? updated : f)));
    if (activeFile?._id === updated._id) setActiveFile(updated);
    
    toast({
      title: "File Renamed",
      description: `${oldName} → ${updated.name}`,
      variant: "success"
    });
  };

  const handleFileDeleted = (fileId) => {
    const deletedFile = files.find(f => f._id === fileId);
    setFiles((prev) => prev.filter((f) => f._id !== fileId));
    if (activeFile?._id === fileId) setActiveFile(null);
    
    toast({
      title: "File Deleted",
      description: `${deletedFile?.name || 'File'} deleted successfully`,
      variant: "destructive"
    });
  };

  const handleContentSynced = useCallback((updatedFile) => {
    setFiles((prev) =>
      prev.map((f) => (f._id === updatedFile._id ? updatedFile : f)),
    );
    setActiveFile((prev) =>
      prev?._id === updatedFile._id ? updatedFile : prev,
    );
    setPreviewRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  const isOwner = workspace?.myRole === "owner";

  const activeMode = !activeFile
    ? null
    : isPreviewLanguage(activeFile.language)
      ? "preview"
      : isExecutable(activeFile.language)
        ? "run"
        : null;

  const togglePreviewFullscreen = () => {
    setIsPreviewFullscreen(!isPreviewFullscreen);
    if (!isPreviewFullscreen) {
      setSidebarCollapsed(true);
      setShowSidePanel(true);
    }
    
    toast({
      title: isPreviewFullscreen ? "Preview Mode" : "Fullscreen Preview",
      description: isPreviewFullscreen ? "Exited fullscreen mode" : "Entered fullscreen preview",
      variant: "success"
    });
  };

  const isBottomLayout = isMobile || isTablet;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#ECEDF0" }}>
        <div className="relative w-14 h-14 rounded-full flex items-center justify-center" style={raisedSm}>
          <div className="w-8 h-8 border-4 border-[#C1652F] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#ECEDF0" }}>
      {/* Paper-grain texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.015) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 h-14 shrink-0 z-10" style={raised}>
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-1.5 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
            style={raisedSm}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#C1652F';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#787B85';
            }}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: '#787B85' }} />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-tight truncate" style={{ color: '#26262B' }}>
              {workspace?.name}
            </h1>
          </div>
          <OnlineUsers users={onlineUsers} />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeMode && (
            <>
              {activeMode === "preview" && (
                <button
                  onClick={togglePreviewFullscreen}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center gap-1.5"
                  style={raisedSm}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#C1652F';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#787B85';
                  }}
                >
                  {isPreviewFullscreen ? (
                    <Minimize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                  {isPreviewFullscreen ? "Exit Full" : "Full Preview"}
                </button>
              )}
              <button
                onClick={() => setShowSidePanel((s) => !s)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center gap-1.5"
                style={raisedSm}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#C1652F';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#787B85';
                }}
              >
                {showSidePanel ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : activeMode === "preview" ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <Terminal className="w-3.5 h-3.5" />
                )}
                {showSidePanel
                  ? "Hide"
                  : activeMode === "preview"
                    ? "Show Preview"
                    : "Show Output"}
              </button>
            </>
          )}
          <Link to={`/workspace/${workspaceId}/members`}>
            <button
              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center gap-1.5"
              style={raisedSm}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#C1652F';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#787B85';
              }}
            >
              <Users className="w-3.5 h-3.5" />
              Members
            </button>
          </Link>
          {isOwner && (
            <Link to={`/workspace/${workspaceId}/invite`}>
              <button
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center gap-1.5"
                style={raisedSm}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#C1652F';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#787B85';
                }}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Invite
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Sidebar */}
        <aside
          className={`shrink-0 flex flex-col transition-all duration-300 ${
            isPreviewFullscreen
              ? "w-0 overflow-hidden border-0"
              : sidebarCollapsed
                ? "w-11"
                : "w-64"
          }`}
          style={{
            ...raised,
            borderRight: '1px solid rgba(163,167,178,0.2)',
            borderRadius: '0',
          }}
        >
          {!isPreviewFullscreen && (
            <>
              <div className="flex items-center justify-between px-2 pt-4 pb-2">
                {!sidebarCollapsed && (
                  <div className="flex items-center gap-2 px-1">
                    <Files className="w-3.5 h-3.5" style={{ color: '#C1652F' }} />
                    <span className="text-xs font-medium uppercase tracking-wide" style={{ color: '#787B85' }}>
                      Files ({files.length})
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setSidebarCollapsed((c) => !c)}
                  className={`p-1.5 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 ${sidebarCollapsed ? "mx-auto" : ""}`}
                  style={raisedSm}
                  title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#C1652F';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#787B85';
                  }}
                >
                  {sidebarCollapsed ? (
                    <PanelLeftOpen className="w-4 h-4" style={{ color: '#787B85' }} />
                  ) : (
                    <PanelLeftClose className="w-4 h-4" style={{ color: '#787B85' }} />
                  )}
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

                  <div className="p-2" style={{ borderTop: '1px solid rgba(163,167,178,0.15)' }}>
                    <CreateFileDialog
                      workspaceId={workspaceId}
                      onCreated={handleFileCreated}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </aside>

        {/* Main Area */}
        {isBottomLayout ? (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 min-h-0 relative">
              {activeFile ? (
                <FileEditor
                  file={activeFile}
                  onContentSynced={handleContentSynced}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center rounded-[20px]" style={pressed}>
                  <div className="text-center">
                    <Code2 className="w-10 h-10 mx-auto mb-3" style={{ color: '#C1652F' }} />
                    <p className="text-sm" style={{ color: '#787B85' }}>
                      Select a file to start editing
                    </p>
                  </div>
                </div>
              )}
            </div>

            {activeFile && showSidePanel && activeMode && (
              <div
                className="border-t flex flex-col"
                style={{
                  borderColor: 'rgba(163,167,178,0.2)',
                  background: '#ECEDF0',
                  height: `${Math.min(terminalHeight, window.innerHeight * 0.6)}px`,
                }}
              >
                <div
                  className="flex items-center justify-between px-3 py-2 cursor-row-resize"
                  style={{
                    ...raisedSm,
                    borderBottom: '1px solid rgba(163,167,178,0.15)',
                  }}
                  onMouseDown={(e) => {
                    const startY = e.clientY;
                    const startHeight = terminalHeight;
                    const onMouseMove = (e) => {
                      const newHeight = startHeight - (e.clientY - startY);
                      setTerminalHeight(
                        Math.max(
                          150,
                          Math.min(newHeight, window.innerHeight * 0.7),
                        ),
                      );
                    };
                    const onMouseUp = () => {
                      document.removeEventListener("mousemove", onMouseMove);
                      document.removeEventListener("mouseup", onMouseUp);
                    };
                    document.addEventListener("mousemove", onMouseMove);
                    document.addEventListener("mouseup", onMouseUp);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3.5 h-3.5" style={{ color: '#C1652F' }} />
                    <span className="text-xs font-medium uppercase tracking-wide" style={{ color: '#787B85' }}>
                      {activeMode === "preview" ? "Preview" : "Terminal Output"}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowSidePanel(false)}
                    className="p-1 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
                    style={raisedSm}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#C1652F';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#787B85';
                    }}
                  >
                    <ChevronRight className="w-3.5 h-3.5" style={{ color: '#787B85' }} />
                  </button>
                </div>
                <div className="flex-1 min-h-0">
                  {activeMode === "preview" ? (
                    <LivePreview
                      files={files}
                      refreshKey={previewRefreshKey}
                      onRefresh={() => setPreviewRefreshKey((k) => k + 1)}
                    />
                  ) : activeMode === "run" ? (
                    <RunPanel workspaceId={workspaceId} file={activeFile} />
                  ) : null}
                </div>
              </div>
            )}
          </div>
        ) : (
          <main className="flex-1 flex min-w-0 relative">
            {activeFile ? (
              <>
                <div
                  className={`min-w-0 transition-all duration-300 ${isPreviewFullscreen ? "w-0 overflow-hidden" : showSidePanel && activeMode ? "w-1/2" : "w-full"}`}
                >
                  <FileEditor
                    file={activeFile}
                    onContentSynced={handleContentSynced}
                  />
                </div>

                {showSidePanel && activeMode && (
                  <div
                    className={`transition-all duration-300 ${isPreviewFullscreen ? "w-full" : activeMode ? "w-1/2" : "w-0"} min-w-0`}
                    style={{
                      borderLeft: '1px solid rgba(163,167,178,0.2)'
                    }}
                  >
                    {activeMode === "preview" ? (
                      <LivePreview
                        files={files}
                        refreshKey={previewRefreshKey}
                        onRefresh={() => setPreviewRefreshKey((k) => k + 1)}
                      />
                    ) : activeMode === "run" ? (
                      <RunPanel workspaceId={workspaceId} file={activeFile} />
                    ) : null}
                  </div>
                )}

                {isMobile && showSidePanel && activeMode && !isPreviewFullscreen && (
                  <button
                    onClick={() => setShowSidePanel(false)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 z-10 rounded-l-lg transition-all duration-300"
                    style={raisedSm}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#C1652F';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#787B85';
                    }}
                  >
                    <ChevronRight className="w-4 h-4" style={{ color: '#787B85' }} />
                  </button>
                )}
                {isMobile && !showSidePanel && activeMode && !isPreviewFullscreen && (
                  <button
                    onClick={() => setShowSidePanel(true)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 z-10 rounded-l-lg transition-all duration-300"
                    style={raisedSm}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#C1652F';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#787B85';
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" style={{ color: '#787B85' }} />
                  </button>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center rounded-[20px]" style={pressed}>
                <div className="text-center">
                  <Code2 className="w-10 h-10 mx-auto mb-3" style={{ color: '#C1652F' }} />
                  <p className="text-sm" style={{ color: '#787B85' }}>
                    Select a file to start editing
                  </p>
                </div>
              </div>
            )}
          </main>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(193,101,47,0.2);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(193,101,47,0.3);
        }
      `}</style>
    </div>
  );
};

export default WorkSpace;