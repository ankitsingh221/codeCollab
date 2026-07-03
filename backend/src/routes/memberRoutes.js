import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireMembership, requireOwner } from "../middleware/workspaceMiddleware.js";
import {
  getMembers,
  updateMemberRole,
  removeMember,
  leaveWorkspace,
} from "../controllers/memberController.js";

const router = express.Router({ mergeParams: true }); // access :workspaceId from parent router

router.use(protect);
router.use(requireMembership);

router.get("/", getMembers);
router.delete("/me", leaveWorkspace);
router.patch("/:memberId", requireOwner, updateMemberRole);
router.delete("/:memberId", requireOwner, removeMember);

export default router;