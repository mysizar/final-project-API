import { Router } from "express";
import { MessageModel } from "../models/message.model.js";

export const messageRouter = Router();

messageRouter.post("/create", async (req, res, next) => {
  try {
    await MessageModel.create({ ...req.body, time: new Date() });
  } catch (error) {
    console.log(error);
    next(error);
  }
  /* if (req.body.to.length === 24) {
    const { title, _id } = await ProductModel.findById(req.body.product);
    const { email } = await UserModel.findById(req.body.to);
    await sendEmail("message", email, { title, pid: _id });
  } */
  res.status(200).json("message saved");
});
