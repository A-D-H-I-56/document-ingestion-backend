import express from "express";
import mongoose from "mongoose";
import { Law } from "../models/Law.js";
import { LawSection } from "../models/LawSection.js";

export const actsRouter = express.Router();
export const sectionsRouter = express.Router();
export const lawCategoriesRouter = express.Router();

const isValidId = (id) => mongoose.isValidObjectId(id);

lawCategoriesRouter.get("/", async (req, res, next) => {
  try {
    const categories = await Law.distinct("lawCategory");
    res.json({ data: categories.filter(Boolean).sort() });
  } catch (error) {
    next(error);
  }
});

actsRouter.get("/", async (req, res, next) => {
  try {
    const laws = await Law.find().sort({ createdAt: -1 }).lean();
    const counts = await LawSection.aggregate([
      { $group: { _id: "$lawId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(
      counts.map((item) => [String(item._id), item.count]),
    );

    const data = laws.map((law) => ({
      ...law,
      totalSections: countMap.get(String(law._id)) || 0,
    }));

    res.json({ total: data.length, data });
  } catch (error) {
    next(error);
  }
});

actsRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      const error = new Error("Invalid act id");
      error.status = 400;
      throw error;
    }

    const law = await Law.findById(id).lean();
    if (!law) {
      const error = new Error("Act not found");
      error.status = 404;
      throw error;
    }

    const totalSections = await LawSection.countDocuments({ lawId: id });
    res.json({ ...law, totalSections });
  } catch (error) {
    next(error);
  }
});

actsRouter.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      const error = new Error("Invalid act id");
      error.status = 400;
      throw error;
    }

    const updates = {};
    const fields = [
      "lawCategory",
      "actTitle",
      "actYear",
      "docType",
      "jurisdiction",
      "updatedTill",
    ];

    fields.forEach((field) => {
      if (req.body?.[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.actYear !== undefined) {
      const parsedYear = Number.parseInt(updates.actYear, 10);
      updates.actYear = Number.isFinite(parsedYear) ? parsedYear : null;
    }

    if (Object.keys(updates).length === 0) {
      const error = new Error("No fields to update");
      error.status = 400;
      throw error;
    }

    const act = await Law.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!act) {
      const error = new Error("Act not found");
      error.status = 404;
      throw error;
    }

    res.json(act);
  } catch (error) {
    next(error);
  }
});

actsRouter.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      const error = new Error("Invalid act id");
      error.status = 400;
      throw error;
    }

    const act = await Law.findByIdAndDelete(id).lean();
    if (!act) {
      const error = new Error("Act not found");
      error.status = 404;
      throw error;
    }

    await LawSection.deleteMany({ lawId: id });
    res.json({ deleted: true, id });
  } catch (error) {
    next(error);
  }
});

actsRouter.get("/:id/sections", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      const error = new Error("Invalid act id");
      error.status = 400;
      throw error;
    }

    const sections = await LawSection.find({ lawId: id })
      .sort({ orderIndex: 1 })
      .lean();

    res.json({ total: sections.length, data: sections });
  } catch (error) {
    next(error);
  }
});

actsRouter.post("/:id/sections", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      const error = new Error("Invalid act id");
      error.status = 400;
      throw error;
    }

    const label = `${req.body?.label || ""}`.trim();
    const number = `${req.body?.number || ""}`.trim();
    const heading = `${req.body?.heading || ""}`.trim();
    const text = `${req.body?.text || ""}`.trim();

    if (!label || !number || !text) {
      const error = new Error("label, number, and text are required");
      error.status = 400;
      throw error;
    }

    let orderIndex = Number.parseInt(req.body?.orderIndex, 10);
    if (!Number.isFinite(orderIndex)) {
      const lastSection = await LawSection.findOne({ lawId: id })
        .sort({ orderIndex: -1 })
        .lean();
      orderIndex = lastSection ? lastSection.orderIndex + 1 : 1;
    }

    const section = await LawSection.create({
      lawId: id,
      label,
      number,
      heading,
      text,
      orderIndex,
    });

    res.status(201).json(section);
  } catch (error) {
    next(error);
  }
});

sectionsRouter.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      const error = new Error("Invalid section id");
      error.status = 400;
      throw error;
    }

    const updates = {};
    const fields = ["label", "number", "heading", "text", "orderIndex"];
    fields.forEach((field) => {
      if (req.body?.[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      const error = new Error("No fields to update");
      error.status = 400;
      throw error;
    }

    const section = await LawSection.findByIdAndUpdate(id, updates, {
      new: true,
    }).lean();

    if (!section) {
      const error = new Error("Section not found");
      error.status = 404;
      throw error;
    }

    res.json(section);
  } catch (error) {
    next(error);
  }
});

sectionsRouter.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      const error = new Error("Invalid section id");
      error.status = 400;
      throw error;
    }

    const section = await LawSection.findByIdAndDelete(id).lean();
    if (!section) {
      const error = new Error("Section not found");
      error.status = 404;
      throw error;
    }

    res.json({ deleted: true, id });
  } catch (error) {
    next(error);
  }
});
