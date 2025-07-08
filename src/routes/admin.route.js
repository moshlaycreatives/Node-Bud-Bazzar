import { Router } from "express";
import { trimBodyObject, requiredFields } from "../middlewares/index.js";

import {
  getAccountRequests,
  getAllApprovedUsers,
  getUser,
  updateAccountStatus,
} from "../controllers/admin.controller.js";

const adminRouter = Router();

// ╔════════════════════════════════╗
// ║      Get Account Requests      ║
// ╚════════════════════════════════╝
adminRouter.route("/account-requests").get(getAccountRequests);

// ╔══════════════════════════════════╗
// ║      Get All Approved Users      ║
// ╚══════════════════════════════════╝
adminRouter.route("/").get(getAllApprovedUsers);

// ╔══════════════════════════╗
// ║      Get User by ID      ║
// ╚══════════════════════════╝
adminRouter.route("/user/:id").get(getUser);

// ╔═══════════════════════════════════════════════════════╗
// ║      Update Account Status (APPROVED / REJECTED)      ║
// ╚═══════════════════════════════════════════════════════╝
adminRouter
  .route("/user/:id")
  .patch(trimBodyObject, requiredFields(["status"]), updateAccountStatus);

export { adminRouter };
