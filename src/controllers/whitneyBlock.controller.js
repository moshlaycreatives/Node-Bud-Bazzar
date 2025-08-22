import { WhitneyBlockModel } from "../models/whitneyBlock.model.js";
import { asyncHandler, ApiResponce } from "../utils/index.js";
import { NotFoundException, BadRequestException } from "../errors/index.js";
import { isValidObjectId } from "mongoose";

// ╔════════════════════════════════╗
// ║      Create WhitneyBlock       ║
// ╚════════════════════════════════╝
export const createWhitneyBlock = asyncHandler(async (req, res) => {
  const newWhitneyBlock = await WhitneyBlockModel.create({
    userId: req.userId,
    ...req.body,
  });

  return res.status(201).json(
    new ApiResponce({
      statusCode: 201,
      message: "WhitneyBlock created successfully.",
      data: newWhitneyBlock,
    })
  );
});

// ╔════════════════════════════════╗
// ║      Get All WhitneyBlocks     ║
// ╚════════════════════════════════╝
export const getAllWhitneyBlocks = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const whitneyBlocks = await WhitneyBlockModel.find({ userId: userId }).sort({
    createdAt: -1,
  });

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message:
        whitneyBlocks.length > 0
          ? "WhitneyBlocks fetched successfully."
          : "WhitneyBlocks collection is empty.",
      data: whitneyBlocks.length > 0 ? whitneyBlocks : [],
    })
  );
});

// ╔════════════════════════════════╗
// ║      Get WhitneyBlock By ID    ║
// ╚════════════════════════════════╝
export const getWhitneyBlockById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new BadRequestException("WhitneyBlock ID is not a valid MongoDB ID.");
  }

  const whitneyBlock = await WhitneyBlockModel.findOne({
    _id: id,
  });

  if (!whitneyBlock) {
    throw new NotFoundException("WhitneyBlock not found.");
  }

  if (whitneyBlock.userId.toString() !== req.userId.toString()) {
    throw new BadRequestException(
      "You do not have permission to access this WhitneyBlock."
    );
  }

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "WhitneyBlock fetched successfully.",
      data: whitneyBlock,
    })
  );
});
