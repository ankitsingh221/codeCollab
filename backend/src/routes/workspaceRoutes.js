import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireMembership, requireOwner } from "../middleware/workspaceMiddleware.js";
import {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
} from "../controllers/workspaceController.js";
import memberRoutes from "./memberRoutes.js";
import { workspaceInvitationRouter } from "./invitationRoutes.js";
import fileRoutes from "./fileRoutes.js";

const router = express.Router();

router.use(protect);

router.post("/", createWorkspace);
router.get("/", getMyWorkspaces);

router.get("/:workspaceId", requireMembership, getWorkspaceById);
router.patch("/:workspaceId", requireMembership, requireOwner, updateWorkspace);
router.delete("/:workspaceId", requireMembership, requireOwner, deleteWorkspace);

router.use("/:workspaceId/members", memberRoutes);
router.use("/:workspaceId/invitations", workspaceInvitationRouter);
router.use("/:workspaceId/files", fileRoutes);

export default router;