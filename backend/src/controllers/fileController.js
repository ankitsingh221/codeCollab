import File from "../models/File.js";
import { getLanguageFromFilename, DEFAULT_BOILERPLATE } from "../utils/languageMap.js";

// @route GET /api/workspaces/:workspaceId/files
export const getFiles = async (req, res) => {
  try {
    const files = await File.find({ workspaceId: req.params.workspaceId })
      .select("name language createdBy createdAt updatedAt") // exclude content in list view
      .populate("createdBy", "name")
      .sort({ name: 1 });

    return res.status(200).json({ files });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error fetching files" });
  }
};

// @route GET /api/workspaces/:workspaceId/files/:fileId  (full content, for opening in editor)
export const getFileById = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.fileId,
      workspaceId: req.params.workspaceId,
    }).populate("createdBy", "name");

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    return res.status(200).json({ file });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error fetching file" });
  }
};

// @route POST /api/workspaces/:workspaceId/files
export const createFile = async (req, res) => {
  try {
    const { name } = req.body;
    const { workspaceId } = req.params;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "File name is required" });
    }

    const trimmedName = name.trim();
    if (!/^[a-zA-Z0-9_\-. ]+\.[a-zA-Z0-9]+$/.test(trimmedName)) {
      return res.status(400).json({ message: "File name must include a valid extension, e.g. index.html" });
    }

    const existing = await File.findOne({ workspaceId, name: trimmedName });
    if (existing) {
      return res.status(409).json({ message: "A file with this name already exists" });
    }

    const language = getLanguageFromFilename(trimmedName);
    const content = DEFAULT_BOILERPLATE[language] || "";

    const file = await File.create({
      workspaceId,
      name: trimmedName,
      language,
      content,
      createdBy: req.user._id,
    });

    const populated = await file.populate("createdBy", "name");
    return res.status(201).json({ file: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "A file with this name already exists" });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error creating file" });
  }
};

// @route PATCH /api/workspaces/:workspaceId/files/:fileId  (rename and/or save content)
export const updateFile = async (req, res) => {
  try {
    const { workspaceId, fileId } = req.params;
    const { name, content } = req.body;

    const file = await File.findOne({ _id: fileId, workspaceId });
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (name !== undefined && name.trim() !== file.name) {
      const trimmedName = name.trim();
      if (!/^[a-zA-Z0-9_\-. ]+\.[a-zA-Z0-9]+$/.test(trimmedName)) {
        return res.status(400).json({ message: "File name must include a valid extension" });
      }
      const existing = await File.findOne({ workspaceId, name: trimmedName, _id: { $ne: fileId } });
      if (existing) {
        return res.status(409).json({ message: "A file with this name already exists" });
      }
      file.name = trimmedName;
      file.language = getLanguageFromFilename(trimmedName);
    }

    if (content !== undefined) {
      file.content = content;
    }

    await file.save();
    const populated = await file.populate("createdBy", "name");
    return res.status(200).json({ file: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "A file with this name already exists" });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error updating file" });
  }
};

// @route DELETE /api/workspaces/:workspaceId/files/:fileId
export const deleteFile = async (req, res) => {
  try {
    const { workspaceId, fileId } = req.params;
    const file = await File.findOneAndDelete({ _id: fileId, workspaceId });
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    return res.status(200).json({ message: "File deleted", fileId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error deleting file" });
  }
};