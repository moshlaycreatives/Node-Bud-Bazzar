// ╔══════════════════════════╗
// ║      Express Router      ║
// ╚══════════════════════════╝
import { Router } from "express";
const productRouter = Router();

// ╔═══════════════════════╗
// ║      Middlewares      ║
// ╚═══════════════════════╝
import {
  trimBodyObject,
  requiredFields,
  upload,
  loginAuth,
  adminAuth,
  sellerAuth,
} from "../middlewares/index.js";

// ╔═══════════════════════╗
// ║      Controllers      ║
// ╚═══════════════════════╝
import { addProduct } from "../controllers/product.controllers.js";

productRouter
  .route("/")
  .post(
    loginAuth,
    sellerAuth,
    upload.fields([{ name: "image", maxCount: 1 }, { name: "documents" }]),
    trimBodyObject,
    requiredFields([
      "productName",
      "description",
      "sellerPrice",
      "productCategory",
      "productType",
      "cannabinoidType",
      "strainType",
      "growType",
    ]),
    addProduct
  );

export { productRouter };
