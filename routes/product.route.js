import { Router } from "express";
import {
  getAll,
  getById,
  getByCtg,
  getByName,
} from "../controller/product.ctrl.js";
import checkFilter from "../middlewares/product/checkFilter.mdw.js";

export const productRouter = Router();

// TODO: create specialChars middleware to all product route
// productRouter.use(specialChars);

productRouter.get("/all/:limit?/:page?", checkFilter, getAll);
productRouter.get("/category/:ctg/:limit?/:page?", checkFilter, getByCtg);
productRouter.get("/title/:title/:limit?/:page?", checkFilter, getByName);
productRouter.get("/id/:id", getById);
