import { v4 as uuidv4 } from "uuid";
import { UserModel } from "../models/user.model.js";

export function createCSRF() {
  return uuidv4();
}

export async function refreshCSRF(csrf, uid) {
  if (!csrf || !uid) return console.log("CSRF-Key or UID not entered!");

  try {
    const user = await UserModel.findOne({ csrf });
    if (user["_id"] !== uid) return console.log("Invalid CSRF-token");

    const newCSRF = uuidv4();
    await UserModel.updateOne({ _id: uid }, { csrf: newCSRF });

    return newCSRF;
  } catch (err) {
    console.log("refreshCSRF error:", err);
  }
}
