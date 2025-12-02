import { asyncHandler } from "../utils/asyncHandler.util.js";

export const registerUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "ok",
  });
});
