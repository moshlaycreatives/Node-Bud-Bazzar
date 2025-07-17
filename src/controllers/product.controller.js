import { ProductModel } from "../models/product.model.js";
import {
  ConflictException,
  NotFoundException,
  UnAuthorizedException,
} from "../errors/index.js";
import { ApiResponce, asyncHandler } from "../utils/index.js";
import { ACCOUNT_TYPE, PRODUCT_TAGS, STATUS } from "../constants/index.js";

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

  const newProduct = await ProductModel.create({
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
      data: newProduct,
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

// ╔════════════════════════════════════╗
// ║      Update Product by Seller      ║
// ╚════════════════════════════════════╝
export const updateProductBySeller = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const {
    productName,
    description,
    productCategory,
    cannabinoidType,
    strainType,
    growType,
  } = req.body;

  const product = await ProductModel.findOne({ _id: productId });

  if (!product) {
    throw new NotFoundException("Product not found.");
  }

  if (product.sellerId.toString() !== req.userId.toString()) {
    throw new UnAuthorizedException("Unauthorized seller.");
  }

  if (req.body.sellerPrice && req.body.sellerPrice !== product.sellerPrice) {
    product.productStatus = STATUS.PRODUCT.PENDING;
    product.sellerPrice = req.body.sellerPrice;
    await product.save();
  } else {
    product.sellerPrice = product.sellerPrice;
  }

  if (req.files["image"]) {
    product.productImage =
      process.env.BACKEND_BASE_URL +
      req.files["image"][0].path.replace(/\\/g, "/");
  }

  if (req.files["documents"]) {
    product.labReport =
      process.env.BACKEND_BASE_URL +
      req.files["documents"][0].path.replace(/\\/g, "/");
  }

  product.productName = productName || product.productName;
  product.description = description || product.description;
  product.productCategory = productCategory || product.productCategory;
  product.cannabinoidType = cannabinoidType || product.cannabinoidType;
  product.strainType = strainType || product.strainType;
  product.growType = growType || product.growType;

  await product.save();

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "Product updated successfully.",
      data: product,
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

// ╔════════════════════════════╗
// ║      Add Product Tags      ║
// ╚════════════════════════════╝
export const addProductTags = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { productTag } = req.body;

  if (typeof productTag !== "string") {
    throw new NotFoundException("Product tag must be a string.");
  }

  if (!Object.values(PRODUCT_TAGS).slice(1).includes(productTag)) {
    throw new NotFoundException("Invalid product tag.");
  }

  const product = await ProductModel.findOne({ _id: productId });

  if (!product) {
    throw new NotFoundException("Product not found.");
  }

  if (product.productTags.includes(productTag)) {
    throw new ConflictException("Product tag already exists.");
  }

  product.productTags.push(productTag);
  await product.save();

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "Product tag added successfully.",
    })
  );
});
