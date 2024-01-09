import { v4 as uuidv4 } from "uuid";
// import { UserModel } from "../models/user.model.js";
// import errorCreator from "./errorCreator.js";

export function createCSRF() {
  return uuidv4();
}

// export async function refreshCSRF(csrf, uid) {
//   if (!csrf || !uid) return console.log("CSRF-Key or UID not entered!");

//   try {
//     const user = await UserModel.findById(uid);

//     if (!user) return next(errorCreator("User not found!", 401));
//     if (csrf !== user.csrf)
//       return next(errorCreator("Invalid CSRF-token", 401));

//     const newCSRF = uuidv4();
//     await UserModel.findByIdAndUpdate({ _id: uid }, { csrf: newCSRF });

//     return newCSRF;
//   } catch (err) {
//     console.log("refreshCSRF error:", err);
//   }
// }
