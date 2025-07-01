import { Router } from "express";
import { trimBodyObject, requiredFields } from "../middlewares/index.js";

import {
  getAllUsers,
  getUser,
  updateAccountStatus,
} from "../controllers/admin.controller.js";

const adminRouter = Router();

// ╔═════════════════════════╗
// ║      Get All Users      ║
// ╚═════════════════════════╝
adminRouter.route("/").get(getAllUsers);

// ╔══════════════════════════╗
// ║      Get User by ID      ║
// ╚══════════════════════════╝
adminRouter.route("/:id").get(getUser);

// ╔═══════════════════════════════════════════════════════╗
// ║      Update Account Status (APPROVED / REJECTED)      ║
// ╚═══════════════════════════════════════════════════════╝
adminRouter
  .route("/:id")
  .patch(trimBodyObject, requiredFields(["status"]), updateAccountStatus);

export { adminRouter };
