import errorCreator from "../lib/errorCreator.js";
import { ProductModel } from "../models/product.model.js";

/*------------------- get ------------------*/

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

export async function getByOwner(req, res, next) {
  const limit = +req.params.limit || 0;
  const page = +req.params.page || 1;
  const skip = (page - 1) * limit;
  const id = req.params.id;

  try {
    const products = await ProductModel.find({ owner: id })
      .limit(limit)
      .skip(skip);

    if (products.length === 0)
      return next(errorCreator(`No products found for user <${id}>`, 400));

    res.status(200).json({
      code: 200,
      message: `Products for user '${id}' successfully selected`,
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

/*------------------- post ------------------*/

export async function create(req, res, next) {
  const csrf = req.body.secure.newCSRF;
  delete req.body.secure;
  res.cookie("csrf", csrf, {
    httpOnly: true,
    secure: false,
  });

  try {
    const doc = await ProductModel.create(req.body);

    res.status(201).json({
      code: 201,
      message: "Product successful created",
      doc,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      next(errorCreator(err.message, 400));
    } else {
      console.log("create product --> controller error -->", err.message);
      next(errorCreator("Database error", 500));
    }
  }
}

/*------------------- put ------------------*/

export async function updateProduct(req, res, next) {
  const csrf = req.body.secure.newCSRF;
  delete req.body.secure;
  res.cookie("csrf", csrf, {
    httpOnly: true,
    secure: false,
  });

  try {
    const doc = await ProductModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(errorCreator("Product not found", 400));

    res.status(200).json({
      code: 200,
      message: "Product successful updated",
      doc,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      next(errorCreator(err.message, 400));
    } else {
      console.log("update product --> controller error -->", err.message);
      next(errorCreator("Database error", 500));
    }
  }
}

/*------------------- delete ------------------*/

export async function deleteProduct(req, res, next) {
  const csrf = req.body.secure.newCSRF;
  delete req.body.secure;
  res.cookie("csrf", csrf, {
    httpOnly: true,
    secure: false,
  });

  try {
    const doc = await ProductModel.findByIdAndDelete(req.params.id);
    if (!doc) return next(errorCreator("Product not found", 400));

    res.status(204);
  } catch (err) {
    console.log("delete product --> controller error -->", err.message);
    next(errorCreator("Database error", 500));
  }
}
