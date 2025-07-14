import { ReviewModel } from "../models/review.model.js";
import { BadRequestException, NotFoundException } from "../errors/index.js";
import { ApiResponce, asyncHandler } from "../utils/index.js";
import { STATUS } from "../constants/index.js";
import mongoose from "mongoose";

// ╔═════════════════════════╗
// ║      Submit Review      ║
// ╚═════════════════════════╝
export const submitReview = asyncHandler(async (req, res) => {
  const { clientId, productId, rating, name, email, review } = req.body;

  const newReview = await ReviewModel.create({
    clientId,
    productId,
    rating,
    name,
    email,
    review,
  });

  return res.status(201).json(
    new ApiResponce({
      statusCode: 201,
      message:
        "Review submited successfully, But show when admin will approved your review.",
      data: newReview,
    })
  );
});

// ╔════════════════════════════════════════════════════╗
// ║      Get All Reviews (For Individual Product)      ║
// ╚════════════════════════════════════════════════════╝
export const getAllReviewsByProductId = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new BadRequestException("Invalid productId format.");
  }

  const reviewsData = await ReviewModel.aggregate([
    {
      $match: {
        productId: new mongoose.Types.ObjectId(productId),
        reviewStatus: STATUS.RATING.APPROVED,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "clientId",
        foreignField: "_id",
        as: "clientDetails",
      },
    },
    {
      $unwind: {
        path: "$clientDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $unwind: {
        path: "$productDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$productId",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        reviews: {
          $push: {
            _id: "$_id",
            rating: "$rating",
            name: "$name",
            email: "$email",
            review: "$review",
            createdAt: "$createdAt",
            client: {
              firstName: "$clientDetails.firstName",
              lastName: "$clientDetails.lastName",
              companyName: "$clientDetails.companyName",
              email: "$clientDetails.email",
              productType: "$clientDetails.productType",
            },
          },
        },
        product: { $first: "$productDetails" },
      },
    },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        averageRating: { $round: ["$averageRating", 1] },
        totalReviews: 1,
        reviews: 1,
        product: {
          _id: "$product._id",
          id: "$product.id",
          productName: "$product.productName",
          productImage: "$product.productImage",
          productType: "$product.productType",
          cannabinoidType: "$product.cannabinoidType",
          strainType: "$product.strainType",
          growType: "$product.growType",
          sellerPrice: "$product.sellerPrice",
        },
      },
    },
  ]);

  if (!reviewsData || reviewsData.length === 0) {
    return res.status(200).json(
      new ApiResponce({
        statusCode: 200,
        message: "No approved reviews found for this product.",
        data: {
          averageRating: 0,
          totalReviews: 0,
          reviews: [],
          product: {},
        },
      })
    );
  }

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "Approved reviews with product and client details fetched.",
      data: reviewsData[0],
    })
  );
});

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// >>               ADMIN CONTROLLERS               >>
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// ╔═════════════════════════════════════╗
// ║      Get All Requested Reviews      ║
// ╚═════════════════════════════════════╝
export const getRequestedReviews = asyncHandler(async (req, res) => {
  const requestedReviews = await ReviewModel.find({
    reviewStatus: STATUS.RATING.PENDING,
  });

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message:
        requestedReviews.length > 0
          ? "Requested reviews feteched successfully."
          : "Review requests collection is empty.",

      data: requestedReviews.length > 0 ? requestedReviews : [],
    })
  );
});

// ╔═════════════════════════════════════════════════════╗
// ║      Update Review Status (APPROVED or REJECT)      ║
// ╚═════════════════════════════════════════════════════╝
export const updateReviewStatus = asyncHandler(async (req, res) => {
  const { reviewId, status } = req.body;

  if (!Object.values(STATUS.RATING).slice(-2).includes(status.toUpperCase())) {
    throw new BadRequestException("Invalid status value.");
  }

  const review = await ReviewModel.findOne({ _id: reviewId });

  if (!review) {
    throw new NotFoundException("Review not found.");
  }

  review.reviewStatus = status.toUpperCase();

  await review.save();

  return res.status(200).json(
    new ApiResponce({
      status: 200,
      message: "Review status updated successfully.",
      data: review,
    })
  );
});
