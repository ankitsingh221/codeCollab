import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Editor from "@monaco-editor/react";
import { useYjsFile } from "../hooks/useYjsFile";
import { useAuth } from "../context/AuthContext";
import { fileApi } from "../api/fileApi";
import { useToast } from "../context/ToastContext";
import {
  Loader2,
  Check,
  Users as UsersIcon,
  Minus,
  Plus,
  WrapText,
  PanelRight,
  Copy,
  Download,
  CloudUpload,
  PenLine,
} from "lucide-react";

const pressedStyle = {
  background: "linear-gradient(160deg, #E3E5E9 0%, #F0F1F4 100%)",
  boxShadow:
    "inset 3px 3px 7px rgba(163,167,178,0.5), inset -3px -3px 7px rgba(255,255,255,0.9)",
};

const raisedSm = {
  background: "linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)",
  boxShadow:
    "4px 4px 10px rgba(163,167,178,0.4), -4px -4px 10px rgba(255,255,255,0.85)",
  border: "1px solid rgba(255,255,255,0.5)",
};

const PREFS_KEY = "cc-editor-prefs";

const loadPrefs = () => {
  try {
    return {
      fontSize: 14,
      wordWrap: true,
      minimap: false,
      ...JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"),
    };
  } catch {
    return { fontSize: 14, wordWrap: true, minimap: false };
  }
};

