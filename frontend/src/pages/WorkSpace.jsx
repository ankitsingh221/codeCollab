import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fileApi } from "../api/fileApi";
import { workspaceApi } from "../api/workspaceApi";
import CreateFileDialog from "../components/CreateFileDialog";
import FileTreeItem from "../components/FileTreeItem";
import FileEditor from "../components/FileEditor";
import LivePreview from "../components/LivePreview";
import RunPanel from "../components/RunPanel";
import CommandPalette from "../components/CommandPalette";
import { isPreviewLanguage, isExecutable } from "../utils/executableLanguages";
import { connectSocket, disconnectSocket, getSocket, setActiveWorkspace, clearActiveWorkspace } from "../socket/socket";
import { useWorkspacePresence } from "../hooks/useWorkspacePresence";
import OnlineUsers from "../components/OnlineUsers";
import { useToast } from "../context/ToastContext";
import {
  ArrowLeft,
  Users,
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
  ChevronRight,
  GripVertical,
  Search,
  X,
  Menu,
  FilePlus2,
  LayoutDashboard,
  Command,
} from "lucide-react";

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

const sortByName = (list) =>
  [...list].sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));

const WorkSpace = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [workspace, setWorkspace] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSidePanel, setShowSidePanel] = useState(() => window.innerWidth >= 768);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  const [isTablet, setIsTablet] = useState(() => window.innerWidth < 1280);
  const [terminalHeight, setTerminalHeight] = useState(300);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [fileFilter, setFileFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const filesRef = useRef(files);
  const activeFileRef = useRef(activeFile);
  const isCreatingRef = useRef(false);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    activeFileRef.current = activeFile;
  }, [activeFile]);

  // Debounced viewport tracking
  useEffect(() => {
    let t;
    const handleResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const width = window.innerWidth;
        setIsMobile(width < 1024);
        setIsTablet(width < 1280);
        setShowSidePanel(width >= 768);
      }, 120);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(t);
    };
  }, []);

  // Single round-trip: workspace + all files WITH content (no N+1)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [wsRes, filesRes] = await Promise.all([
        workspaceApi.getWorkspaceById(workspaceId),
        fileApi.getAll(workspaceId, { includeContent: true }),
      ]);
      setWorkspace(wsRes.data.workspace);
      setFiles(sortByName(filesRes.data.files || []));
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Failed to load workspace data",
        variant: "destructive",
      });
      if (err.response?.status === 403 || err.response?.status === 404) {
        navigate("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  }, [workspaceId, toast, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Browser tab title
  useEffect(() => {
    document.title = workspace
      ? `${workspace.name} · CodeCollab`
      : "CodeCollab";
    return () => {
      document.title = "CodeCollab";
    };
  }, [workspace]);

  const onlineUsers = useWorkspacePresence(workspaceId);

  // Socket listeners — registered once per workspace; functional updates only
  useEffect(() => {
    connectSocket();
    setActiveWorkspace(workspaceId);
    const socket = getSocket();

    socket.emit("workspace:join", { workspaceId });

    const handleCreated = (payload) => {
      if (isCreatingRef.current) return;

      const file = payload && payload.file ? payload.file : payload;
      if (!file || (!file._id && !file.id)) return;

      const safeFile = {
        ...file,
        _id: String(file._id ?? file.id),
        name: typeof file.name === "string" ? file.name : String(file.name ?? ""),
      };

      setFiles((prev) => {
        const exists = prev.some((f) => String(f?._id) === safeFile._id);
        if (exists) {
          return prev.map((f) =>
            String(f?._id) === safeFile._id ? safeFile : f,
          );
        }
        return sortByName([...prev, safeFile]);
      });

      toast({
        title: "New File",
        description: `${safeFile.name} was created`,
        variant: "success",
      });
    };

    const handleRenamed = (updated) => {
      if (!updated?._id) return;
      const oldName =
        filesRef.current.find((f) => f._id === updated._id)?.name || "File";

      setFiles((prev) =>
        prev.map((f) => (f._id === updated._id ? updated : f)),
      );
      if (activeFileRef.current?._id === updated._id)
        setActiveFile((prev) => (prev?._id === updated._id ? updated : prev));

      toast({
        title: "File Renamed",
        description: `${oldName} → ${updated.name}`,
        variant: "success",
      });
    };

    const handleDeleted = (payload) => {
      const fileId = typeof payload === "string" ? payload : payload?.fileId;
      if (!fileId) return;
      const deletedFile = filesRef.current.find((f) => f._id === fileId);

      setFiles((prev) => prev.filter((f) => f._id !== fileId));
      if (activeFileRef.current?._id === fileId) setActiveFile(null);

      toast({
        title: "File Deleted",
        description: `${deletedFile?.name || "File"} was deleted`,
        variant: "destructive",
      });
    };

    socket.on("workspace:file-created", handleCreated);
    socket.on("workspace:file-renamed", handleRenamed);
    socket.on("workspace:file-deleted", handleDeleted);

    return () => {
      clearActiveWorkspace();
      socket.off("workspace:file-created", handleCreated);
      socket.off("workspace:file-renamed", handleRenamed);
      socket.off("workspace:file-deleted", handleDeleted);
      disconnectSocket();
    };
  }, [workspaceId, toast]);

  const openFile = useCallback(
    (file) => {
      setActiveFile(file);
      setDrawerOpen(false);
    },
    [],
  );

  const handleFileCreated = useCallback(
    (file) => {
      isCreatingRef.current = true;
      setFiles((prev) => {
        const exists = prev.some(
          (f) => f._id === file._id || f.name === file.name,
        );
        return exists ? prev : sortByName([...prev, file]);
      });
      toast({
        title: "File Created",
        description: `${file.name} created successfully`,
        variant: "success",
      });
      setTimeout(() => {
        isCreatingRef.current = false;
      }, 500);
    },
    [toast],
  );

  const handleFileRenamed = useCallback((updated) => {
    setFiles((prev) =>
      prev.map((f) => (f._id === updated._id ? updated : f)),
    );
    setActiveFile((prev) =>
      prev?._id === updated._id ? updated : prev,
    );
  }, []);

  const handleFileDeleted = useCallback((fileId) => {
    setFiles((prev) => prev.filter((f) => f._id !== fileId));
    setActiveFile((prev) => (prev?._id === fileId ? null : prev));
  }, []);

  const handleContentSynced = useCallback((updatedFile) => {
    setFiles((prev) =>
      prev.map((f) =>
        f._id === updatedFile._id ? { ...f, content: updatedFile.content } : f,
      ),
    );
    setActiveFile((prev) =>
      prev?._id === updatedFile._id
        ? { ...prev, content: updatedFile.content }
        : prev,
    );
    setPreviewRefreshKey((k) => k + 1);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      } else if (mod && e.key.toLowerCase() === "b") {
        e.preventDefault();
        if (window.innerWidth < 1024) setDrawerOpen((o) => !o);
        else setSidebarCollapsed((c) => !c);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
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
  };

  const visibleFiles = useMemo(() => {
    const q = fileFilter.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => f.name.toLowerCase().includes(q));
  }, [files, fileFilter]);

  const paletteItems = useMemo(() => {
    const items = [
      {
        id: "act-new-file",
        group: "Actions",
        label: "New file",
        icon: FilePlus2,
        keywords: ["create", "add"],
        run: () => {
          setSidebarCollapsed(false);
          if (window.innerWidth < 1024) setDrawerOpen(true);
          setCreateOpen(true);
        },
      },
      {
        id: "act-toggle-panel",
        group: "Actions",
        label: activeMode
          ? showSidePanel
            ? `Hide ${activeMode === "preview" ? "preview" : "output"}`
            : `Show ${activeMode === "preview" ? "preview" : "output"}`
          : "Toggle preview / output panel",
        icon: showSidePanel ? EyeOff : Eye,
        keywords: ["terminal", "preview", "output", "panel"],
        run: () => setShowSidePanel((s) => !s),
      },
      {
        id: "act-members",
        group: "Actions",
        label: "View members",
        icon: Users,
        keywords: ["team", "people"],
        run: () => navigate(`/workspace/${workspaceId}/members`),
      },
      {
        id: "act-dashboard",
        group: "Actions",
        label: "Back to dashboard",
        icon: LayoutDashboard,
        keywords: ["home", "leave", "workspaces"],
        run: () => navigate("/dashboard"),
      },
    ];

    if (activeMode === "preview") {
      items.push({
        id: "act-fullscreen-preview",
        group: "Actions",
        label: isPreviewFullscreen
          ? "Exit fullscreen preview"
          : "Fullscreen preview",
        icon: isPreviewFullscreen ? Minimize2 : Maximize2,
        keywords: ["expand", "focus"],
        run: togglePreviewFullscreen,
      });
    }

    if (isOwner) {
      items.push({
        id: "act-invite",
        group: "Actions",
        label: "Invite people",
        icon: UserPlus,
        keywords: ["add member", "share", "email"],
        run: () => navigate(`/workspace/${workspaceId}/invite`),
      });
    }

    const fileItems = files.map((f) => ({
      id: `file-${f._id}`,
      group: "Files",
      label: f.name,
      hint: f.language,
      icon: Code2,
      keywords: [f.language],
      run: () => openFile(f),
    }));

    return [...items, ...fileItems];
  }, [
    files,
    showSidePanel,
    activeMode,
    isPreviewFullscreen,
    isOwner,
    workspaceId,
    navigate,
    openFile,
    togglePreviewFullscreen,
  ]);

  const sidebarContent = (
    <>
      {!sidebarCollapsed && (
        <div className="px-2 pb-1">
          <div className="relative">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
              style={{ color: "#9CA0AA" }}
            />
            <input
              value={fileFilter}
              onChange={(e) => setFileFilter(e.target.value)}
              placeholder="Filter files..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg outline-none transition-all duration-300"
              style={{
                ...pressed,
                color: "#2B2B2F",
                border: "1px solid rgba(255,255,255,0.5)",
              }}
            />
            {fileFilter && (
              <button
                onClick={() => setFileFilter("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:opacity-70"
                style={{ color: "#787B85" }}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
        {visibleFiles.length === 0 ? (
          <p
            className="text-xs text-center py-6"
            style={{ color: "#9CA0AA" }}
          >
            {fileFilter ? "No matching files" : "No files yet"}
          </p>
        ) : (
          visibleFiles.map((file) => (
            <FileTreeItem
              key={file._id}
              file={file}
              workspaceId={workspaceId}
              isActive={activeFile?._id === file._id}
              onSelect={(f) => {
                openFile(f);
                setDrawerOpen(false);
              }}
              onRenamed={handleFileRenamed}
              onDeleted={handleFileDeleted}
            />
          ))
        )}
      </div>

      <div
        className="p-2"
        style={{ borderTop: "1px solid rgba(163,167,178,0.15)" }}
      >
        <CreateFileDialog
          workspaceId={workspaceId}
          onCreated={handleFileCreated}
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      </div>
    </>
  );

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#ECEDF0" }}
      >
        <div
          className="relative w-14 h-14 rounded-full flex items-center justify-center"
          style={raisedSm}
        >
          <div className="w-8 h-8 border-4 border-[#C1652F] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const isBottomLayout = isMobile || isTablet;

  return (
    <div
      className="h-screen flex flex-col overflow-hidden relative"
      style={{ background: "#ECEDF0" }}
    >
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
      <div
        className="flex items-center justify-between px-3 sm:px-4 h-14 shrink-0 z-20 gap-2"
        style={raised}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setDrawerOpen((o) => !o)}
            className="lg:hidden p-1.5 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 shrink-0"
            style={raisedSm}
            title="Toggle files (Ctrl+B)"
            onMouseEnter={(e) => (e.currentTarget.style.color = "#C1652F")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#787B85")}
          >
            <Menu className="w-4 h-4" style={{ color: "#787B85" }} />
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="hidden lg:block p-1.5 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 shrink-0"
            style={raisedSm}
            title="Back to dashboard"
            onMouseEnter={(e) => (e.currentTarget.style.color = "#C1652F")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#787B85")}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: "#787B85" }} />
          </button>
          <div className="min-w-0">
            <h1
              className="text-sm font-bold tracking-tight truncate max-w-[120px] sm:max-w-[200px]"
              style={{ color: "#26262B" }}
            >
              {workspace?.name}
            </h1>
          </div>
          <OnlineUsers users={onlineUsers} />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Command palette trigger */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-95"
            style={{ ...raisedSm, color: "#787B85" }}
            title="Command palette (Ctrl+K)"
            onMouseEnter={(e) => (e.currentTarget.style.color = "#C1652F")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#787B85")}
          >
            <Command className="w-3.5 h-3.5" />
            <span>Search</span>
            <kbd
              className="text-[9px] font-semibold px-1 py-0.5 rounded"
              style={{ ...pressed, color: "#9CA0AA" }}
            >
              Ctrl K
            </kbd>
          </button>

          {activeMode === "preview" && (
            <button
              onClick={togglePreviewFullscreen}
              className="hidden sm:flex px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 items-center gap-1.5"
              style={{ ...raisedSm, color: "#787B85" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#C1652F")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#787B85")}
            >
              {isPreviewFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
              {isPreviewFullscreen ? "Exit Full" : "Full Preview"}
            </button>
          )}
          {activeMode && (
            <button
              onClick={() => setShowSidePanel((s) => !s)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center gap-1.5"
              style={{ ...raisedSm, color: "#787B85" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#C1652F")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#787B85")}
            >
              {showSidePanel ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : activeMode === "preview" ? (
                <Eye className="w-3.5 h-3.5" />
              ) : (
                <Terminal className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {showSidePanel
                  ? "Hide"
                  : activeMode === "preview"
                    ? "Show Preview"
                    : "Show Output"}
              </span>
            </button>
          )}
          <Link to={`/workspace/${workspaceId}/members`}>
            <button
              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center gap-1.5"
              style={{ ...raisedSm, color: "#787B85" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#C1652F")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#787B85")}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Members</span>
            </button>
          </Link>
          {isOwner && (
            <Link to={`/workspace/${workspaceId}/invite`}>
              <button
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center gap-1.5"
                style={{
                  background: "linear-gradient(160deg, #D07B47, #B0552A)",
                  boxShadow:
                    "4px 4px 10px rgba(163,167,178,0.4), -2px -2px 6px rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
                  borderRadius: "10px",
                  color: "#FBF6F1",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Invite</span>
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Desktop Sidebar */}
        <aside
          className={`shrink-0 hidden lg:flex flex-col transition-all duration-300 ${
            isPreviewFullscreen
              ? "lg:w-0 overflow-hidden border-0"
              : sidebarCollapsed
                ? "lg:w-11"
                : "lg:w-64"
          }`}
          style={{
            ...raised,
            borderRight: "1px solid rgba(163,167,178,0.2)",
            borderRadius: "0",
          }}
        >
          {!isPreviewFullscreen && (
            <>
              <div className="flex items-center justify-between px-2 pt-4 pb-2">
                {!sidebarCollapsed && (
                  <div className="flex items-center gap-2 px-1">
                    <Files
                      className="w-3.5 h-3.5"
                      style={{ color: "#C1652F" }}
                    />
                    <span
                      className="text-xs font-medium uppercase tracking-wide"
                      style={{ color: "#787B85" }}
                    >
                      Files ({files.length})
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setSidebarCollapsed((c) => !c)}
                  className={`p-1.5 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 ${sidebarCollapsed ? "mx-auto" : ""}`}
                  style={raisedSm}
                  title={
                    sidebarCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"
                  }
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#C1652F")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#787B85")
                  }
                >
                  {sidebarCollapsed ? (
                    <PanelLeftOpen
                      className="w-4 h-4"
                      style={{ color: "#787B85" }}
                    />
                  ) : (
                    <PanelLeftClose
                      className="w-4 h-4"
                      style={{ color: "#787B85" }}
                    />
                  )}
                </button>
              </div>

              {!sidebarCollapsed && sidebarContent}
            </>
          )}
        </aside>

        {/* Mobile Drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/25 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <aside
              className="absolute left-0 top-0 bottom-0 w-72 max-w-[80vw] flex flex-col animate-in fade-in slide-in-from-left duration-200"
              style={{
                ...raised,
                borderRadius: "0",
                borderRight: "1px solid rgba(163,167,178,0.2)",
              }}
            >
              <div className="flex items-center justify-between px-3 pt-4 pb-2">
                <div className="flex items-center gap-2 px-1">
                  <Files className="w-3.5 h-3.5" style={{ color: "#C1652F" }} />
                  <span
                    className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: "#787B85" }}
                  >
                    Files ({files.length})
                  </span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg transition-all duration-300"
                  style={raisedSm}
                >
                  <X className="w-4 h-4" style={{ color: "#787B85" }} />
                </button>
              </div>
              {sidebarContent}
            </aside>
          </div>
        )}

        {/* Editor + Panel */}
        {isBottomLayout ? (
          <div className="flex-1 flex flex-col min-h-0 min-w-0">
            <div className="flex-1 min-h-0 relative">
              {activeFile ? (
                <FileEditor
                  file={activeFile}
                  workspaceId={workspaceId}
                  onContentSynced={handleContentSynced}
                />
              ) : (
                <EmptyState />
              )}
            </div>

            {activeFile && showSidePanel && activeMode && (
              <BottomResizablePanel
                terminalHeight={terminalHeight}
                setTerminalHeight={setTerminalHeight}
                activeMode={activeMode}
                onClose={() => setShowSidePanel(false)}
                workspaceId={workspaceId}
                files={files}
                activeFile={activeFile}
                previewRefreshKey={previewRefreshKey}
                onRefresh={() => setPreviewRefreshKey((k) => k + 1)}
              />
            )}
          </div>
        ) : (
          <main className="flex-1 flex min-w-0 relative">
            {activeFile ? (
              <>
                <div
                  className={`min-w-0 transition-all duration-300 ${
                    isPreviewFullscreen
                      ? "w-0 overflow-hidden"
                      : showSidePanel && activeMode
                        ? "w-1/2"
                        : "w-full"
                  }`}
                >
                  <FileEditor
                    file={activeFile}
                    workspaceId={workspaceId}
                    onContentSynced={handleContentSynced}
                  />
                </div>

                {showSidePanel && activeMode && (
                  <div
                    className={`transition-all duration-300 ${
                      isPreviewFullscreen ? "w-full" : "w-1/2"
                    } min-w-0`}
                    style={{
                      borderLeft: "1px solid rgba(163,167,178,0.2)",
                    }}
                  >
                    {activeMode === "preview" ? (
                      <LivePreview
                        files={files}
                        refreshKey={previewRefreshKey}
                        onRefresh={() => setPreviewRefreshKey((k) => k + 1)}
                      />
                    ) : (
                      <RunPanel workspaceId={workspaceId} file={activeFile} />
                    )}
                  </div>
                )}
              </>
            ) : (
              <EmptyState />
            )}
          </main>
        )}
      </div>

      {paletteOpen && (
        <CommandPalette
          onClose={() => setPaletteOpen(false)}
          items={paletteItems}
        />
      )}

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

const EmptyState = () => (
  <div
    className="flex-1 flex items-center justify-center rounded-[20px] m-3"
    style={pressed}
  >
    <div className="text-center px-6">
      <div
        className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
        style={raisedSm}
      >
        <Code2 className="w-8 h-8" style={{ color: "#C1652F" }} />
      </div>
      <p className="text-sm font-medium mb-1" style={{ color: "#4A4C53" }}>
        No file selected
      </p>
      <p className="text-xs mb-4" style={{ color: "#9CA0AA" }}>
        Pick a file from the sidebar or press{" "}
        <kbd
          className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
          style={{ ...raisedSm, color: "#787B85" }}
        >
          Ctrl K
        </kbd>{" "}
        to search
      </p>
    </div>
  </div>
);

// Shared bottom panel for tablet/mobile layouts with drag-to-resize header
const BottomResizablePanel = ({
  terminalHeight,
  setTerminalHeight,
  activeMode,
  onClose,
  workspaceId,
  files,
  activeFile,
  previewRefreshKey,
  onRefresh,
}) => (
  <div
    className="border-t flex flex-col"
    style={{
      borderColor: "rgba(163,167,178,0.2)",
      background: "#ECEDF0",
      height: `${Math.min(terminalHeight, Math.round(window.innerHeight * 0.6))}px`,
    }}
  >
    <div
      className="flex items-center justify-between px-3 py-2 cursor-row-resize touch-none"
      style={{
        ...raisedSm,
        borderBottom: "1px solid rgba(163,167,178,0.15)",
      }}
      onMouseDown={(e) => {
        const startY = e.clientY;
        const startHeight = terminalHeight;
        const onMouseMove = (ev) => {
          const newHeight = startHeight - (ev.clientY - startY);
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
        <GripVertical
          className="w-3.5 h-3.5"
          style={{ color: "#C1652F" }}
        />
        <span
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: "#787B85" }}
        >
          {activeMode === "preview" ? "Preview" : "Terminal Output"}
        </span>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
        style={raisedSm}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#C1652F")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#787B85")}
      >
        <ChevronRight className="w-3.5 h-3.5" style={{ color: "#787B85" }} />
      </button>
    </div>
    <div className="flex-1 min-h-0">
      {activeMode === "preview" ? (
        <LivePreview
          files={files}
          refreshKey={previewRefreshKey}
          onRefresh={onRefresh}
        />
      ) : (
        <RunPanel workspaceId={workspaceId} file={activeFile} />
      )}
    </div>
  </div>
);

export default WorkSpace;
