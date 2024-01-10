import buildPaths from "../lib/buildPaths.js";
import errorCreator from "../lib/errorCreator.js";
import { verifyJwt } from "../lib/jwt.js";
import { UserModel } from "../models/user.model.js";

/* ------------------------- post ------------------------- */

export async function register(req, res, next) {
  try {
    const { _id, email } = await UserModel.create(req.body);
    const data = { uid: _id, email };

    res.status(201).json({
      code: 201,
      message: "User successfully created. Please confirm email!",
      data,
    });
  } catch (err) {
    if (err.code === 11000) {
      next(errorCreator("User already exists", 401));
    } else if (err.name === "ValidationError") {
      next(errorCreator(err.message, 401));
    } else {
      console.log("create user DB error -->", err);
      next(errorCreator("Database error", 500));
    }
  }
}

export function login(req, res, next) {
  const { jwt, csrf, uid } = req.body.userData;

  res
    .status(200)
    .cookie("jwt", jwt, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 3600000, // 1 hour
    })
    .cookie("csrf", csrf, {
      httpOnly: true,
      secure: false,
    })
    .json({
      code: 200,
      message: "User successfully logged in",
      uid,
    });
}

export async function logout(req, res, next) {
  const csrf = req.cookies.csrf;
  const jwt = req.cookies.jwt;

  try {
    const decodeJWT = verifyJwt(jwt);
    if (!decodeJWT) return next(errorCreator("Unauthorized", 401));

    const user = await UserModel.findOne({ _id: decodeJWT.id });
    if (csrf !== user.csrf) return next(errorCreator("Unauthorized", 401));

    await UserModel.updateOne(
      { _id: decodeJWT.id },
      { $unset: { jwt: 1, csrf: 1 } }
    );
  } catch (err) {
    console.log("user logout error:", err);
    next(errorCreator("User logout error", 500));
  }

  res
    .clearCookie("jwt", jwt, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      maxAge: 3600000, // 1 hour
    })
    .clearCookie("csrf", csrf, {
      httpOnly: true,
      secure: true,
    })
    .json({
      code: 200,
      message: "User successfully logged out",
    });
}

/* ------------------------- get ------------------------- */

export async function getAbout(req, res, next) {
  const decodeJWT = verifyJwt(req.cookies.jwt);

  try {
    const doc = await UserModel.findById(req.params.id).select(
      /* information about yourself or someone else? */
      decodeJWT.id === req.params.id
        ? "email info createdAt"
        : "createdAt info.about.username info.rating"
    );
    if (!doc) return next(errorCreator("User not found", 400));

    res.status(200).json({
      code: 200,
      message: "User info successfully selected",
      doc,
    });
  } catch (err) {
    console.log("get user/about --> controller error -->", err.message);
    next(errorCreator("Database error", 500));
  }
}

/* ------------------------- put ------------------------- */

export async function updateAbout(req, res, next) {
  const { csrf, uid } = req.body.secure;
  delete req.body.secure;
  res.cookie("csrf", csrf, {
    httpOnly: true,
    secure: false,
  });

  // loop through the object and create paths to update nested objects
  const update = buildPaths(req.body.about, "info.about");

  try {
    const doc = await UserModel.findByIdAndUpdate(
      uid,
      { $set: update },
      {
        new: true,
        runValidators: true,
      }
    ).select("info updatedAt");
    if (!doc) return next(errorCreator("User not found", 400));

    res.status(200).json({
      code: 200,
      message: "User successfully updated",
      doc,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      next(errorCreator(err.message, 400));
    } else {
      console.log("update user/about --> controller error -->", err.message);
      next(errorCreator("Database error", 500));
    }
  }
}
