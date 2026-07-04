import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness";
import File from "../models/File.js";

const SAVE_DEBOUNCE_MS = 2000;

// fileId -> { doc, awareness, clients: Set<socketId>, controlledIds: Map<socketId, Set<number>>, saveTimeout }
const sessions = new Map();

const persist = async (fileId, doc) => {
  try {
    const ytext = doc.getText("monaco");
    // Normalize line endings to LF before persisting to avoid CRLF/LF mismatches
    const content = ytext.toString().replace(/\r\n/g, "\n");
    console.debug(`[fileCollab] persist file=${fileId} size=${content.length}`);
    await File.findByIdAndUpdate(fileId, { content });
  } catch (err) {
    console.error(`Failed to persist file ${fileId}:`, err.message);
  }
};

const scheduleSave = (fileId) => {
  const session = sessions.get(fileId);
  if (!session) return;
  if (session.saveTimeout) clearTimeout(session.saveTimeout);
  session.saveTimeout = setTimeout(
    () => persist(fileId, session.doc),
    SAVE_DEBOUNCE_MS,
  );
};

const pendingSessions = new Map(); // fileId -> in-flight creation Promise, prevents race duplicates

export const getOrCreateSession = async (fileId) => {
  if (sessions.has(fileId)) return sessions.get(fileId);
  if (pendingSessions.has(fileId)) return pendingSessions.get(fileId);

  const creationPromise = (async () => {
    const file = await File.findById(fileId);
    if (!file) throw new Error("File not found");

    const doc = new Y.Doc();
    const ytext = doc.getText("monaco");
    // Ensure stored content uses LF only so all clients receive the same base document
    const initial = (file.content || "").replace(/\r\n/g, "\n");
    ytext.insert(0, initial);
    console.debug(
      `[fileCollab] create session file=${fileId} initialSize=${initial.length}`,
    );

    const awareness = new awarenessProtocol.Awareness(doc);
    awareness.setLocalState(null);

    const session = {
      doc,
      awareness,
      clients: new Set(),
      controlledIds: new Map(),
      saveTimeout: null,
      listenerAttached: false,
    };
    sessions.set(fileId, session);
    return session;
  })();

  pendingSessions.set(fileId, creationPromise);
  try {
    return await creationPromise;
  } finally {
    pendingSessions.delete(fileId);
  }
};

export const getSession = (fileId) => sessions.get(fileId);

export const registerClient = (fileId, socketId) => {
  const session = sessions.get(fileId);
  if (!session) return;
  session.clients.add(socketId);
  session.controlledIds.set(socketId, new Set());
};

export const trackAwarenessChange = (
  fileId,
  socketId,
  { added, updated, removed },
) => {
  const session = sessions.get(fileId);
  if (!session) return;
  const controlled = session.controlledIds.get(socketId);
  if (!controlled) return;
  added.forEach((id) => controlled.add(id));
  updated.forEach((id) => controlled.add(id));
  removed.forEach((id) => controlled.delete(id));
};

export const disconnectClient = async (fileId, socketId) => {
  const session = sessions.get(fileId);
  if (!session) return;

  const controlled = session.controlledIds.get(socketId);
  session.clients.delete(socketId);
  session.controlledIds.delete(socketId);

  if (controlled && controlled.size > 0) {
    // removing these states fires the 'update' listener below, which broadcasts
    // the removal so other clients drop this user's cursor immediately
    awarenessProtocol.removeAwarenessStates(
      session.awareness,
      Array.from(controlled),
      "server",
    );
  }

  if (session.clients.size === 0) {
    if (session.saveTimeout) clearTimeout(session.saveTimeout);
    await persist(fileId, session.doc);
    sessions.delete(fileId);
  }
};

export const applyDocUpdate = (fileId, update, originSocketId) => {
  const session = sessions.get(fileId);
  if (!session) return;
  try {
    console.debug(
      `[fileCollab] applyDocUpdate file=${fileId} origin=${originSocketId} bytes=${update.byteLength || update.length}`,
    );
  } catch (e) {}
  Y.applyUpdate(session.doc, update, originSocketId);
  scheduleSave(fileId);
};

export const applyAwarenessUpdate = (fileId, update, originSocketId) => {
  const session = sessions.get(fileId);
  if (!session) return;
  awarenessProtocol.applyAwarenessUpdate(
    session.awareness,
    update,
    originSocketId,
  );
};
