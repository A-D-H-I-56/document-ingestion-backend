import mongoose from "mongoose";

const lawSectionSchema = new mongoose.Schema(
  {
    lawId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Law",
      required: true,
      index: true,
    },
    label: { type: String, required: true },
    number: { type: String, required: true },
    heading: { type: String, default: "" },
    text: { type: String, required: true },
    orderIndex: { type: Number, required: true },
    pageStart: { type: Number },
    pageEnd: { type: Number },
  },
  { timestamps: true },
);

lawSectionSchema.index({ lawId: 1, label: 1 }, { unique: true });

export const LawSection = mongoose.model("LawSection", lawSectionSchema);
