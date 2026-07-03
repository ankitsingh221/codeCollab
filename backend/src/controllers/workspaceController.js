import mongoose from "mongoose";
import Workspace from "../models/Workspace.js";
import Member from "../models/Member.js";
import { requireMembership, requireOwner } from "../middleware/workspaceMiddleware.js";


let File;
try {
  const fileModule = await import("../models/File.js");
  File = fileModule.default;
} catch {
  File = null;
}


export const createWorkspace = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: "Workspace name is required" 
      });
    }

    // Check if user already has a workspace with the same name
    const existingWorkspace = await Workspace.findOne({
      name: name.trim(),
      ownerId: req.user._id,
      isActive: true
    });

    if (existingWorkspace) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "You already have a workspace with this name"
      });
    }

    // Create workspace
    const [workspace] = await Workspace.create(
      [{
        name: name.trim(),
        description: description?.trim() || "",
        ownerId: req.user._id,
        isActive: true
      }],
      { session }
    );

    // Create owner membership
    await Member.create(
      [{
        workspaceId: workspace._id,
        userId: req.user._id,
        role: "owner"
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const populatedWorkspace = await Workspace.findById(workspace._id)
      .populate("ownerId", "name email avatarUrl");

    return res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      workspace: {
        id: populatedWorkspace._id,
        name: populatedWorkspace.name,
        description: populatedWorkspace.description,
        owner: {
          id: populatedWorkspace.ownerId._id,
          name: populatedWorkspace.ownerId.name,
          email: populatedWorkspace.ownerId.email
        },
        createdAt: populatedWorkspace.createdAt,
        myRole: "owner"
      }
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ 
      success: false,
      message: err.message || "Server error creating workspace" 
    });
  }
};


export const getMyWorkspaces = async (req, res) => {
  try {
    const memberships = await Member.find({ 
      userId: req.user._id 
    })
    .populate({
      path: "workspaceId",
      populate: { 
        path: "ownerId", 
        select: "name email avatarUrl" 
      },
      match: { isActive: true }
    })
    .sort({ createdAt: -1 });

    const workspaces = memberships
      .filter((m) => m.workspaceId) 
      .map((m) => ({
        id: m.workspaceId._id,
        name: m.workspaceId.name,
        description: m.workspaceId.description,
        owner: {
          id: m.workspaceId.ownerId?._id,
          name: m.workspaceId.ownerId?.name,
          email: m.workspaceId.ownerId?.email
        },
        myRole: m.role,
        createdAt: m.workspaceId.createdAt,
        updatedAt: m.workspaceId.updatedAt,
        isOwner: m.role === "owner"
      }));

    return res.status(200).json({
      success: true,
      workspaces
    });

  } catch (err) {
    return res.status(500).json({ 
      success: false,
      message: err.message || "Server error fetching workspaces" 
    });
  }
};


export const getWorkspaceById = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      isActive: true
    })
    .populate("ownerId", "name email avatarUrl");

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found"
      });
    }

    // Get all members with user details
    const members = await Member.find({ workspaceId })
      .populate("userId", "name email avatarUrl");

    const formattedMembers = members.map((m) => ({
      id: m.userId._id,
      name: m.userId.name,
      email: m.userId.email,
      avatarUrl: m.userId.avatarUrl,
      role: m.role,
      joinedAt: m.createdAt
    }));

    return res.status(200).json({
      success: true,
      workspace: {
        id: workspace._id,
        name: workspace.name,
        description: workspace.description,
        owner: {
          id: workspace.ownerId._id,
          name: workspace.ownerId.name,
          email: workspace.ownerId.email
        },
        members: formattedMembers,
        memberCount: formattedMembers.length,
        myRole: req.membership.role,
        isOwner: req.membership.role === "owner",
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Server error fetching workspace"
    });
  }
};

// Update workspace
export const updateWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, description } = req.body;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      isActive: true
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found"
      });
    }

    // Check if another workspace with the same name exists
    if (name && name.trim()) {
      const existingWorkspace = await Workspace.findOne({
        name: name.trim(),
        ownerId: req.user._id,
        isActive: true,
        _id: { $ne: workspaceId }
      });

      if (existingWorkspace) {
        return res.status(400).json({
          success: false,
          message: "You already have another workspace with this name"
        });
      }
      workspace.name = name.trim();
    }

    if (description !== undefined) {
      workspace.description = description.trim() || "";
    }

    await workspace.save();

    return res.status(200).json({
      success: true,
      message: "Workspace updated successfully",
      workspace: {
        id: workspace._id,
        name: workspace.name,
        description: workspace.description
      }
    });

  } catch (err) {
  
    return res.status(500).json({
      success: false,
      message: err.message || "Server error updating workspace"
    });
  }
};

export const deleteWorkspace = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { workspaceId } = req.params;

    // Soft delete workspace
    const workspace = await Workspace.findOneAndUpdate(
      { _id: workspaceId, isActive: true },
      { isActive: false },
      { session, new: true }
    );

    if (!workspace) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Workspace not found or already deleted"
      });
    }

    // Remove all members
    await Member.deleteMany({ workspaceId }, { session });

    // Delete associated files if File model exists
    if (File) {
      await File.deleteMany({ workspaceId }, { session }).catch(() => {});
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Workspace deleted successfully"
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
   
    return res.status(500).json({
      success: false,
      message: err.message || "Server error deleting workspace"
    });
  }
};