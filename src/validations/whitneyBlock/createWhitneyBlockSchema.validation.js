import Joi from "joi";

export const createWhitneyBlockSchema = Joi.object({
  firstName: Joi.string().trim().min(3).max(50).required().messages({
    "any.required": "First name is required",
    "string.empty": "First name is not allowed to be empty",
    "string.min": "First name must be at least 3 characters long",
    "string.max": "First name must be less than or equal to 50 characters long",
  }),

  lastName: Joi.string().trim().required().messages({
    "any.required": "Last name is required",
    "string.empty": "Last name is not allowed to be empty",
  }),

  address: Joi.string().trim().required().messages({
    "any.required": "Address is required",
    "string.empty": "Address is not allowed to be empty",
  }),

  strAptBid: Joi.string().trim().allow("").optional(),

  city: Joi.string().trim().required().messages({
    "any.required": "City is required",
    "string.empty": "City is not allowed to be empty",
  }),

  state: Joi.string().trim().required().messages({
    "any.required": "State is required",
    "string.empty": "State is not allowed to be empty",
  }),

  zipCode: Joi.string()
    .trim()
    .pattern(/^\d{5}(-\d{4})?$/)
    .required()
    .messages({
      "any.required": "Zip code is required",
      "string.empty": "Zip code is not allowed to be empty",
      "string.pattern.base": "Please enter a valid zip code.",
    }),

  phoneNo: Joi.string()
    .trim()
    .pattern(/^\+?[\d\s\-\(\)]+$/)
    .required()
    .messages({
      "any.required": "Phone number is required",
      "string.empty": "Phone number is not allowed to be empty",
      "string.pattern.base": "Please enter a valid phone number.",
    }),

  note: Joi.string().trim().allow("").optional(),
});
