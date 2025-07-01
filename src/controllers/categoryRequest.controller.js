import { CategoryRequestModel } from "../models/categoryRequest.model.js";
import { ApiResponce, asyncHandler } from "../utils/index.js";

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// >>      SELLER CONTROLLERS      >>
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// ╔════════════════════════════╗
// ║      Category Request      ║
// ╚════════════════════════════╝
export const createCategoryRequest = asyncHandler(async (req, res) => {
  const { categoryName } = req.body;

  await CategoryRequestModel.create({
    sellerId: req.userId,
    categoryName,
  });

  return res.status(201).json(
    new ApiResponce({
      statusCode: 201,
      message: "Category request sent successfully.",
    })
  );
});

// ╔══════════════════════════════════╗
// ║      Category Request By Id      ║
// ╚══════════════════════════════════╝
export const getCategoryRequestById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const categoryRequest = await CategoryRequestModel.findOne({ _id: id });

  if (!categoryRequest) {
    return res.status(400).json(
      new ApiResponce({
        statusCode: 400,
        message: "Category request not found.",
      })
    );
  }

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "Category request feteched successfully.",
      data: categoryRequest,
    })
  );
});

// ╔═════════════════════════════════════╗
// ║      Get All Category Requests      ║
// ╚═════════════════════════════════════╝
export const getAllCategoryRequests = asyncHandler(async (req, res) => {
  const allCategoryRequests = await CategoryRequestModel.find({});

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message:
        allCategoryRequests.length > 0
          ? "All category requests feteched successfully."
          : "Category requests collection is empty.",
      data: allCategoryRequests.length > 0 ? allCategoryRequests : [],
    })
  );
});

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// >>      ADMIN CONTROLLERS      >>
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// ╔═════════════════════════════════════════════╗
// ║      Get All Pending Category Requests      ║
// ╚═════════════════════════════════════════════╝
export const getAllPendingCategoryRequests = asyncHandler(async (req, res) => {
  const allPendingRequests = await CategoryRequestModel.find({
    status: { $eq: "PENDING" },
  });

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message:
        allPendingRequests.length > 0
          ? "All pending category requests feteched successfully."
          : "Pending category requests collection is empty.",
      data: allPendingRequests.length > 0 ? allPendingRequests : [],
    })
  );
});

// ╔═══════════════════════════════════╗
// ║      Reject Category Request      ║
// ╚═══════════════════════════════════╝
export const rejectCategoryRequest = asyncHandler(async (req, res) => {
  const { categoryRequestId, reason } = req.body;

  const categoryRequest = await CategoryRequestModel.findOne({
    _id: categoryRequestId,
  });

  if (!categoryRequest) {
    return res.status(400).json(
      new ApiResponce({
        statusCode: 400,
        message: "Category request not found.",
      })
    );
  }

  categoryRequest.reason = reason;
  await categoryRequest.save();

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "Category request rejected successfully",
    })
  );
});
