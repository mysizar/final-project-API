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

    await UserModel.findByIdAndUpdate(decodeJWT.id, {
      $unset: { jwt: 1, csrf: 1 },
    });
  } catch (err) {
    console.log("user logout error:", err);
    next(errorCreator("User logout error", 500));
  }

  res
    .status(200)
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
      /* get information about yourself or someone else? */
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
    if (err.name === "CastError") {
      next(errorCreator("<id> must contain 24 characters", 400));
    } else {
      console.log("get user/about --> controller error -->", err.message);
      next(errorCreator("Database error", 500));
    }
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
  const updateObj = buildPaths(req.body.about, "info.about");

  try {
    const doc = await UserModel.findByIdAndUpdate(
      uid,
      { $set: updateObj },
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

export async function updateRating(req, res, next) {
  const { csrf, uid } = req.body.secure;
  delete req.body.secure;
  res.cookie("csrf", csrf, {
    httpOnly: true,
    secure: false,
  });

  const score = req.params.score;

  if (uid === req.params.id)
    return next(errorCreator("You cannot rate yourself!", 401));
  if (isNaN(score) || score > 5 || score < 1)
    return next(errorCreator("<score> must be a number between 1 and 5!", 401));

  try {
    const doc = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $push: { "info.rating": score } },
      {
        new: true,
        runValidators: true,
      }
    ).select("info.rating updatedAt");
    if (!doc) return next(errorCreator("User not found", 400));

    res.status(200).json({
      code: 200,
      message: "User rating successfully updated",
      doc,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      next(errorCreator(err.message, 400));
    } else if (err.name === "CastError") {
      next(errorCreator("<id> must contain 24 characters", 400));
    } else {
      console.log("update user/rating --> controller error -->", err.message);
      next(errorCreator("Database error", 500));
    }
  }
}

export async function updateFav(req, res, next) {
  const { csrf, uid } = req.body.secure;
  delete req.body.secure;
  res.cookie("csrf", csrf, {
    httpOnly: true,
    secure: false,
  });

  try {
    const doc = await UserModel.findByIdAndUpdate(
      uid,
      { $push: { "info.favorites": req.params.item } },
      {
        new: true,
        runValidators: true,
      }
    ).select("info.favorites updatedAt");
    if (!doc) return next(errorCreator("User not found", 400));

    res.status(200).json({
      code: 200,
      message: "Item successfully added to favorites",
      doc,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      next(errorCreator(err.message, 400));
    } else if (err.name === "CastError") {
      next(errorCreator("<item> must contain 24 characters", 400));
    } else {
      console.log("update user/favorite --> controller error -->", err.message);
      next(errorCreator("Database error", 500));
    }
  }
}

export async function deleteFav(req, res, next) {
  const { csrf, uid } = req.body.secure;
  delete req.body.secure;
  res.cookie("csrf", csrf, {
    httpOnly: true,
    secure: false,
  });

  try {
    const doc = await UserModel.findByIdAndUpdate(
      uid,
      { $pull: { "info.favorites": req.params.item } },
      {
        new: true,
        runValidators: true,
      }
    ).select("info.favorites updatedAt");
    if (!doc) return next(errorCreator("User not found", 400));

    res.status(200).json({
      code: 200,
      message: "Item successfully deleted from favorites",
      doc,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      next(errorCreator(err.message, 400));
    } else if (err.name === "CastError") {
      next(errorCreator("<item> must contain 24 characters", 400));
    } else {
      console.log("update user/favorite --> controller error -->", err.message);
      next(errorCreator("Database error", 500));
    }
  }
}

export async function deleteUser(req, res, next) {
  const csrf = req.cookies.csrf;
  const jwt = req.cookies.jwt;

  try {
    const decodeJWT = verifyJwt(jwt);
    if (!decodeJWT)
      return next(errorCreator("Unauthorized. Please log in!", 401));

    const user = await UserModel.findById(decodeJWT.id);

    if (!user) return next(errorCreator("User not found!", 401));
    if (csrf !== user.csrf)
      return next(errorCreator("Invalid CSRF-token", 401));

    await UserModel.deleteOne({ _id: decodeJWT.id });

    res
      .status(200)
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
        message: `User ${decodeJWT.id} successfully deleted`,
      });
  } catch (err) {
    console.log("delete user --> controller error -->", err.message);
    next(errorCreator("Database error", 500));
  }
}
