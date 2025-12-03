// export const asyncHandler = (fn) => {
//   return async (req, res, next) => {
//     try {
//       await fn(req, res, next);
//     } catch (error) {
//       next(error);
//     }
//   };
// };

// Async-await based
export const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    // Check for statusCode first, then code, then default to 500
    const statusCode = error.statusCode || error.code || 500;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// Promise based
// export const asyncHandler = (requestHandler) => {
//   (req, res, next) => {
//     Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
//   };
// };
