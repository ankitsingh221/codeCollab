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

export const useYjsFile = ({ file, user, editorInstance }) => {
  const [connected, setConnected] = useState(false);
  const docRef = useRef(null);
  const awarenessRef = useRef(null);
  const bindingRef = useRef(null);

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

      bindingRef.current?.destroy();
      bindingRef.current = null;
      awareness.destroy();
      doc.destroy();
    };
  }, [file?._id]);

  // Bind the Yjs text to Monaco once the editor mounts
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

    return () => {
      bindingRef.current?.destroy();
      bindingRef.current = null;
    };
  }, [editorInstance, file?._id]);

  return { connected, awareness: awarenessRef.current };
};
