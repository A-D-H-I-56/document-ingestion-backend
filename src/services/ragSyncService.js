import { env } from "../config/env.js";

export const syncEmbeddings = async (lawId) => {
  // If RAG service URL is not configured, skip syncing
  const rawUrl = `${env.ragServiceUrl || ""}`.trim();
  if (!rawUrl || rawUrl === "-") {
    return { queued: false };
  }

  let baseUrl;
  try {
    baseUrl = new URL(rawUrl).toString().replace(/\/$/, "");
  } catch (error) {
    return { queued: false };
  }

  const response = await fetch(`${baseUrl}/embeddings/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ law_id: lawId }),
  });

  if (!response.ok) {
    return { queued: false };
  }

  return { queued: true };
};
