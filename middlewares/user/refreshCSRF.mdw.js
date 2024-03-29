import { createCSRF } from "../../lib/csrf.js";
import { verifyJwt } from "../../lib/jwt.js";
import { UserModel } from "../../models/user.model.js";
import errorCreator from "../../lib/errorCreator.js";

export default async function refreshCSRF(req, res, next) {
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

    const newCSRF = createCSRF();
    await UserModel.findByIdAndUpdate(decodeJWT.id, { csrf: newCSRF });

    req.body.secure = { csrf: newCSRF, uid: decodeJWT.id };
    next();
  } catch (err) {
    console.log("refreshCSRF error -->", err);
    next(errorCreator("Invalid user data", 400));
  }
}
