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
      next();
    } catch (error) {
      // Check if the error is a Yup Validation Error
      if (error.name === "ValidationError") {
        // Yup returns an array of errors in 'error.errors'
        // Join them to create a single readable message
        const errorMessage = error.errors.join(", ");

        // Throw your custom ApiError with 400 (Bad Request)
        throw new ApiError(400, errorMessage);
      }

      // If it's a different type of error, rethrow it (asyncHandler will catch it)
      throw error;
    }
  });
