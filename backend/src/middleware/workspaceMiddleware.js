import Member from "../models/Member.js";

export const requireMembership = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    
    if (!workspaceId) {
      return res.status(400).json({ 
        success: false,
        message: "Workspace ID is required" 
      });
    }

    const membership = await Member.findOne({ 
      workspaceId, 
      userId: req.user._id 
    });

    if (!membership) {
      return res.status(403).json({ 
        success: false,
        message: "You are not a member of this workspace" 
      });
    }

    req.membership = membership;
    next();
  } catch (err) {
    return res.status(500).json({ 
      success: false,
      message: "Server error checking membership" 
    });
  }
};

export const requireOwner = (req, res, next) => {
  if (!req.membership) {
    return res.status(403).json({ 
      success: false,
      message: "Membership information not found" 
    });
  }

  if (req.membership.role !== "owner") {
    return res.status(403).json({ 
      success: false,
      message: "Only the workspace owner can perform this action" 
    });
  }
  next();
};

// Optional: Check if user is at least an editor
export const requireEditor = (req, res, next) => {
  if (!req.membership) {
    return res.status(403).json({ 
      success: false,
      message: "Membership information not found" 
    });
  }

  if (req.membership.role !== "owner" && req.membership.role !== "editor") {
    return res.status(403).json({ 
      success: false,
      message: "You need at least editor permissions" 
    });
  }
  next();
};