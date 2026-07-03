import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  requireMembership,
  requireOwner,
} from "../middleware/workspaceMiddleware.js";
import {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
} from "../controllers/workspaceController.js";

const router = express.Router();


router.use(protect);


router.post("/", createWorkspace);
router.get("/", getMyWorkspaces);

// Individual workspace routes with membership checks
router.get("/:workspaceId", requireMembership, getWorkspaceById);
router.patch("/:workspaceId", requireMembership, requireOwner, updateWorkspace);
router.delete("/:workspaceId", requireMembership, requireOwner, deleteWorkspace);

export default router;