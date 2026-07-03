import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    name: { type: String, required: true, trim: true },
    language: { type: String, required: true },
    content: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
   { timestamps: true, toJSON: { virtuals: true } }
);

// No two files with the same name in the same workspace
fileSchema.index({ workspaceId: 1, name: 1 }, { unique: true });

export default mongoose.model("File", fileSchema);