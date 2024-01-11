import { Router } from "express";
import {
  login,
  logout,
  register,
  getAbout,
  updateAbout,
  updateRating,
  updateFav,
  deleteFav,
  deleteUser,
} from "../controller/user.ctrl.js";
import checkInputs from "../lib/checkInputs.js";
import validation from "../middlewares/user/validation.mdw.js";
import verifyUser from "../middlewares/user/verification.mdw.js";
import refreshCSRF from "../middlewares/user/refreshCSRF.mdw.js";

export const userRouter = Router();

userRouter.post("/register", checkInputs(), validation, register);
userRouter.post("/login", checkInputs(), verifyUser, login);
userRouter.post("/logout", logout);

userRouter.get("/about/:id", getAbout);

userRouter.put("/update/about", refreshCSRF, updateAbout);
userRouter.put("/update/favorites/:item", refreshCSRF, updateFav);
userRouter.put("/update/rating/:id/:score", refreshCSRF, updateRating);

userRouter.delete("/delete/favorites/:item", refreshCSRF, deleteFav);
userRouter.delete("/delete/user", deleteUser);

// TODO: reset password
// TODO: change email
// TODO: confirm email

// TODO: refreshJWT

// TODO: deleteUser
