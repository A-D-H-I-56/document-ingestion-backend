const labelRegex =
  /^\s*(Section|Sec\.?|S\.|Article|Art\.?)\s*([0-9A-Za-z-]+)\.?\s*(.*)$/i;
const numberRegex = /^\s*([0-9]{1,4}[A-Za-z]?)\s*[\.\)\-–—:]\s+(.+)$/;
const bareSectionRegex =
  /^\s*(Section|Sec\.?|S\.|Article|Art\.?)\s*([0-9A-Za-z-]+)\s*$/i;
const pageRegex = /^Page\s+\d+\s+of\s+\d+/i;
const footnoteRegex =
  /^\s*\d+\s+(Subs\.|Sub\.|Omitted|Ins\.|Inserted|Added|Amended|Repealed|Renumbered)\b/i;
const contentsStartRegex = /^CONTENTS\b/i;
const contentsEndRegex =
  /^(An Act|AN ORDINANCE|WHEREAS|AND WHEREAS|NOW, THEREFORE|It is hereby enacted)/i;

const normalizeLine = (line) => {
  return line
    .replace(/\u00A0/g, " ")
    .replace(/\u200B/g, "")
    .replace(/[–—]/g, "-")
    .replace(/^(\d+)\s*\[(\d+)\./, "$2.")
    .replace(/^\[(\d+)\./, "$1.")
    .replace(/^(\d+)\.(\S)/, "$1. $2")
    .replace(/\s+/g, " ")
    .trim();
};

const isLikelySectionHeading = (line, prevLine, loose) => {
  if (!line || pageRegex.test(line)) {
    return false;
  }

  if (labelRegex.test(line)) {
    return true;
  }

  if (bareSectionRegex.test(line)) {
    return true;
  }

  if (!numberRegex.test(line)) {
    return false;
  }

  if (footnoteRegex.test(line)) {
    return false;
  }

  if (!prevLine) {
    return true;
  }

  if (/PART|CHAPTER|SECTIONS/i.test(prevLine)) {
    return true;
  }

  return loose;
};

const parseHeading = (line, nextLine) => {
  const labelMatch = line.match(labelRegex);
  if (labelMatch) {
    const number = labelMatch[2].trim();
    let heading = (labelMatch[3] || "").trim();
    if (!heading && nextLine) {
      heading = nextLine.trim();
    }
    return {
      label: `${labelMatch[1]} ${number}`,
      number,
      heading,
    };
  }

  const bareMatch = line.match(bareSectionRegex);
  if (bareMatch) {
    const number = bareMatch[2].trim();
    const heading = (nextLine || "").trim();
    return {
      label: `${bareMatch[1]} ${number}`,
      number,
      heading,
    };
  }

  const numberMatch = line.match(numberRegex);
  if (numberMatch) {
    const number = numberMatch[1].trim();
    const heading = numberMatch[2].trim();
    return {
      label: `Section ${number}`,
      number,
      heading,
    };
  }

  return null;
};

const splitWithHeuristics = (lines, loose) => {
  const sections = [];
  let current = null;
  let orderIndex = 0;
  let inContents = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = normalizeLine(lines[i]);
    const prevLine = i > 0 ? normalizeLine(lines[i - 1]) : "";
    const nextLine = i + 1 < lines.length ? normalizeLine(lines[i + 1]) : "";

    if (contentsStartRegex.test(line)) {
      inContents = true;
      continue;
    }

    if (inContents) {
      if (contentsEndRegex.test(line)) {
        inContents = false;
      }
      continue;
    }

    if (pageRegex.test(line)) {
      continue;
    }

    if (!line) {
      if (current) {
        current.text += "\n";
      }
      continue;
    }

    if (isLikelySectionHeading(line, prevLine, loose)) {
      if (current) {
        current.text = current.text.trim();
        sections.push(current);
      }

      const headingInfo = parseHeading(line, nextLine);
      if (!headingInfo) {
        continue;
      }

      orderIndex += 1;
      current = {
        ...headingInfo,
        text: "",
        orderIndex,
      };

      continue;
    }

    if (current) {
      current.text += `${line}\n`;
    }
  }

  if (current) {
    current.text = current.text.trim();
    sections.push(current);
  }

  return sections;
};

export const splitSections = (text) => {
  const lines = text.split("\n");
  const strictSections = splitWithHeuristics(lines, false);
  const looseSections = splitWithHeuristics(lines, true);

  return looseSections.length >= strictSections.length
    ? looseSections
    : strictSections;
};
