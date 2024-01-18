import { Router } from "express";
import {
  login,
  logout,
  register,
  getAbout,
  getNewJWT,
  confirmRegister,
  confirmNewEmail,
  updateAbout,
  updateRating,
  updateFav,
  updateEmail,
  deleteFav,
  deleteUser,
  passRecover,
  applyNewPass,
  updatePass,
} from "../controller/user.ctrl.js";
import checkInputs from "../lib/checkInputs.js";
import validation from "../middlewares/user/validation.mdw.js";
import verifyUser from "../middlewares/user/verification.mdw.js";
import refreshCSRF from "../middlewares/user/refreshCSRF.mdw.js";
import refreshJWT from "../middlewares/user/refreshJWT.mdw.js";
import { sendEmail } from "../config/mail.connect.js";
import { body } from "express-validator";

export const userRouter = Router();

userRouter.post("/register", checkInputs(), validation, register);
userRouter.post("/login", checkInputs(), verifyUser, login);
userRouter.post("/logout", logout);
userRouter.post("/password/recover", passRecover);
userRouter.post("/password/apply", applyNewPass);

userRouter.get("/confirm/register/:token", confirmRegister);
userRouter.get("/confirm/new-email/:token", confirmNewEmail);
userRouter.get("/about/:id", getAbout);
userRouter.get("/refresh", refreshJWT, getNewJWT);

userRouter.put("/update/about", refreshCSRF, updateAbout);
userRouter.put("/update/favorites/:item", refreshCSRF, updateFav);
userRouter.put("/update/rating/:id/:score", refreshCSRF, updateRating);
userRouter.put("/update/email", refreshCSRF, updateEmail);
userRouter.put("/update/password", refreshCSRF, updatePass);

userRouter.delete("/delete/favorites/:item", refreshCSRF, deleteFav);
userRouter.delete("/delete/user", deleteUser);

// test route for email templates
userRouter.post(
  "/test-email",
  body("path").unescape(),
  async (req, res, next) => {
    try {
      if (req.body.pin === process.env.EMAIL_PIN) {
        await sendEmail("test", req.body.email, req.body.path);
        res.status(200).json({ status: "Message sent" });
      }
    } catch (error) {
      next(error);
    }
  }
);
