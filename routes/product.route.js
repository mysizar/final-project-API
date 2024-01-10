import { Router } from "express";
import {
  getAll,
  getById,
  getByCtg,
  getByName,
  getByOwner,
  create,
  deleteProduct,
  updateProduct,
} from "../controller/product.ctrl.js";
import checkFilter from "../middlewares/product/checkFilter.mdw.js";
import refreshCSRF from "../middlewares/user/refreshCSRF.mdw.js";

export const productRouter = Router();

productRouter.get("/all/:limit?/:page?", checkFilter, getAll);
productRouter.get("/category/:ctg/:limit?/:page?", checkFilter, getByCtg);
productRouter.get("/title/:title/:limit?/:page?", checkFilter, getByName);
productRouter.get("/owner/:id/:limit?/:page?", checkFilter, getByOwner);
productRouter.get("/id/:id", getById);

productRouter.post("/create", refreshCSRF, create);
productRouter.put("/update/:id", refreshCSRF, updateProduct);
productRouter.delete("/delete/:id", refreshCSRF, deleteProduct);
