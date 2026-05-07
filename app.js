import cors from "cors";
import express from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { loadEnv, env } from "./src/config/env.js";
import { connectDb } from "./src/config/db.js";
import {
  actsRouter,
  lawCategoriesRouter,
  sectionsRouter,
} from "./src/controllers/actsController.js";
import { ingestRouter } from "./src/controllers/ingestController.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";

loadEnv();
await connectDb();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Ingest Service",
      version: "0.1.0",
    },
    servers: [
      {
        url: `http://localhost:${env.port}`,
      },
    ],
    paths: {
      "/health": {
        get: {
          summary: "Health check",
          responses: {
            200: {
              description: "OK",
            },
          },
        },
      },
      "/ingest": {
        post: {
          summary: "Ingest a PDF document",
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    file: {
                      type: "string",
                      format: "binary",
                    },
                    law_category: {
                      type: "string",
                    },
                  },
                  required: ["file", "law_category"],
                },
              },
            },
          },
          responses: {
            201: {
              description: "Created",
            },
            400: {
              description: "Bad Request",
            },
          },
        },
      },
      "/law-categories": {
        get: {
          summary: "List distinct law categories",
          responses: {
            200: {
              description: "OK",
            },
          },
        },
      },
      "/acts": {
        get: {
          summary: "List acts",
          responses: {
            200: {
              description: "OK",
            },
          },
        },
      },
      "/acts/{id}": {
        get: {
          summary: "Get act details",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "OK",
            },
            404: {
              description: "Not Found",
            },
          },
        },
        put: {
          summary: "Update act metadata",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    lawCategory: { type: "string" },
                    actTitle: { type: "string" },
                    actYear: { type: "number" },
                    docType: { type: "string" },
                    jurisdiction: { type: "string" },
                    updatedTill: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "OK",
            },
          },
        },
        delete: {
          summary: "Delete an act",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "OK",
            },
          },
        },
      },
      "/acts/{id}/sections": {
        get: {
          summary: "List sections for an act",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "OK",
            },
          },
        },
        post: {
          summary: "Add section to an act",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    label: { type: "string" },
                    number: { type: "string" },
                    heading: { type: "string" },
                    text: { type: "string" },
                    orderIndex: { type: "number" },
                  },
                  required: ["label", "number", "text"],
                },
              },
            },
          },
          responses: {
            201: {
              description: "Created",
            },
          },
        },
      },
      "/sections/{id}": {
        put: {
          summary: "Update a section",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                },
              },
            },
          },
          responses: {
            200: {
              description: "OK",
            },
          },
        },
        delete: {
          summary: "Delete a section",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "OK",
            },
          },
        },
      },
    },
  },
  apis: [],
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/acts", actsRouter);
app.use("/law-categories", lawCategoriesRouter);
app.use("/sections", sectionsRouter);
app.use("/ingest", ingestRouter);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Ingest service running on ${env.port}`);
});
