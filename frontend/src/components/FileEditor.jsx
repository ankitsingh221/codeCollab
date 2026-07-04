import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useYjsFile } from "../hooks/useYjsFile";
import { useAuth } from "../context/AuthContext";
import { Loader2, Check, Users as UsersIcon } from "lucide-react";

const FileEditor = ({ file, onContentSynced }) => {
  const { user } = useAuth();
  const [editorInstance, setEditorInstance] = useState(null);
  const [presentUsers, setPresentUsers] = useState([]);
  const lastEmittedRef = useRef(file.content);

  const { connected, awareness } = useYjsFile({ file, user, editorInstance });

  useEffect(() => {
    if (!editorInstance) return;
    const model = editorInstance.getModel();
    if (!model) return;

    let timeout;
    const disposable = model.onDidChangeContent(() => {
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

  // Track which users currently have this specific file open (their cursors are visible)
  useEffect(() => {
    if (!awareness) return;
    const update = () => {
      const states = Array.from(awareness.getStates().values())
        .map((s) => s.user)
        .filter(Boolean);
      setPresentUsers(states);
    };
    update();
    awareness.on("change", update);
    return () => awareness.off("change", update);
  }, [awareness]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 h-9 border-b border-white/5 bg-white/2 shrink-0">
        <span className="text-xs text-white/40 truncate">{file.name}</span>
        <div className="flex items-center gap-3">
          {presentUsers.length > 0 && (
            <div className="flex items-center gap-1">
              <UsersIcon className="w-3 h-3 text-white/30" />
              <div className="flex -space-x-1.5">
                {presentUsers.slice(0, 4).map((u, i) => (
                  <div
                    key={i}
                    title={u.name}
                    className="w-4 h-4 rounded-full border border-[#0a0a0a] flex items-center justify-center text-[8px] font-bold text-black"
                    style={{ backgroundColor: u.color }}
                  >
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          )}
          <ConnectionIndicator connected={connected} />
          {/* Formatter button removed */}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={file.language}
          theme="vs-dark"
          onMount={(editor) => setEditorInstance(editor)}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            automaticLayout: true,
            wordWrap: "on",
          }}
        />
      </div>
    </div>
  );
};

const ConnectionIndicator = ({ connected }) =>
  connected ? (
    <span className="flex items-center gap-1.5 text-[11px] text-emerald-400/60">
      <Check className="w-3 h-3" />
      Live
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-[11px] text-white/30">
      <Loader2 className="w-3 h-3 animate-spin" />
      Syncing...
    </span>
  );

export default FileEditor;
