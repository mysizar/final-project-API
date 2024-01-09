import { Router } from "express";
import {
  getAll,
  getById,
  getByCtg,
  getByName,
} from "../controller/product.ctrl.js";
import checkFilter from "../middlewares/product/checkFilter.mdw.js";
import errorCreator from "../lib/errorCreator.js";
import { ProductModel } from "../models/product.model.js";

export const productRouter = Router();

// TODO: create specialChars middleware to all product route
// productRouter.use(specialChars);

productRouter.get("/all/:limit?/:page?", checkFilter, getAll);
productRouter.get("/category/:ctg/:limit?/:page?", checkFilter, getByCtg);
productRouter.get("/title/:title/:limit?/:page?", checkFilter, getByName);
productRouter.get("/id/:id", getById);

productRouter.post("/create", async (req, res, next) => {
  try {
    const doc = await ProductModel.create(req.body);

    res.status(201).json({
      code: 201,
      message: "Product successful created",
      doc,
    });
  } catch (err) {
    console.log("create product -> DB error:", err.message);
    next(errorCreator("Database error", 500));
  }
});
