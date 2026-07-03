import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireMembership } from "../middleware/workspaceMiddleware.js";
import {
  getFiles,
  getFileById,
  createFile,
  updateFile,
  deleteFile,
} from "../controllers/fileController.js";

const router = express.Router({ mergeParams: true });

router.use(protect);
router.use(requireMembership); // both owner and editor can manage files

router.get("/", getFiles);
router.post("/", createFile);
router.get("/:fileId", getFileById);
router.patch("/:fileId", updateFile);
router.delete("/:fileId", deleteFile);

export default router;