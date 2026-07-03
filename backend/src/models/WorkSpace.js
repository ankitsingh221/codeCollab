import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Workspace name is required"], 
      trim: true,
      maxlength: [50, "Workspace name cannot exceed 50 characters"]
    },
    description: { 
      type: String, 
      default: "", 
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"]
    },
    ownerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);


workspaceSchema.index({ ownerId: 1, isActive: 1 });

export default mongoose.model("Workspace", workspaceSchema);