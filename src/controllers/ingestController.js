import express from "express";
import { uploadPdf } from "../middlewares/uploadMiddleware.js";
import { parsePdf } from "../services/pdfParserService.js";
import { normalizeText } from "../helpers/textNormalizer.js";
import { splitSections } from "../helpers/sectionSplitter.js";
import { extractMetadata } from "../services/groqService.js";
import { createLaw, createSections } from "../services/lawService.js";
import { syncEmbeddings } from "../services/ragSyncService.js";

export const ingestRouter = express.Router();

const ingestHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error("PDF file is required");
      error.status = 400;
      throw error;
    }

    const lawCategory = `${req.body?.law_category || ""}`.trim();
    if (!lawCategory) {
      const error = new Error("law_category is required");
      error.status = 400;
      throw error;
    }

    const rawText = await parsePdf(req.file.buffer);
    console.log(
      "PDF parsed, text length:",
      rawText.length,
      "Raw text: ",
      rawText,
    );
    const normalizedText = normalizeText(rawText);
    console.log(
      "Text normalized, length:",
      normalizedText.length,
      "Normalized text: ",
      normalizedText,
    );
    const metadata = await extractMetadata(normalizedText);
    const sections = splitSections(normalizedText);
    console.log("Sections extracted:", sections.length, "Section:", sections);

    if (sections.length === 0) {
      const error = new Error("No sections detected in document");
      error.status = 400;
      throw error;
    }

    const law = await createLaw({
      fileName: req.file.originalname,
      lawCategory,
      metadata,
      rawText: normalizedText,
    });

    await createSections({ lawId: law._id, sections });
    const syncResult = await syncEmbeddings(law._id.toString());

    res.status(201).json({
      law_id: law._id,
      sections: sections.length,
      embeddings_queued: syncResult.queued,
    });
  } catch (error) {
    next(error);
  }
};

ingestRouter.post("/", uploadPdf, ingestHandler);
