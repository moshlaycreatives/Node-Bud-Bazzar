import { CategoryModel } from "../models/category.model.js";
import { asyncHandler, ApiResponce } from "../utils/index.js";
import { NotFoundException, BadRequestException } from "../errors/index.js";
import { PRODUCT_TYPE } from "../constants/index.js";

// ╔═══════════════════════════╗
// ║      Create Category      ║
// ╚═══════════════════════════╝
export const createCategory = asyncHandler(async (req, res) => {
  const { name, productType } = req.body;

  if (!req.file) {
    throw new BadRequestException("Category image is required.");
  }

  if (!PRODUCT_TYPE.includes(productType)) {
    throw new BadRequestException("Invalid product type.");
  }

  const existing = await CategoryModel.findOne({
    name: { $regex: name, $options: "i" },
  });

  if (existing) {
    throw new BadRequestException("Category name already taken.");
  }

  const imagePath = `${process.env.BACKEND_BASE_URL}/${req.file.path.replace(
    /\\/g,
    "/"
  )}`;

  const category = await CategoryModel.create({
    name,
    image: imagePath,
    productType,
  });

  return res.status(201).json(
    new ApiResponce({
      statusCode: 201,
      message: "Category created successfully.",
      data: category,
    })
  );
});

// ╔══════════════════════════════╗
// ║      Get All Categories      ║
// ╚══════════════════════════════╝
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await CategoryModel.find().sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "Categories fetched successfully.",
      data: categories,
    })
  );
});

// ╔══════════════════════════════╗
// ║      Get Category by ID      ║
// ╚══════════════════════════════╝
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await CategoryModel.findById(req.params.id);

  if (!category) throw new NotFoundException("Category not found.");

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "Category fetched successfully.",
      data: category,
    })
  );
});

// ╔═══════════════════════════╗
// ║      Update Category      ║
// ╚═══════════════════════════╝
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, productType } = req.body;
  const { id } = req.params;

  if (!PRODUCT_TYPE.includes(productType)) {
    throw new BadRequestException("Invalid product type.");
  }

  const category = await CategoryModel.findById(id);

  if (!category) {
    throw new NotFoundException("Category not found.");
  }

  if (req.file) {
    category.image = `${process.env.BACKEND_BASE_URL}/${req.file.path.replace(
      /\\/g,
      "/"
    )}`;
  }

  category.name = name;
  category.productType = productType;

  await category.save();

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "Category updated successfully.",
      data: category,
    })
  );
});

// ╔═══════════════════════════╗
// ║      Delete Category      ║
// ╚═══════════════════════════╝
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await CategoryModel.findById(id);
  if (!category) throw new NotFoundException("Category not found.");

  await CategoryModel.findByIdAndDelete(id);

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "Category deleted successfully.",
    })
  );
});
