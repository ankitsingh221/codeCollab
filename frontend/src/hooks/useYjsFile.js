import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness";
import { MonacoBinding } from "y-monaco";
import { connectSocket } from "../socket/socket";

const COLORS = [
  "#f43f5e",
  "#06b6d4",
  "#a855f7",
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
  "#ec4899",
  "#14b8a6",
];

const colorForUser = (id) => {
  const str = String(id);
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
};

const hexToRgba = (hex, alpha = 0.25) => {
  if (!hex || hex.charAt(0) !== "#") return `rgba(244, 63, 94, ${alpha})`;
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getTextColorForBg = (hex) => {
  if (!hex || hex.charAt(0) !== "#") return "#ffffff";
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
};

const escapeCssString = (str) => {
  if (!str) return "Anonymous";
  return String(str).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ");
};

export const useYjsFile = ({ file, user, editorInstance }) => {
  const [connected, setConnected] = useState(false);
  const docRef = useRef(null);
  const awarenessRef = useRef(null);
  const bindingRef = useRef(null);

  // Keep local awareness user info up to date
  useEffect(() => {
    if (!awarenessRef.current) return;
    awarenessRef.current.setLocalStateField("user", {
      name: user?.name || "Anonymous",
      color: colorForUser(user?.id || user?._id || "anon"),
    });
  }, [user?.name, user?.id, user?._id]);

  // Set up the Yjs doc + socket wiring whenever the open file changes
  useEffect(() => {
    if (!file?._id) return;

    const socket = connectSocket();
    const doc = new Y.Doc();
    const awareness = new awarenessProtocol.Awareness(doc);
    docRef.current = doc;
    awarenessRef.current = awareness;
    setConnected(false);

    awareness.setLocalStateField("user", {
      name: user?.name || "Anonymous",
      color: colorForUser(user?.id || user?._id || "anon"),
    });

    const updateCursorStyles = () => {
      let styleEl = document.getElementById("yjs-live-cursors");
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "yjs-live-cursors";
        document.head.appendChild(styleEl);
      }

      let css = "";
      const states = awareness.getStates();
      const currentClientId = doc.clientID;

      states.forEach((state, clientID) => {
        if (clientID === currentClientId || !state.user) return;

        const userColor = state.user.color || "#f43f5e";
        const userName = state.user.name || "Anonymous";
        const bgRgba = hexToRgba(userColor, 0.25);
        const textColor = getTextColorForBg(userColor);
        const safeName = escapeCssString(userName);

        css += `
          .yRemoteSelection-${clientID} {
            background-color: ${bgRgba} !important;
          }
          .yRemoteSelectionHead-${clientID} {
            position: absolute !important;
            border-left: 2px solid ${userColor} !important;
            border-top: 2px solid ${userColor} !important;
            border-bottom: 2px solid ${userColor} !important;
            height: 100% !important;
            box-sizing: border-box !important;
            z-index: 10 !important;
          }
          .yRemoteSelectionHead-${clientID}::after {
            content: "${safeName}" !important;
            position: absolute !important;
            top: -1.4em !important;
            left: -2px !important;
            background-color: ${userColor} !important;
            color: ${textColor} !important;
            font-size: 10px !important;
            font-family: system-ui, -apple-system, sans-serif !important;
            font-weight: 600 !important;
            padding: 1px 5px !important;
            border-radius: 3px 3px 3px 0 !important;
            white-space: nowrap !important;
            pointer-events: none !important;
            z-index: 100 !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.4) !important;
            line-height: 1.2 !important;
            letter-spacing: 0.01em !important;
          }
        `;
      });

      styleEl.textContent = css;
    };

    awareness.on("change", updateCursorStyles);
    updateCursorStyles();

    const handleSync = ({ fileId, update }) => {
      if (fileId !== file._id) return;
      try {
        console.debug(
          `[useYjsFile] handleSync file=${fileId} bytes=${update?.length || 0}`,
        );
      } catch (e) {}
      Y.applyUpdate(doc, new Uint8Array(update), "remote");
      setConnected(true);
    };

    const handleRemoteUpdate = ({ fileId, update }) => {
      if (fileId !== file._id) return;
      try {
        console.debug(
          `[useYjsFile] handleRemoteUpdate file=${fileId} bytes=${update?.length || 0}`,
        );
      } catch (e) {}
      Y.applyUpdate(doc, new Uint8Array(update), "remote");
    };

    const handleRemoteAwareness = ({ fileId, update }) => {
      if (fileId !== file._id) return;
      awarenessProtocol.applyAwarenessUpdate(
        awareness,
        new Uint8Array(update),
        "remote",
      );
    };

    const handleLocalDocUpdate = (update, origin) => {
      if (origin === "remote") return;
      try {
        console.debug(
          `[useYjsFile] local update file=${file._id} origin=${origin} bytes=${update?.length || 0}`,
        );
      } catch (e) {}
      socket.emit("file:update", {
        fileId: file._id,
        update: Array.from(update),
      });
    };

    const handleLocalAwarenessUpdate = ({ added, updated, removed }) => {
      const changed = [...added, ...updated, ...removed];
      if (changed.length === 0) return;
      const update = awarenessProtocol.encodeAwarenessUpdate(
        awareness,
        changed,
      );
      socket.emit("file:awareness-update", {
        fileId: file._id,
        update: Array.from(update),
      });
    };

    doc.on("update", handleLocalDocUpdate);
    awareness.on("update", handleLocalAwarenessUpdate);
    socket.on("file:sync", handleSync);
    socket.on("file:update", handleRemoteUpdate);
    socket.on("file:awareness", handleRemoteAwareness);

    socket.emit("file:join", { fileId: file._id });

    return () => {
      socket.emit("file:leave", { fileId: file._id });
      socket.off("file:sync", handleSync);
      socket.off("file:update", handleRemoteUpdate);
      socket.off("file:awareness", handleRemoteAwareness);
      doc.off("update", handleLocalDocUpdate);
      awareness.off("update", handleLocalAwarenessUpdate);
      awareness.off("change", updateCursorStyles);

      bindingRef.current?.destroy();
      bindingRef.current = null;
      awareness.destroy();
      doc.destroy();
    };
  }, [file?._id]);

  // Bind the Yjs text to Monaco once the editor mounts & manage cursor focus/blur visibility
  useEffect(() => {
    if (!editorInstance || !docRef.current || !awarenessRef.current) return;

    const model = editorInstance.getModel();
    if (!model) return;

    const ytext = docRef.current.getText("monaco");
    bindingRef.current = new MonacoBinding(
      ytext,
      model,
      new Set([editorInstance]),
      awarenessRef.current,
    );

    const clearSelection = () => {
      if (awarenessRef.current) {
        awarenessRef.current.setLocalStateField("selection", null);
      }
    };

    const restoreSelection = () => {
      if (!editorInstance || !awarenessRef.current || !docRef.current) return;
      const sel = editorInstance.getSelection();
      const currentModel = editorInstance.getModel();
      if (!sel || !currentModel) return;

      let anchor = currentModel.getOffsetAt(sel.getStartPosition());
      let head = currentModel.getOffsetAt(sel.getEndPosition());
      if (sel.getDirection() === 1 /* RTL */) {
        const tmp = anchor;
        anchor = head;
        head = tmp;
      }
      awarenessRef.current.setLocalStateField("selection", {
        anchor: Y.createRelativePositionFromTypeIndex(ytext, anchor),
        head: Y.createRelativePositionFromTypeIndex(ytext, head),
      });
    };

    // Idle timer to clear selection if user stops typing / interacting for 10s
    let idleTimer = null;
    const resetIdleTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        clearSelection();
      }, 10000);
    };

    // Monaco editor focus/blur listeners
    const blurDisposable = editorInstance.onDidBlurEditorWidget(() => {
      clearSelection();
      if (idleTimer) clearTimeout(idleTimer);
    });

    const focusDisposable = editorInstance.onDidFocusEditorWidget(() => {
      restoreSelection();
      resetIdleTimer();
    });

    const selectionDisposable = editorInstance.onDidChangeCursorSelection(() => {
      resetIdleTimer();
    });

    // Window and Container level blur / mouseleave listeners
    const containerEl = editorInstance.getContainerDomNode();
    const handleMouseLeave = () => {
      if (!document.activeElement || !containerEl.contains(document.activeElement)) {
        clearSelection();
      }
    };

    const handleWindowBlur = () => {
      clearSelection();
    };

    if (containerEl) {
      containerEl.addEventListener("mouseleave", handleMouseLeave);
    }
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      blurDisposable.dispose();
      focusDisposable.dispose();
      selectionDisposable.dispose();
      if (containerEl) {
        containerEl.removeEventListener("mouseleave", handleMouseLeave);
      }
      window.removeEventListener("blur", handleWindowBlur);

      bindingRef.current?.destroy();
      bindingRef.current = null;
    };
  }, [editorInstance, file?._id]);

  return { connected, awareness: awarenessRef.current };
};
