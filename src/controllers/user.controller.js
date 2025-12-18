import { ApiError } from "../utils/ApiError.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import fs from "fs";
import { options } from "../constants.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    const updateUser = await User.findByIdAndUpdate(
      userId,
      { $set: { refreshToken } },
      { new: true, runValidators: true }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

// res doesn't need to be returned, express already does it.

export const registerUser = asyncHandler(async (req, res) => {
  // Get user details from frontend -> Username, Fullname, Email, Avatar, Password
  // Validation -> not empty
  // Check if already exist (using username or email or both)
  // Check for images, Check for avatar
  // Upload them to cloudinary , avatar check
  // Create user object - create entry in db
  // Remove password and refresh token field from response
  // Check for user creation
  // Return res

  // console.table(req.body);
  const { username, email, fullname, password } = req.body;

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    if (avatarLocalPath) fs.unlinkSync(avatarLocalPath);
    if (coverImageLocalPath) fs.unlinkSync(coverImageLocalPath);

    throw new ApiError(
      409,
      "User with similar username or email already exists"
    );
  }

  // console.log(req.files);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    username,
    email,
    fullname,
    avatar: { url: avatar.secure_url, publicId: avatar.public_id },
    coverImage: {
      url: coverImage?.secure_url || "",
      publicId: coverImage?.public_id,
    },
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  // req.body -> data
  // Check if user is registered (username or email or both)
  // Password check
  // Generate access token if they are registered
  // Generate refresh token and update db to save refresh token
  // Store access token and refresh token in cookie
  // Read access token from cookie
  // Validate access
  // Check if access token is expired
  // If it is, validate refresh token from cookie with db
  // Generate new access token and update the cookie
  // Refresh token rotation

  const { username, email, password } = req.body;

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // Making DB calls is expensive
  // const loggedInUser = await User.findById(user._id).select(
  //   "-password -refreshToken"
  // );

  const loggedInUser = user.toObject();
  delete loggedInUser.password;
  delete loggedInUser.refreshToken;

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

export const logOutUser = asyncHandler(async (req, res) => {
  const { user } = req;

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { $unset: { refreshToken: 1 } }, // setting field undefined removes it from the document
    { new: true, runValidators: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, { updatedUser }, "User logged out"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedIncomingRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedIncomingRefreshToken._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    if (error.name == "TokenExpiredError") {
      throw new ApiError(401, "Refresh token expired");
    }

    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  user.password = newPassword;
  // invalidate existing sessions
  user.refreshToken = undefined;
  await user.save();

  const sanitizedUser = user.toObject();
  delete sanitizedUser.password;
  delete sanitizedUser.refreshToken;

  return res
    .status(200)
    .clearCookie("refreshToken")
    .clearCookie("accessToken")
    .json(new ApiResponse(200, sanitizedUser, "Password changed successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "Current user fetched successfully");
});

export const updateAccountDetails = asyncHandler(async (req, res) => {
  const { username, email, fullname } = req.body;

  const updateFields = {};

  if (username !== undefined) updateFields.username = username;
  if (email !== undefined) updateFields.email = email;
  if (fullname !== undefined) updateFields.fullname = fullname;

  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "No fields provided for update");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Account updated successfully"));
});

export const updateUserAvatar = asyncHandler(async (req, res) => {
  // Step-by-step (battle-tested order)
  //  - Receive file → stored temporarily (disk / memory)
  //  - Upload new avatar to Cloudinary
  //  - Get secure_url and public_id
  //  - Update DB with new avatar URL + public_id
  //  - Delete old avatar from Cloudinary
  //  - Delete local temp file
  //  - If any step fails before step 4, the old avatar stays untouched. Safe.

  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  const oldAvatarPublicId = user.avatar?.publicId;

  const uploadedNewAvatar = await uploadOnCloudinary(avatarLocalPath);

  if (!uploadedNewAvatar?.secure_url) {
    throw new ApiError(500, "Avatar upload failed");
  }

  // Update DB first
  user.avatar = {
    url: uploadedNewAvatar.secure_url,
    publicId: uploadedNewAvatar.public_id,
  };

  await user.save();

  // Orphans must be rare, bounded, and discoverable
  if (oldAvatarPublicId) {
    cloudinary.uploader.destroy(oldAvatarPublicId).catch((err) => {
      console.error("Avatar cleanup failed:", err);
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

export const updateUserCoverImage = asyncHandler(async (req, res) => {
  // Step-by-step (battle-tested order)
  //  - Receive file → stored temporarily (disk / memory)
  //  - Upload new coverImage to Cloudinary
  //  - Get secure_url and public_id
  //  - Update DB with new coverImage URL + public_id
  //  - Delete old coverImage from Cloudinary
  //  - Delete local temp file
  //  - If any step fails before step 4, the old coverImage stays untouched. Safe.

  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }

  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  const oldCoverImagePublicId = user.coverImage?.publicId;

  const uploadedNewCoverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!uploadedNewCoverImage?.secure_url) {
    throw new ApiError(500, "Cover image upload failed");
  }

  // Update DB first
  user.coverImage = {
    url: uploadedNewCoverImage.secure_url,
    publicId: uploadedNewCoverImage.public_id,
  };

  await user.save();

  // Orphans must be rare, bounded, and discoverable
  if (oldCoverImagePublicId) {
    cloudinary.uploader.destroy(oldCoverImagePublicId).catch((err) => {
      console.error("Cover image cleanup failed:", err);
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

export const getUserChannelProfile = asyncHandler(async (req, res) => {
  let { username } = req.params;

  if (!username) {
    throw new ApiError(400, "Username is missing");
  }

  username = username?.trim()?.toLowerCase();

  const channel = await User.aggregate([
    {
      $match: { username },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        username: 1,
        email: 1,
        fullname: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        createdAt: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel does not exist")
  }

  return res.status(200).json(new ApiResponse(200, channel[0], "User channel fetched successfully"))
});

