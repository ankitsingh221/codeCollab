import mongoose from "mongoose";
import Invitation from "../models/Invitation.js";
import Member from "../models/Member.js";
import Workspace from "../models/Workspace.js";
import User from "../models/User.js";

export const createInvitation = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, role = "editor" } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!["owner", "editor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Prevent inviting someone who's already a member
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      const alreadyMember = await Member.findOne({
        workspaceId,
        userId: existingUser._id,
      });
      if (alreadyMember) {
        return res
          .status(409)
          .json({ message: "This user is already a member of the workspace" });
      }
    }

    const existingPending = await Invitation.findOne({
      workspaceId,
      email: normalizedEmail,
      status: "pending",
    });
    if (existingPending) {
      return res
        .status(409)
        .json({ message: "An invitation is already pending for this email" });
    }

    const invitation = await Invitation.create({
      workspaceId,
      email: normalizedEmail,
      role,
      invitedBy: req.user._id,
    });

    const populated = await invitation.populate("invitedBy", "name email");
    return res.status(201).json({ invitation: populated });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error creating invitation" });
  }
};

export const getWorkspaceInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({
      workspaceId: req.params.workspaceId,
      status: "pending",
    })
      .populate("invitedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ invitations });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error fetching invitations" });
  }
};

export const cancelInvitation = async (req, res) => {
  try {
    const { workspaceId, invitationId } = req.params;
    const invitation = await Invitation.findOne({
      _id: invitationId,
      workspaceId,
    });
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }
    await invitation.deleteOne();
    return res
      .status(200)
      .json({ message: "Invitation cancelled", invitationId });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error cancelling invitation" });
  }
};

export const getMyInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({
      email: req.user.email.toLowerCase(),
      status: "pending",
    })
      .populate("invitedBy", "name email avatarUrl")
      .populate("workspaceId", "name description")
      .sort({ createdAt: -1 });

    return res.status(200).json({ invitations });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error fetching your invitations" });
  }
};

export const acceptInvitation = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { invitationId } = req.params;

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }
    if (invitation.email !== req.user.email.toLowerCase()) {
      return res
        .status(403)
        .json({ message: "This invitation is not addressed to your account" });
    }
    if (invitation.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This invitation has already been resolved" });
    }

    let workspace;
    await session.withTransaction(async () => {
      const existingMember = await Member.findOne({
        workspaceId: invitation.workspaceId,
        userId: req.user._id,
      }).session(session);

      if (!existingMember) {
        await Member.create(
          [
            {
              workspaceId: invitation.workspaceId,
              userId: req.user._id,
              role: invitation.role,
            },
          ],
          { session },
        );
      }

      invitation.status = "accepted";
      await invitation.save({ session });

      workspace = await Workspace.findById(invitation.workspaceId).session(
        session,
      );
    });

    return res.status(200).json({ message: "Invitation accepted", workspace });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error accepting invitation" });
  } finally {
    session.endSession();
  }
};

export const declineInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }
    if (invitation.email !== req.user.email.toLowerCase()) {
      return res
        .status(403)
        .json({ message: "This invitation is not addressed to your account" });
    }
    if (invitation.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This invitation has already been resolved" });
    }

    invitation.status = "declined";
    await invitation.save();

    return res.status(200).json({ message: "Invitation declined" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error declining invitation" });
  }
};
