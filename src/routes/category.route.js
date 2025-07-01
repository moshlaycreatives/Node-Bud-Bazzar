// ╔══════════════════════════╗
// ║      Express Router      ║
// ╚══════════════════════════╝
import { Router } from "express";
const categoryRouter = Router();

// ╔═══════════════════════╗
// ║      Middlewares      ║
// ╚═══════════════════════╝
import {
  trimBodyObject,
  requiredFields,
  upload,
  loginAuth,
  adminAuth,
} from "../middlewares/index.js";

// ╔═══════════════════════╗
// ║      Controllers      ║
// ╚═══════════════════════╝
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

// ╔═══════════════════════════════════════╗
// ║      Create + Get All Categories      ║
// ╚═══════════════════════════════════════╝
categoryRouter
  .route("/")
  .post(
    loginAuth,
    adminAuth,
    upload.single("image"),
    trimBodyObject,
    requiredFields(["name", "productType"]),
    createCategory
  )
  .get(getAllCategories);

// ╔════════════════════════════════════════════════╗
// ║      Get + Update + Delete Category by ID      ║
// ╚════════════════════════════════════════════════╝
categoryRouter
  .route("/:id")
  .get(getCategoryById)
  .put(
    loginAuth,
    adminAuth,
    upload.single("image"),
    trimBodyObject,
    requiredFields(["name", "productType"]),
    updateCategory
  )
  .delete(loginAuth, adminAuth, deleteCategory);

export { categoryRouter };
