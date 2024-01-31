import { Schema, model } from "mongoose";

const MessageSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  from: { type: String, required: true },
  to: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: Date, required: true },
  offline: Boolean,
});

export const MessageModel = model("message", MessageSchema);
