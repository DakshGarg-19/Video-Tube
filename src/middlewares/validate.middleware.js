import { ApiError } from "../utils/ApiError.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import fs from "fs";

const deleteLocalFiles = (req) => {
  if (req.files) {
    // req.files is an object where keys are field names (avatar, coverImage)
    // and values are arrays of file objects.
    Object.values(req.files)
      .flat()
      .forEach((file) => {
        // file.path is the local path Multer saved the file to
        fs.unlinkSync(file.path, (err) => {
          if (err) {
            // Log the error but don't stop the validation error from being thrown
            console.error("Error deleting local file:", file.path, err);
          } else {
            console.log("Successfully deleted local file:", file.path);
          }
        });
      });
  }
  // Also check for single files if you ever use upload.single
  if (req.file) {
    fs.unlinkSync(req.file.path, (err) => {
      if (err)
        console.error("Error deleting single local file:", req.file.path, err);
    });
  }
};

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
      // 1. File deletion when validation error occurs
      deleteLocalFiles(req);
      // 2. Re-throw the validation error with a 400 status
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
