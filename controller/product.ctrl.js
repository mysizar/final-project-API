import errorCreator from "../lib/errorCreator.js";
import { ProductModel } from "../models/product.model.js";

export async function getAll(req, res, next) {
  const limit = +req.params.limit || 0;
  const page = +req.params.page || 1;
  const skip = (page - 1) * limit;

  try {
    const products = await ProductModel.find().limit(limit).skip(skip);

    res.status(200).json({
      code: 200,
      message: "Products successfully selected",
      products,
    });
  } catch (err) {
    console.log(err);
    next(errorCreator("Bad request", 400));
  }
}

export async function getByCtg(req, res, next) {
  const limit = +req.params.limit || 0;
  const page = +req.params.page || 1;
  const skip = (page - 1) * limit;
  const category = req.params.ctg;

  try {
    const products = await ProductModel.find({ category })
      .collation({ locale: "en", strength: 1 }) // case-insensitive +whole
      .limit(limit)
      .skip(skip);

    if (products.length === 0)
      return next(errorCreator(`Category <${category}> not found`, 400));

    res.status(200).json({
      code: 200,
      message: `Products in category '${category}' successfully selected`,
      products,
    });
  } catch (err) {
    console.log(err);
    next(errorCreator("Bad request", 400));
  }
}

export async function getByName(req, res, next) {
  const limit = +req.params.limit || 0;
  const page = +req.params.page || 1;
  const skip = (page - 1) * limit;
  const title = req.params.title;
  const regex = new RegExp(req.params.title, "i"); // case-insensitive + accept part of title also

  try {
    const products = await ProductModel.find({ title: { $regex: regex } })
      .limit(limit)
      .skip(skip);

    if (products.length === 0)
      return next(errorCreator(`No results for title <${title}>`, 400));

    res.status(200).json({
      code: 200,
      message: `Products with title '${title}' successfully selected`,
      products,
    });
  } catch (err) {
    console.log(err);
    next(errorCreator("Bad request", 400));
  }
}

export async function getById(req, res, next) {
  try {
    const product = await ProductModel.findById(req.params.id);

    res.status(200).json({
      code: 200,
      message: "Product successfully selected",
      product,
    });
  } catch (err) {
    console.log(err);
    next(errorCreator("Bad request", 400));
  }
}
