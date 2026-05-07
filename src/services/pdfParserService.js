import pdfParse from "pdf-parse";

export const parsePdf = async (buffer) => {
  const data = await pdfParse(buffer);
  return data.text || "";
};
