import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness";
import Member from "../models/Member.js";
import { getColorForUser } from "./userColor.js";
import { addPresence, removePresence, getPresenceList } from "./presenceStore.js";
import {
  getOrCreateSession,
  getSession,
  registerClient,
  trackAwarenessChange,
  disconnectClient,
  applyDocUpdate,
  applyAwarenessUpdate,
} from "./fileCollabManager.js";

export const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    const user = socket.user;

    // ---------- Workspace-wide presence (online users list) ----------
    socket.on("workspace:join", async ({ workspaceId }) => {
      try {
        const membership = await Member.findOne({ workspaceId, userId: user._id });
        if (!membership) return;

        socket.data.workspaceId = workspaceId;
        socket.join(`workspace:${workspaceId}`);

        addPresence(workspaceId, user._id.toString(), {
          socketId: socket.id,
          name: user.name,
          avatarUrl: user.avatarUrl,
          color: getColorForUser(user._id),
        });

        io.to(`workspace:${workspaceId}`).emit("workspace:presence", {
          users: getPresenceList(workspaceId),
        });
      } catch (err) {
        console.error("workspace:join error:", err.message);
      }
    });

    socket.on("workspace:leave", ({ workspaceId }) => {
      socket.leave(`workspace:${workspaceId}`);
      removePresence(workspaceId, user._id.toString());
      io.to(`workspace:${workspaceId}`).emit("workspace:presence", {
        users: getPresenceList(workspaceId),
      });
    });

    // ---------- File-level collaborative editing (Yjs) ----------
   socket.on("file:join", async ({ fileId }) => {
  try {
    if (!socket.data.joinedFiles) socket.data.joinedFiles = new Set();
    if (socket.data.joinedFiles.has(fileId)) return; // already joined, ignore StrictMode's duplicate call

    const session = await getOrCreateSession(fileId);
    registerClient(fileId, socket.id);
    socket.data.joinedFiles.add(fileId);
    socket.join(`file:${fileId}`);
    socket.data.currentFileId = fileId;
        if (!session.listenerAttached) {
          session.awareness.on("update", (changes, origin) => {
            if (typeof origin === "string" && origin !== "server") {
              trackAwarenessChange(fileId, origin, changes);
            }
            const changedIds = [...changes.added, ...changes.updated, ...changes.removed];
            if (changedIds.length === 0) return;
            const update = awarenessProtocol.encodeAwarenessUpdate(session.awareness, changedIds);
            io.to(`file:${fileId}`).emit("file:awareness", {
              fileId,
              update: Array.from(update),
            });
          });
          session.listenerAttached = true;
        }

        // send the newcomer the full current document state
        const stateUpdate = Y.encodeStateAsUpdate(session.doc);
        socket.emit("file:sync", { fileId, update: Array.from(stateUpdate) });

        // send them everyone else's current cursor/selection state
        const existingIds = Array.from(session.awareness.getStates().keys());
        if (existingIds.length > 0) {
          const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(session.awareness, existingIds);
          socket.emit("file:awareness", { fileId, update: Array.from(awarenessUpdate) });
        }
      } catch (err) {
        console.error("file:join error:", err.message);
        socket.emit("file:error", { fileId, message: "Failed to join file session" });
      }
    });

    socket.on("file:update", ({ fileId, update }) => {
      if (!getSession(fileId)) return;
      applyDocUpdate(fileId, new Uint8Array(update), socket.id);
      socket.to(`file:${fileId}`).emit("file:update", { fileId, update });
    });

    socket.on("file:awareness-update", ({ fileId, update }) => {
      if (!getSession(fileId)) return;
      applyAwarenessUpdate(fileId, new Uint8Array(update), socket.id);
      // broadcast happens via the awareness 'update' listener registered in file:join
    });

    socket.on("file:leave", async ({ fileId }) => {
  socket.leave(`file:${fileId}`);
  socket.data.joinedFiles?.delete(fileId);
  await disconnectClient(fileId, socket.id);
  if (socket.data.currentFileId === fileId) socket.data.currentFileId = null;
});

    // ---------- Disconnect cleanup ----------
    socket.on("disconnect", async () => {
      const workspaceId = socket.data.workspaceId;
      if (workspaceId) {
        removePresence(workspaceId, user._id.toString());
        io.to(`workspace:${workspaceId}`).emit("workspace:presence", {
          users: getPresenceList(workspaceId),
        });
      }

      const fileId = socket.data.currentFileId;
      if (fileId) {
        await disconnectClient(fileId, socket.id);
      }
    });
  });
};