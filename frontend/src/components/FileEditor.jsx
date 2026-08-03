import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useYjsFile } from "../hooks/useYjsFile";
import { useAuth } from "../context/AuthContext";
import { Loader2, Check, Users as UsersIcon } from "lucide-react";

const pressedStyle = {
  background: "linear-gradient(160deg, #E3E5E9 0%, #F0F1F4 100%)",
  boxShadow:
    "inset 3px 3px 7px rgba(163,167,178,0.5), inset -3px -3px 7px rgba(255,255,255,0.9)",
};

const FileEditor = ({ file, onContentSynced }) => {
  const { user } = useAuth();
  const [editorInstance, setEditorInstance] = useState(null);
  const [presentUsers, setPresentUsers] = useState([]);
  const lastEmittedRef = useRef(file.content);

  // Design tokens matching Landing page
  const raisedSm = {
    background: "linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)",
    boxShadow:
      "4px 4px 10px rgba(163,167,178,0.4), -4px -4px 10px rgba(255,255,255,0.85)",
    border: "1px solid rgba(255,255,255,0.5)",
  };

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
    <div
      className="flex flex-col h-full rounded-[20px] overflow-hidden"
      style={raisedSm}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 h-10 shrink-0"
        style={{
          background: "linear-gradient(160deg, #F7F8FA 0%, #E5E7EB 100%)",
          borderBottom: "1px solid rgba(163,167,178,0.2)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #ff6b6b, #cc3333)",
                boxShadow:
                  "inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.1)",
              }}
            ></div>
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #ffd93d, #cc9900)",
                boxShadow:
                  "inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.1)",
              }}
            ></div>
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #6bcf7f, #2d8f47)",
                boxShadow:
                  "inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.1)",
              }}
            ></div>
          </div>
          <span
            className="text-xs font-mono font-medium"
            style={{ color: "#787B85" }}
          >
            {file.name}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {presentUsers.length > 0 && (
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
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
                      boxShadow:
                        "inset 1px 1px 2px rgba(255,255,255,0.7), inset -1px -1px 2px rgba(0,0,0,0.05)",
                    }}
                  >
                    +{presentUsers.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}
          <ConnectionIndicator connected={connected} />
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
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            automaticLayout: true,
            wordWrap: "on",
            fontFamily: 'JetBrains Mono, "Fira Code", monospace',
            fontLigatures: true,
          }}
        />
      </div>
    </div>
  );
};

const ConnectionIndicator = ({ connected }) =>
  connected ? (
    <span
      className="flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg transition-all duration-300"
      style={pressedStyle}
    >
      <Check className="w-3 h-3" style={{ color: "#6B9E6B" }} />
      <span style={{ color: "#6B9E6B" }}>Live</span>
    </span>
  ) : (
    <span
      className="flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg transition-all duration-300"
      style={pressedStyle}
    >
      <Loader2 className="w-3 h-3 animate-spin" style={{ color: "#C1652F" }} />
      <span style={{ color: "#787B85" }}>Syncing...</span>
    </span>
  );

export default FileEditor;
