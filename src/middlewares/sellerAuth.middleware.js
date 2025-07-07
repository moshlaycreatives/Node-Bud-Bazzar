import { ForbiddenException } from "../errors/index.js";

// ╔════════════════════════════════════╗
// ║      Middleware : Seller Auth      ║
// ╚════════════════════════════════════╝
export const sellerAuth = async (req, res, next) => {
  if (req.userRole !== "SELLER") {
    console.error("Invalid role.");
    throw new ForbiddenException("Invalid role");
  }

  next();
};
