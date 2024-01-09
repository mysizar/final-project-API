import errorCreator from "../lib/errorCreator.js";
import { verifyJwt } from "../lib/jwt.js";
import { UserModel } from "../models/user.model.js";

export async function register(req, res, next) {
  try {
    const { _id, email } = await UserModel.create(req.body);

    const data = { uid: _id, email };

    res.status(201).json({
      code: 201,
      message: "User successful created",
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
      message: "User successful logged in",
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
      message: "User successful logged out",
    });
}
