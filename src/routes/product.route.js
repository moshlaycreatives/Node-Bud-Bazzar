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
import {
  addProduct,
  addProfitMargin,
  deleteProduct,
  getAllProducts,
  getAllProductsWithoutSignIn,
  getSellerProducts,
  updateProfitMargin,
} from "../controllers/product.controller.js";

// ╔═══════════════════════════════════════════════════╗
// ║      Add + Get All Products (Without Signin)      ║
// ╚═══════════════════════════════════════════════════╝
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
      "cannabinoidType",
      "strainType",
      "growType",
    ]),
    addProduct
  )
  .get(getAllProductsWithoutSignIn);

// ╔═══════════════════════════════╗
// ║      Get Seller Products      ║
// ╚═══════════════════════════════╝
productRouter
  .route("/get-seller-products")
  .get(loginAuth, sellerAuth, getSellerProducts);

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║      Get All Products (According to Loggedin User's Product Category)      ║
// ╚════════════════════════════════════════════════════════════════════════════╝
productRouter.route("/get-all-products").get(loginAuth, getAllProducts);

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>
// >>      ADMIN Routes      >>
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<
// ╔═════════════════════════════╗
// ║      Add Profit Margin      ║
// ╚═════════════════════════════╝
productRouter
  .route("/add-profit-margin/:productId")
  .patch(
    loginAuth,
    adminAuth,
    trimBodyObject,
    requiredFields(["profitMargin"]),
    addProfitMargin
  );

// ╔════════════════════════════════╗
// ║      Update Profit Margin      ║
// ╚════════════════════════════════╝
productRouter
  .route("/update-profit-margin/:productId")
  .patch(
    loginAuth,
    adminAuth,
    trimBodyObject,
    requiredFields(["profitMargin"]),
    updateProfitMargin
  );

// ╔════════════════════════════════╗
// ║      Delete Profit Margin      ║
// ╚════════════════════════════════╝
productRouter
  .route("/delete-product/:productId")
  .delete(loginAuth, deleteProduct);

export { productRouter };
