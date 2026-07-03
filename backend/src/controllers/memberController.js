import Member from "../models/Member.js";
import Workspace from "../models/Workspace.js";

// @route GET /api/workspaces/:workspaceId/members
export const getMembers = async (req, res) => {
  try {
    const members = await Member.find({ workspaceId: req.params.workspaceId })
      .populate("userId", "name email avatarUrl")
      .sort({ role: 1, createdAt: 1 }); // owners first

    return res.status(200).json({ members });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error fetching members" });
  }
};

// @route PATCH /api/workspaces/:workspaceId/members/:memberId  (owner only)
export const updateMemberRole = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;
    const { role } = req.body;

    if (!["owner", "editor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const targetMember = await Member.findOne({ _id: memberId, workspaceId });
    if (!targetMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (targetMember.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }

    // If promoting someone to owner, demote current owner to editor (single-owner model)
    if (role === "owner") {
      await Member.updateOne(
        { workspaceId, role: "owner" },
        { $set: { role: "editor" } }
      );
      await Workspace.findByIdAndUpdate(workspaceId, { ownerId: targetMember.userId });
    }

    targetMember.role = role;
    await targetMember.save();

    const populated = await targetMember.populate("userId", "name email avatarUrl");
    return res.status(200).json({ member: populated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error updating member role" });
  }
};

// @route DELETE /api/workspaces/:workspaceId/members/:memberId  (owner only)
export const removeMember = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;

    const targetMember = await Member.findOne({ _id: memberId, workspaceId });
    if (!targetMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (targetMember.role === "owner") {
      return res.status(400).json({ message: "The workspace owner cannot be removed. Transfer ownership first." });
    }

    await targetMember.deleteOne();
    return res.status(200).json({ message: "Member removed", memberId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error removing member" });
  }
};

// @route DELETE /api/workspaces/:workspaceId/members/me  (leave workspace, non-owners only)
export const leaveWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const membership = await Member.findOne({ workspaceId, userId: req.user._id });
    if (!membership) {
      return res.status(404).json({ message: "You are not a member of this workspace" });
    }
    if (membership.role === "owner") {
      return res.status(400).json({ message: "Owner cannot leave. Transfer ownership or delete the workspace." });
    }

    await membership.deleteOne();
    return res.status(200).json({ message: "You have left the workspace" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error leaving workspace" });
  }
};