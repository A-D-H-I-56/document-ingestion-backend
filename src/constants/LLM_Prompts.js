export const METADATA_SYSTEM_PROMPT =
  "You are a legal document metadata extractor. Output must be a single JSON object with keys: act_title, act_year, doc_type, updated_till, jurisdiction. Use null for unknown values. Do not add extra keys. Do not include markdown, code fences, or explanations.";

export const buildMetadataUserPrompt = (textSample) => {
  return [
    "Extract metadata from the law text.",
    "Rules:",
    "- Read only from the provided text.",
    "- If a value is missing, use null.",
    "- act_title should be the official act name mentioned in the law text (e.g., 'Pakistan Penal Code, 1860').",
    "- act_year must be a 4-digit integer if present, otherwise null.",
    "- updated_till must be a date string in YYYY-MM-DD if present, otherwise null.",
    "- doc_type should be short (e.g., Act, Ordinance, Regulation).",
    "- jurisdiction should be a country or region name if present, otherwise null.",
    "Return only JSON.",
    "",
    "Text:",
    textSample,
  ].join("\n");
};
