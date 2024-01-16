import { Router } from "express";
import {
  login,
  logout,
  register,
  getAbout,
  getNewJWT,
  updateAbout,
  updateRating,
  updateFav,
  deleteFav,
  deleteUser,
  confirmRegister,
  updateEmail,
  confirmNewEmail,
} from "../controller/user.ctrl.js";
import checkInputs from "../lib/checkInputs.js";
import validation from "../middlewares/user/validation.mdw.js";
import verifyUser from "../middlewares/user/verification.mdw.js";
import refreshCSRF from "../middlewares/user/refreshCSRF.mdw.js";
import refreshJWT from "../middlewares/user/refreshJWT.mdw.js";
import { sendEmail } from "../config/mail.connect.js";

export const userRouter = Router();

userRouter.post("/register", checkInputs(), validation, register);
userRouter.post("/login", checkInputs(), verifyUser, login);
userRouter.post("/logout", logout);

userRouter.get("/confirm/email/:token", confirmRegister);
userRouter.get("/confirm/new-email/:token", confirmNewEmail);
userRouter.get("/about/:id", getAbout);
userRouter.get("/refresh", refreshJWT, getNewJWT);

userRouter.put("/update/about", refreshCSRF, updateAbout);
userRouter.put("/update/favorites/:item", refreshCSRF, updateFav);
userRouter.put("/update/rating/:id/:score", refreshCSRF, updateRating);
userRouter.put("/update/email", refreshCSRF, updateEmail);

userRouter.delete("/delete/favorites/:item", refreshCSRF, deleteFav);
userRouter.delete("/delete/user", deleteUser);

// TODO: forgot password
// TODO: change password
