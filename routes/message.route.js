import { Router } from "express";
import { MessageModel } from "../models/message.model.js";
import { UserModel } from "../models/user.model.js";
import { sendEmail } from "../config/mail.connect.js";
import { ProductModel } from "../models/product.model.js";

export const messageRouter = Router();

messageRouter.post("/create", async (req, res, next) => {
  await MessageModel.create({ ...req.body, time: new Date() });
  /* if (req.body.to.length === 24) {
    const { title, _id } = await ProductModel.findById(req.body.product);
    const { email } = await UserModel.findById(req.body.to);
    await sendEmail("message", email, { title, pid: _id });
  } */
  res.status(200).json("message saved");
});
