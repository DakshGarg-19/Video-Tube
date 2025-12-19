import { Schema, model } from "mongoose";

const watchHistorySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
      index: true,
    },
    watchedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

watchHistorySchema.index({ user: 1, watchedAt: -1 });

export const WatchHistory = model("WatchHistory", watchHistorySchema);
