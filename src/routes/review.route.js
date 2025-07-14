// ╔══════════════════════════╗
// ║      Express Router      ║
// ╚══════════════════════════╝
import { Router } from "express";
const reviewRouter = Router();

// ╔═══════════════════════╗
// ║      Middlewares      ║
// ╚═══════════════════════╝
import {
  adminAuth,
  emailValidator,
  loginAuth,
  requiredFields,
  trimBodyObject,
} from "../middlewares/index.js";

// ╔═══════════════════════╗
// ║      Controllers      ║
// ╚═══════════════════════╝
import {
  getAllReviewsByProductId,
  getRequestedReviews,
  submitReview,
  updateReviewStatus,
} from "../controllers/review.controller.js";

// ╔═════════════════════════╗
// ║      Submit Review      ║
// ╚═════════════════════════╝
reviewRouter
  .route("/submit-review")
  .post(
    loginAuth,
    trimBodyObject,
    requiredFields([
      "clientId",
      "productId",
      "rating",
      "name",
      "email",
      "review",
    ]),
    emailValidator,
    submitReview
  );

// ╔════════════════════════════════════════════════════╗
// ║      Get All Reviews (For Individual Product)      ║
// ╚════════════════════════════════════════════════════╝
reviewRouter.route("/get-review/:productId").get(getAllReviewsByProductId);

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// >>               ADMIN ROUTES               >>
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// ╔═════════════════════════════════════╗
// ║      Get All Requested Reviews      ║
// ╚═════════════════════════════════════╝
reviewRouter
  .route("/requested-reviews")
  .get(loginAuth, adminAuth, getRequestedReviews);

// ╔═════════════════════════════════════════════════════╗
// ║      Update Review Status (APPROVED or REJECT)      ║
// ╚═════════════════════════════════════════════════════╝
reviewRouter
  .route("/update-review-status")
  .patch(
    loginAuth,
    adminAuth,
    requiredFields(["reviewId", "status"]),
    updateReviewStatus
  );
export { reviewRouter };
