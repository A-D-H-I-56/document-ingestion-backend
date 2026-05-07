import { env } from "../config/env.js";

export const syncEmbeddings = async (lawId) => {
  if (!env.ragServiceUrl) {
    return { queued: false };
  }

  const response = await fetch(`${env.ragServiceUrl}/embeddings/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ law_id: lawId }),
  });

  if (!response.ok) {
    return { queued: false };
  }

  return { queued: true };
};
