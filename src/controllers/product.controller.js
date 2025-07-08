import { ProductModel } from "../models/product.model.js";
import {
  ConflictException,
  NotFoundException,
  UnAuthorizedException,
} from "../errors/index.js";
import { ApiResponce, asyncHandler } from "../utils/index.js";
import { ACCOUNT_TYPE, STATUS } from "../constants/index.js";

// ╔═══════════════════════════╗
// ║      Add New Product      ║
// ╚═══════════════════════════╝
export const addProduct = asyncHandler(async (req, res) => {
  const {
    productName,
    description,
    sellerPrice,
    productCategory,
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
    cannabinoidType,
    strainType,
    growType,
    productType: req.loggedInUser.productType,
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

// ╔════════════════════════════════════════════╗
// ║      Get All Products (Without Signin)     ║
// ╚════════════════════════════════════════════╝
export const getAllProductsWithoutSignIn = asyncHandler(async (req, res) => {
  const allProducts = await ProductModel.find({
    productStatus: STATUS.PRODUCT.APPROVED,
  });

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message:
        allProducts.length > 0
          ? "Products fetched successfully."
          : "Products collection is empty.",
      data: allProducts.length > 0 ? allProducts : [],
    })
  );
});

// ╔═══════════════════════════════╗
// ║      Get Seller Products      ║
// ╚═══════════════════════════════╝
export const getSellerProducts = asyncHandler(async (req, res) => {
  const allProducts = await ProductModel.find({
    sellerId: req.userId,
  });

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message:
        allProducts.length > 0
          ? "Products fetched successfully."
          : "Products collection is empty.",
      data: allProducts.length > 0 ? allProducts : [],
    })
  );
});

// ╔═════════════════════════════════════════╗
// ║      Get All Products (With Signin)     ║
// ╚═════════════════════════════════════════╝
export const getAllProducts = asyncHandler(async (req, res) => {
  const { productType } = req.loggedInUser;

  if (!productType) {
    throw new NotFoundException("Logged In user's productType not found.");
  }

  const allProducts = await ProductModel.find({
    productStatus: STATUS.PRODUCT.APPROVED,
    productType,
  });

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message:
        allProducts.length > 0
          ? "Products fetched successfully."
          : "Products collection is empty.",
      data: allProducts.length > 0 ? allProducts : [],
    })
  );
});

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// >>      ADMIN CONTROLLERS      >>
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// ╔═════════════════════════════╗
// ║      Add Profit Margin      ║
// ╚═════════════════════════════╝
export const addProfitMargin = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { profitMargin } = req.body;

  const product = await ProductModel.findOne({ _id: productId });

  if (!product) {
    throw new NotFoundException("Product not found.");
  }

  if (product.profitMargin > 0) {
    throw new ConflictException("Profit margin already added.");
  }

  product.profitMargin = profitMargin;
  product.productStatus = STATUS.PRODUCT.APPROVED;

  await product.save();

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "Profit margin added successfully.",
    })
  );
});

// ╔════════════════════════════════╗
// ║      Update Profit Margin      ║
// ╚════════════════════════════════╝
export const updateProfitMargin = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { profitMargin } = req.body;

  const product = await ProductModel.findOne({ _id: productId });

  if (!product) {
    throw new NotFoundException("Product not found.");
  }

  if (product.productStatus !== STATUS.PRODUCT.APPROVED) {
    throw new ConflictException(
      `Profit margin can't be updated because product status is ${product.productStatus}`
    );
  }

  product.profitMargin = profitMargin;

  await product.save();

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "Profit margin updated successfully.",
    })
  );
});

// ╔══════════════════════════╗
// ║      Delete Product      ║
// ╚══════════════════════════╝
export const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (
    req.userRole !== ACCOUNT_TYPE.ADMIN &&
    req.userRole !== ACCOUNT_TYPE.SELLER
  ) {
    throw new UnAuthorizedException("Invalid user role.");
  }

  const product = await ProductModel.findOne({
    _id: productId,
  });

  if (!product) {
    throw new NotFoundException("Product not found.");
  }

  if (
    req.userRole === ACCOUNT_TYPE.SELLER &&
    req.userId.toString() !== product.sellerId.toString()
  ) {
    throw new UnAuthorizedException("Unauthorized seller.");
  }

  await ProductModel.findOneAndDelete({ _id: productId });

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "Product deleted successfully.",
    })
  );
});
