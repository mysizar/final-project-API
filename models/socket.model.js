import { Schema, model } from "mongoose";

const SocketSchema = new Schema({
  sessionID: { type: String, required: true },
  userID: { type: String, required: true },
  username: { type: String, required: true },
});

export const SocketModel = model("socket", SocketSchema);
