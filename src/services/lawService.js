import crypto from "crypto";
import { Law } from "../models/Law.js";
import { LawSection } from "../models/LawSection.js";

export const createLaw = async ({
  fileName,
  lawCategory,
  metadata,
  rawText,
}) => {
  const checksum = crypto.createHash("sha256").update(rawText).digest("hex");

  const law = await Law.create({
    fileName,
    lawCategory,
    actTitle: metadata.act_title || null,
    actYear: metadata.act_year || null,
    docType: metadata.doc_type || null,
    updatedTill: metadata.updated_till || null,
    jurisdiction: metadata.jurisdiction || "Pakistan",
    checksum,
  });

  return law;
};

export const createSections = async ({ lawId, sections }) => {
  const docs = sections.map((section) => ({
    lawId,
    label: section.label,
    number: section.number,
    heading: section.heading,
    text: section.text,
    orderIndex: section.orderIndex,
  }));

  return LawSection.insertMany(docs, { ordered: false });
};
