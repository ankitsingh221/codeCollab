import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireMembership } from "../middleware/workspaceMiddleware.js";
import { executeCode } from "../controllers/executionController.js";

const router = express.Router({ mergeParams: true });

router.use(protect);
router.use(requireMembership);

router.post("/", executeCode);

export default router;