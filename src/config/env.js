import dotenv from "dotenv";

dotenv.config();

export const loadEnv = () => {
  // .env is loaded at module init; keep for backward compatibility.
};

export const env = {
  port: Number.parseInt(process.env.PORT || "4001", 10),
  mongoUri: process.env.MONGO_URI || "",
  groqApiKey: process.env.GROQ_API_KEY || "",
  groqModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  ragServiceUrl: process.env.RAG_SERVICE_URL || "",
};
