import { Router } from "express";
import {
  login,
  logout,
  register,
  getAbout,
  updateAbout,
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
