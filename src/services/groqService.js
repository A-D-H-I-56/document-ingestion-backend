import { env } from "../config/env.js";
import {
  METADATA_SYSTEM_PROMPT,
  buildMetadataUserPrompt,
} from "../constants/LLM_Prompts.js";

const parseJsonContent = (content) => {
  if (!content) {
    return null;
  }

  const trimmed = content.trim();
  if (trimmed.startsWith("{")) {
    return JSON.parse(trimmed);
  }

  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) {
    return null;
  }

  return JSON.parse(match[0]);
};

export const extractMetadata = async (text) => {
  if (!env.groqApiKey) {
    return {
      act_title: "",
      act_year: null,
      doc_type: "",
      updated_till: "",
      jurisdiction: "Pakistan",
    };
  }

  const textSample = text.slice(0, 4000);
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.groqApiKey}`,
      },
      body: JSON.stringify({
        model: env.groqModel,
        temperature: 0,
        messages: [
          {
            role: "system",
            content: METADATA_SYSTEM_PROMPT,
          },
          { role: "user", content: buildMetadataUserPrompt(textSample) },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Groq metadata extraction failed");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  try {
    const parsed = parseJsonContent(content);
    if (!parsed) {
      throw new Error("Metadata JSON missing");
    }
    return parsed;
  } catch (error) {
    return {
      act_title: "",
      act_year: null,
      doc_type: "",
      updated_till: "",
      jurisdiction: "Pakistan",
    };
  }
};
