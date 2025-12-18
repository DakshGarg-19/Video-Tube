import { Schema, model } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      // one who is subscribing
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    channel: {
      // one to whom 'subscriber' is subscribing
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Enforce one subscription per user per channel
subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });

// Optional but smart: prevent self-subscription
subscriptionSchema.pre("save", function (next) {
  if (this.subscriber.equals(this.channel)) {
    return next(new ApiError(400, "User cannot subscribe to themselves"));
  }
  next();
});

export const Subscription = model("Subscription", subscriptionSchema);
