import { ApiResponce } from "./apiResponce.util.js";

export const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    console.error(error);
    const statusCode =
      typeof error.statusCode === "number" &&
      error.statusCode >= 100 &&
      error.statusCode < 600
        ? error.statusCode
        : 500;

    res.status(statusCode).json(
      new ApiResponce({
        statusCode,
        message: error.message || "Internal Server Error",
        ...error,
      })
    );
  }
};
