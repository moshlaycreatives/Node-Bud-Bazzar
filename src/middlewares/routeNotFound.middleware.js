import { NotFoundException } from "../errors/index.js";

// ╔═════════════════════════════════════════════════╗
// ║      Middleware : Route note found handler      ║
// ╚═════════════════════════════════════════════════╝
export const routeNotFound = (req, res) => {
  console.error("Route doesn't found");
  throw new NotFoundException("Route doesn't found");
};
