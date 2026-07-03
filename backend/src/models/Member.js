import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    workspaceId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Workspace", 
      required: true 
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    role: { 
      type: String, 
      enum: ["owner", "editor"], 
      default: "editor" 
    },
  },
  { timestamps: true }
);

// A user can only have one membership per workspace
memberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });
// Index for faster queries
memberSchema.index({ userId: 1 });
memberSchema.index({ workspaceId: 1 });

export default mongoose.model("Member", memberSchema);