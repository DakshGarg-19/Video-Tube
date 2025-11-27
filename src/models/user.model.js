import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullname: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String, // cloudinary url or url from google oAuth
    required: true,
  },
  coverImage: {
    type: String,
  },
  watchHistory: {
    type: Schema.Types.ObjectId,
    ref: "watchHistory"
  },
});

export const User = model("User", userSchema);
