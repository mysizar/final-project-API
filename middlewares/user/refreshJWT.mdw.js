import errorCreator from "../../lib/errorCreator.js";
import { createCSRF } from "../../lib/csrf.js";
import { createJwt } from "../../lib/jwt.js";
import { UserModel } from "../../models/user.model.js";

export default async function refreshJWT(req, res, next) {
  const csrf = req.cookies.csrf;
  if (!csrf) return next(errorCreator("Invalid user data", 401));

  try {
    const doc = await UserModel.findOne({ csrf }).select("csrf");
    if (doc.csrf !== csrf) return next(errorCreator("Invalid CSRF-token", 401));

    const jwt = createJwt(doc);
    const newCSRF = createCSRF();

    await UserModel.findByIdAndUpdate(doc["_id"], { jwt, csrf: newCSRF });

    req.body.secure = { jwt, csrf: newCSRF };
    next();
  } catch (err) {
    console.log("refreshJWT --> middleware error -->", err);
    next(errorCreator("Invalid user data", 401));
  }
}
