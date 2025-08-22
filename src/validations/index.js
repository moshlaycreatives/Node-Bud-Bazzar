import Joi from "joi";
import { ApiResponce } from "../utils/index.js";
import * as whitneyBlock from "./whitneyBlock/index.js";

/**
 * @param {Joi.Schema}
 * @returns {(req, res, next) => void}
 */
export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  console.log(error);
  if (error) {
    const errorMessages = error.details
      .map((detail) => detail.message)
      .join(", ");

    return res.status(400).json(
      new ApiResponce({
        statusCode: 400,
        message: `Validation Error: ${errorMessages}`,
      })
    );
  }

  next();
};

export { whitneyBlock };
