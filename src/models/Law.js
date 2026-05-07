import mongoose from "mongoose";

const lawSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true, unique: true },
    lawCategory: { type: String, required: true },
    actTitle: { type: String },
    actYear: { type: Number },
    docType: { type: String },
    jurisdiction: { type: String, default: "Pakistan" },
    updatedTill: { type: String },
    checksum: { type: String },
  },
  { timestamps: true },
);

export const Law = mongoose.model("Law", lawSchema);
