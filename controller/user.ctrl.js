import rebuildPaths from "../lib/rebuildPaths.js";
import errorCreator from "../lib/errorCreator.js";
import { verifyJwt } from "../lib/jwt.js";
import { UserModel } from "../models/user.model.js";
import { sendEmail } from "../config/mail.connect.js";
import { createCSRF } from "../lib/csrf.js";
import { ProductModel } from "../models/product.model.js";

/* ------------------------- post ------------------------- */

export async function register(req, res, next) {
  const activationString = createCSRF();
  const user = { ...req.body, activationString };

  try {
    const { _id, email } = await UserModel.create(user);
    await sendEmail("registration", email, activationString);
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
      secure: true,
      sameSite: "None",
      domain: process.env.DOMAIN,
      maxAge: 604800000, // 7 days
    })
    .cookie("csrf", csrf, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      domain: process.env.DOMAIN,
      maxAge: 604800000, // 7 days
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
      sameSite: "None",
      domain: process.env.DOMAIN,
      maxAge: 604800000, // 7 days
    })
    .clearCookie("csrf", csrf, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      domain: process.env.DOMAIN,
      maxAge: 604800000, // 7 days
    })
    .json({
      code: 200,
      message: "User successfully logged out",
    });
}

export async function passRecover(req, res, next) {
  const email = req.body.email;
  const activationString = createCSRF();

  try {
    const doc = await UserModel.findOneAndUpdate(
      { email },
      { activationString }
    );
    if (!doc) return next(errorCreator("User not found", 400));

    await sendEmail("recover-password", email, activationString);

    res.status(200).json({
      code: 200,
      message: "Recovery request succeeded. Please check your email!",
    });
  } catch (err) {
    console.log("password reset --> controller error -->", err);
    next(errorCreator("Database error", 500));
  }
}

export async function applyNewPass(req, res, next) {
  const { token, password } = req.body;
  if (!password) return next(errorCreator("<password> is required", 400));
  try {
    const doc = await UserModel.findOneAndUpdate(
      { activationString: token },
      { password: password, $unset: { activationString: 1 } }
    ).select("email");

    if (!doc) return next(errorCreator("Invalid verification key", 401));

    await sendEmail("password-changed", doc.email);

    res.status(200).json({
      code: 200,
      message: "Password changed successfully. Please log in!",
    });
  } catch (err) {
    console.log("apply new password --> controller error -->", err);
    next(errorCreator("Database error", 500));
  }
}

/* ------------------------- get ------------------------- */

export async function confirmRegister(req, res, next) {
  try {
    const doc = await UserModel.findOneAndUpdate(
      { activationString: req.params.token },
      { activated: true, $unset: { activationString: 1 } }
    );

    if (!doc) return next(errorCreator("Invalid verification key", 401));

    res.status(200).redirect("https://floh.store/profile/signin");
    // .json({
    //   code: 200,
    //   message: "Email successfully confirmed. Please log in!",
    //   uid: doc["_id"],
    // });
  } catch (err) {
    console.log("confirm user error -->", err);
    next(errorCreator("Database error", 500));
  }
}

export async function confirmNewEmail(req, res, next) {
  try {
    const doc = await UserModel.findOneAndUpdate(
      { activationString: req.params.token },
      [
        // aggregation pipeline [] is needed to get (calculate) value of the 'newEmail' field and set this value to the 'email' field.
        {
          $set: { email: { $toString: "$newEmail" } },
        },
        {
          $unset: ["newEmail", "activationString"],
        },
      ]
    ).select("email");

    if (!doc) return next(errorCreator("Invalid verification key", 401));

    res.status(200).redirect("https://floh.store/new-email");
  } catch (err) {
    if (err.code === 11000) {
      next(errorCreator("User already exists", 401));
    } else {
      console.log("confirmNewEmail --> controller error -->", err);
      next(errorCreator("Database error", 500));
    }
  }
}

