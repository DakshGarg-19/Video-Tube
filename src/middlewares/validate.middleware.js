import { ApiError } from "../utils/ApiError.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

export const validate = (schema) =>
  asyncHandler(async (req, res, next) => {
    try {
      const data = await schema.validate(req.body, {
        abortEarly: false, // collect all errors
        stripUnknown: true, // remove extra fields
      });

      req.body = data; // sanitized data
      next(); // move to next middleware / controller
    } catch (error) {
      throw new ApiError(400, error.errors?.[0] || "Invalid input");
    }
  });
