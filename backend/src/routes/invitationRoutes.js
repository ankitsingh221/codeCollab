import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireMembership, requireOwner } from "../middleware/workspaceMiddleware.js";
import {
  createInvitation,
  getWorkspaceInvitations,
  cancelInvitation,
  getMyInvitations,
  acceptInvitation,
  declineInvitation,
} from "../controllers/invitationController.js";


export const workspaceInvitationRouter = express.Router({ mergeParams: true });
workspaceInvitationRouter.use(protect);
workspaceInvitationRouter.use(requireMembership);
workspaceInvitationRouter.post("/", requireOwner, createInvitation);
workspaceInvitationRouter.get("/", requireOwner, getWorkspaceInvitations);
workspaceInvitationRouter.delete("/:invitationId", requireOwner, cancelInvitation);


export const userInvitationRouter = express.Router();
userInvitationRouter.use(protect);
userInvitationRouter.get("/me", getMyInvitations);
userInvitationRouter.post("/:invitationId/accept", acceptInvitation);
userInvitationRouter.post("/:invitationId/decline", declineInvitation);