export async function getAbout(req, res, next) {
  try {
    const isLoggedIn = req.cookies.jwt ? true : false;
    const decodeJWT = req.cookies.jwt ? verifyJwt(req.cookies.jwt) : null;

    const doc = await UserModel.findById(req.params.id).select(
      /* get information about yourself or someone else? */
      isLoggedIn && decodeJWT.id === req.params.id
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

export async function getNewJWT(req, res, next) {
  const { jwt, csrf } = req.body.secure;

  res
    .status(200)
    .cookie("jwt", jwt, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      domain: process.env.DOMAIN,
      maxAge: 604800000, // 7 days
    })
    .cookie("csrf", csrf, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      domain: process.env.DOMAIN,
      maxAge: 604800000, // 7 days
    })
    .json({
      code: 200,
      message: "JWT successfully refreshed",
    });
}

/* ------------------------- put ------------------------- */

export async function updateAbout(req, res, next) {
  const { csrf, uid } = req.body.secure;
  delete req.body.secure;
  res.cookie("csrf", csrf, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    domain: process.env.DOMAIN,
    maxAge: 604800000, // 7 days
  });

  // loop through the object and create paths to update nested objects
  const updateObj = rebuildPaths(req.body.about, "info.about");

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
    secure: true,
    sameSite: "None",
    domain: process.env.DOMAIN,
    maxAge: 604800000, // 7 days
  });

  const score = +req.params.score;
  const whoRated = req.body.whoRated;

  if (uid === req.params.id)
    return next(errorCreator("You cannot rate yourself!", 401));
  if (isNaN(score) || score > 5 || score < 1)
    return next(errorCreator("<score> must be a number between 1 and 5!", 401));

  try {
    const user = await UserModel.findOne({
      _id: req.params.id,
      "info.whoRated": whoRated,
    }).select("info.whoRated");
    if (user?.info.whoRated.includes(req.body.whoRated))
      return next(errorCreator("You cannot rate a user twice", 403));
    console.log(score);
    const doc = await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: { "info.rating": score, "info.whoRated": whoRated },
        // $push: { "info.whoRated": whoRated },
      },
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
    secure: true,
    sameSite: "None",
    domain: process.env.DOMAIN,
    maxAge: 604800000, // 7 days
  });

  try {
    const doc = await UserModel.findByIdAndUpdate(
      uid,
      { $addToSet: { "info.favorites": req.params.item } },
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

export async function updateEmail(req, res, next) {
  const { csrf, uid } = req.body.secure;
  delete req.body.secure;
  res.cookie("csrf", csrf, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    domain: process.env.DOMAIN,
    maxAge: 604800000, // 7 days
  });

  const activationString = createCSRF();

  try {
    const doc = await UserModel.findByIdAndUpdate(
      uid,
      { newEmail: req.body.newEmail, activationString },
      {
        new: true,
        runValidators: true,
      }
    ).select("newEmail");
    if (!doc) return next(errorCreator("User not found", 400));

    await sendEmail("change-email", req.body.newEmail, activationString);

    res.status(200).json({
      code: 200,
      message: "New email successfully added. Please confirm email!",
      doc,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      next(errorCreator(err.message, 400));
    } else {
      console.log("update user/email --> controller error -->", err.message);
      next(errorCreator("Database error", 500));
    }
  }
}

export async function updatePass(req, res, next) {
  const { csrf, uid } = req.body.secure;
  delete req.body.secure;
  res.cookie("csrf", csrf, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    domain: process.env.DOMAIN,
    maxAge: 604800000, // 7 days
  });

  const { currentPass, password } = req.body;
  if (!password) return next(errorCreator("<password> is required", 400));
  try {
    const user = await UserModel.findById(uid).select("email password");
    const matchUser = await user.auth(currentPass);
    if (!matchUser) return next(errorCreator("Invalid user data", 401));

    const doc = await UserModel.findByIdAndUpdate(
      uid,
      { password: password },
      {
        new: true,
        runValidators: true,
      }
    );

    await sendEmail("password-changed", user.email);

    res.status(200).json({
      code: 200,
      message: "Password changed successfully!",
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      next(errorCreator(err.message, 400));
    } else {
      console.log("update user/email --> controller error -->", err.message);
      next(errorCreator("Database error", 500));
    }
  }
}

/* ------------------------- delete ------------------------- */

export async function deleteFav(req, res, next) {
  const { csrf, uid } = req.body.secure;
  delete req.body.secure;
  res.cookie("csrf", csrf, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    domain: process.env.DOMAIN,
    maxAge: 604800000, // 7 days
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

    if (!user) return next(errorCreator("User not found!", 400));
    if (csrf !== user.csrf)
      return next(errorCreator("Invalid CSRF-token", 401));

    await UserModel.deleteOne({ _id: decodeJWT.id });
    const del = await ProductModel.deleteMany({ owner: decodeJWT.id });

    res
      .status(200)
      .clearCookie("jwt", jwt, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        domain: process.env.DOMAIN,
        maxAge: 604800000, // 7 days
      })
      .clearCookie("csrf", csrf, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        domain: process.env.DOMAIN,
        maxAge: 604800000, // 7 days
      })
      .json({
        code: 200,
        message1: `User <${decodeJWT.id}> successfully deleted`,
        message2: `<${del.deletedCount}> products successfully deleted`,
      });
  } catch (err) {
    console.log("delete user --> controller error -->", err.message);
    next(errorCreator("Database error", 500));
  }
}
