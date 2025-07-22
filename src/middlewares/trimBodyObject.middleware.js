// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║      Middleware : Trim body object also for nested fields in objects      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
export const trimBodyObject = (req, res, next) => {
  const trimFields = (obj) => {
    if (typeof obj === "object" && obj !== null) {
      for (const key in obj) {
        if (typeof obj[key] === "string") {
          obj[key] = obj[key].trim();
        } else if (Array.isArray(obj[key])) {
          obj[key] = obj[key].map((item) => trimFields(item));
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          trimFields(obj[key]);
        }
      }
    }
    return obj;
  };

  req.body = trimFields(req.body);

  next();
};