const FileEditor = ({ file, workspaceId, onContentSynced }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editorInstance, setEditorInstance] = useState(null);
  const [prefs, setPrefs] = useState(loadPrefs);
  const [copied, setCopied] = useState(false);
  const [saveState, setSaveState] = useState("synced"); // synced | saving | saved
  const lastEmittedRef = useRef(file.content);
  const saveTimerRef = useRef(null);

  const { connected, presentUsers, typingUsers } = useYjsFile({
    file,
    user,
    editorInstance,
  });

  // Same person can be present via multiple tabs — dedupe for display
  const typingNames = useMemo(
    () => [...new Set(typingUsers)],
    [typingUsers],
  );

  // Persist editor preferences
  const updatePrefs = useCallback((patch) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Push content changes up to the workspace state (debounced)
  useEffect(() => {
    if (!editorInstance) return;
    const model = editorInstance.getModel();
    if (!model) return;

    let timeout;
    const disposable = model.onDidChangeContent(() => {
      setSaveState("synced"); // Yjs keeps it live-synced as they type
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const value = model.getValue();
        if (value !== lastEmittedRef.current) {
          lastEmittedRef.current = value;
          onContentSynced?.({ ...file, content: value });
        }
      }, 500);
    });

    return () => {
      clearTimeout(timeout);
      disposable.dispose();
    };
  }, [editorInstance, file, onContentSynced]);

  // Force-save to the database (server also auto-saves every ~2s of activity)
  const forceSave = useCallback(async () => {
    if (!editorInstance || !workspaceId) return;
    const model = editorInstance.getModel();
    if (!model) return;
    const content = model.getValue();

    setSaveState("saving");
    clearTimeout(saveTimerRef.current);
    try {
      await fileApi.update(workspaceId, file._id, { content });
      lastEmittedRef.current = content;
      setSaveState("saved");
      saveTimerRef.current = setTimeout(() => setSaveState("synced"), 2000);
    } catch (err) {
      setSaveState("synced");
      toast({
        title: "Save failed",
        description: err.response?.data?.message || "Could not save the file",
        variant: "destructive",
      });
    }
  }, [editorInstance, workspaceId, file._id, toast]);

  // Ctrl/Cmd+S anywhere on the page saves the active file
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        forceSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [forceSave]);

  const handleCopy = async () => {
    if (!editorInstance) return;
    try {
      await navigator.clipboard.writeText(editorInstance.getValue());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({
        title: "Copy failed",
        description: "Clipboard access was blocked",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!editorInstance) return;
    const blob = new Blob([editorInstance.getValue()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full rounded-[20px] overflow-hidden" style={raisedSm}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 h-10 shrink-0 gap-2"
        style={{
          background: "linear-gradient(160deg, #F7F8FA 0%, #E5E7EB 100%)",
          borderBottom: "1px solid rgba(163,167,178,0.2)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="hidden sm:flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: "radial-gradient(circle at 30% 30%, #ff6b6b, #cc3333)",
                boxShadow:
                  "inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.1)",
              }}
            />
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: "radial-gradient(circle at 30% 30%, #ffd93d, #cc9900)",
                boxShadow:
                  "inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.1)",
              }}
            />
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: "radial-gradient(circle at 30% 30%, #6bcf7f, #2d8f47)",
                boxShadow:
                  "inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.1)",
              }}
            />
          </div>
          <span
            className="text-xs font-mono font-medium truncate"
            style={{ color: "#787B85" }}
          >
            {file.name}
          </span>

          {/* Typing indicator */}
          {typingNames.length > 0 && (
            <span
              className="hidden md:flex items-center gap-1 text-[10px] font-medium max-w-[160px]"
              style={{ color: "#C1652F" }}
            >
              <PenLine className="w-3 h-3 animate-pulse shrink-0" />
              <span className="truncate">
                {typingNames.length === 1
                  ? `${typingNames[0]} is typing`
                  : `${typingNames.length} people typing`}
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Presence avatars */}
          {presentUsers.length > 0 && (
            <div
              className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg"
              style={pressedStyle}
            >
              <UsersIcon className="w-3 h-3" style={{ color: "#787B85" }} />
              <div className="flex -space-x-1.5">
                {presentUsers.slice(0, 4).map((u, i) => (
                  <div
                    key={i}
                    title={u.name}
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold transition-all duration-300 hover:scale-110 hover:z-10"
                    style={{
                      backgroundColor: u.color || "#C1652F",
                      borderColor: "#F7F8FA",
                      color: "#FBF6F1",
                      boxShadow:
                        "inset 0 1px 2px rgba(255,255,255,0.2), 0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                ))}
                {presentUsers.length > 4 && (
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[8px] font-medium"
                    style={{
                      background:
                        "linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)",
                      borderColor: "#F7F8FA",
                      color: "#787B85",
                    }}
                  >
                    +{presentUsers.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Toolbar actions */}
          <ToolButton title="Decrease font size" onClick={() => updatePrefs({ fontSize: Math.max(11, prefs.fontSize - 1) })}>
            <Minus className="w-3 h-3" />
          </ToolButton>
          <span
            className="text-[10px] font-mono font-bold w-5 text-center select-none"
            style={{ color: "#787B85" }}
          >
            {prefs.fontSize}
          </span>
          <ToolButton title="Increase font size" onClick={() => updatePrefs({ fontSize: Math.min(24, prefs.fontSize + 1) })}>
            <Plus className="w-3 h-3" />
          </ToolButton>
          <ToolButton
            title={prefs.wordWrap ? "Disable word wrap" : "Enable word wrap"}
            active={prefs.wordWrap}
            onClick={() => updatePrefs({ wordWrap: !prefs.wordWrap })}
          >
            <WrapText className="w-3 h-3" />
          </ToolButton>
          <ToolButton
            title={prefs.minimap ? "Hide minimap" : "Show minimap"}
            active={prefs.minimap}
            onClick={() => updatePrefs({ minimap: !prefs.minimap })}
            className="hidden md:flex"
          >
            <PanelRight className="w-3 h-3" />
          </ToolButton>
          <ToolButton title="Copy file contents" onClick={handleCopy}>
            {copied ? (
              <Check className="w-3 h-3" style={{ color: "#6B9E6B" }} />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </ToolButton>
          <ToolButton title="Download file" onClick={handleDownload} className="hidden sm:flex">
            <Download className="w-3 h-3" />
          </ToolButton>

          <ConnectionIndicator connected={connected} saveState={saveState} onSave={forceSave} />
        </div>
      </div>

      {/* Editor container */}
      <div
        className="flex-1 min-h-0 relative"
        style={{
          boxShadow: "inset 0 2px 4px rgba(163,167,178,0.2)",
          background: "#F7F8FA",
        }}
      >
        <Editor
          height="100%"
          language={file.language}
          theme="vs-light"
          onMount={(editor) => setEditorInstance(editor)}
          options={{
            fontSize: prefs.fontSize,
            minimap: { enabled: prefs.minimap },
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            automaticLayout: true,
            wordWrap: prefs.wordWrap ? "on" : "off",
            fontFamily: 'JetBrains Mono, "Fira Code", monospace',
            fontLigatures: true,
          }}
        />
      </div>
    </div>
  );
};

const ToolButton = ({ title, onClick, children, active = false, className = "" }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${className}`}
    style={{
      ...raisedSm,
      ...(active
        ? {
            ...pressedStyle,
            boxShadow:
              "inset 2px 2px 5px rgba(163,167,178,0.5), inset -2px -2px 5px rgba(255,255,255,0.9), 0 0 0 1.5px rgba(193,101,47,0.55)",
          }
        : {}),
    }}
    onMouseEnter={(e) => (e.currentTarget.style.color = "#C1652F")}
    onMouseLeave={(e) => (e.currentTarget.style.color = "#787B85")}
  >
    <span style={{ color: active ? "#C1652F" : "#787B85" }} className="flex">
      {children}
    </span>
  </button>
);

const ConnectionIndicator = ({ connected, saveState, onSave }) => {
  if (saveState === "saving") {
    return (
      <StatusPill>
        <Loader2 className="w-3 h-3 animate-spin" style={{ color: "#C1652F" }} />
        <span style={{ color: "#787B85" }}>Saving...</span>
      </StatusPill>
    );
  }
  if (saveState === "saved") {
    return (
      <StatusPill>
        <CloudUpload className="w-3 h-3" style={{ color: "#6B9E6B" }} />
        <span style={{ color: "#6B9E6B" }}>Saved</span>
      </StatusPill>
    );
  }
  return connected ? (
    <StatusPill clickable onClick={onSave} title="Click or press Ctrl+S to save now">
      <Check className="w-3 h-3" style={{ color: "#6B9E6B" }} />
      <span style={{ color: "#6B9E6B" }}>Live</span>
    </StatusPill>
  ) : (
    <StatusPill>
      <Loader2 className="w-3 h-3 animate-spin" style={{ color: "#C1652F" }} />
      <span style={{ color: "#787B85" }}>Syncing...</span>
    </StatusPill>
  );
};

const StatusPill = ({ children, onClick, title, clickable }) => (
  <button
    onClick={onClick}
    title={title}
    disabled={!clickable}
    className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg transition-all duration-300 ${
      clickable ? "cursor-pointer hover:scale-[1.04] active:scale-95" : "cursor-default"
    }`}
    style={pressedStyle}
  >
    {children}
  </button>
);

export default FileEditor;
