import { ProductModel } from "../models/product.model.js";
import { BadRequestException, NotFoundException } from "../errors/index.js";
import { ApiResponce, asyncHandler } from "../utils/index.js";

// ╔═══════════════════════════╗
// ║      Add New Product      ║
// ╚═══════════════════════════╝
export const addProduct = asyncHandler(async (req, res) => {
  const {
    productName,
    description,
    sellerPrice,
    productCategory,
    productType,
    cannabinoidType,
    strainType,
    growType,
  } = req.body;

  if (!req.files["image"]) {
    throw new NotFoundException("Product image is required.");
  }

  if (!req.files["documents"]) {
    throw new NotFoundException("Product lab report is required.");
  }

  req.body.productImage =
    process.env.BACKEND_BASE_URL +
    req.files["image"][0].path.replace(/\\/g, "/");

  req.body.labReport =
    process.env.BACKEND_BASE_URL +
    req.files["documents"][0].path.replace(/\\/g, "/");

  await ProductModel.create({
    productName,
    description,
    sellerPrice,
    productCategory,
    productType,
    cannabinoidType,
    strainType,
    growType,
    sellerId: req.userId,
    productImage: req.body.productImage,
    labReport: req.body.labReport,
  });

  return res.status(201).json(
    new ApiResponce({
      statusCode: 201,
      message:
        "Product added but in pending state, Wait untill admin approved it.",
    })
  );
});

// ╔═══════════════════════════╗
// ║      Get All Products     ║
// ╚═══════════════════════════╝
export const getAllProducts = asyncHandler(async (req, res) => {
  const allProducts = await ProductModel.find({
    productType: req.loggedInUser.productType,
  });
});

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// >>      ADMIN CONTROLLERS      >>
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// ╔═══════════════════════════╗
// ║      Add New Product      ║
// ╚═══════════════════════════╝
