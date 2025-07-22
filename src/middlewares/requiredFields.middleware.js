import { BadRequestException } from "../errors/index.js";

// ╔══════════════════════════════════════════════╗
// ║      Middleware : Check Required Fields      ║
// ╚══════════════════════════════════════════════╝
export const requiredFields = (requiredFields) => (req, res, next) => {
  const missingFields = [];
  const emptyFields = [];

  const isEmpty = (value) => {
    return (
      (typeof value === "string" && value.trim() === "") ||
      (typeof value === "object" &&
        !Array.isArray(value) &&
        Object.keys(value).length === 0) ||
      (Array.isArray(value) && value.length === 0)
    );
  };

  const checkField = (fieldPath, obj) => {
    const keys = fieldPath.split(".");
    let current = obj;

    for (const key of keys) {
      if (!current || current[key] === undefined || current[key] === null) {
        missingFields.push(fieldPath);
        return;
      }
      current = current[key];
    }

    if (isEmpty(current)) {
      emptyFields.push(fieldPath);
    }
  };

  for (const field of requiredFields) {
    checkField(field, req.body);
  }

  if (missingFields.length || emptyFields.length) {
    const messages = [];

    if (missingFields.length) {
      const list = formatList(missingFields);
      messages.push(
        `Missing required field${missingFields.length > 1 ? "s" : ""}: ${list}`
      );
    }

    if (emptyFields.length) {
      const list = formatList(emptyFields);
      messages.push(`Fields cannot be empty: ${list}`);
    }

    throw new BadRequestException(messages.join(" | "));
  }

  next();
};

// Helper: Format list with commas and "and"
const formatList = (fields) => {
  if (fields.length === 1) return fields[0];
  return fields.slice(0, -1).join(", ") + " and " + fields[fields.length - 1];
};

// ╔═══════════════════════════════════╗
// ║      Sample How To Pass Data      ║
// ╚═══════════════════════════════════╝
/*
checkRequiredFields([
  "companyName",
  "clientName",
  "date",
  "order.products", // Check required filed "products" in order object
])
*/
