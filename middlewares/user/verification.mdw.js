import errorCreator from "../../lib/errorCreator.js";
import { createCSRF } from "../../lib/csrf.js";
import { createJwt } from "../../lib/jwt.js";
import { UserModel } from "../../models/user.model.js";

export default async function verifyUser(req, res, next) {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return next(errorCreator("Invalid user data", 401));

    const matchUser = await user.auth(password);
    if (!matchUser) return next(errorCreator("Invalid user data", 401));

    if (!user.activated)
      return next(
        errorCreator(
          "Account is not activated! Check your email and confirm registration!",
          401
        )
      );

    const jwt = createJwt(user);
    const csrf = createCSRF();

    await UserModel.updateOne({ email }, { jwt, csrf });

    req.body.userData = { jwt, csrf, uid: user["_id"] };

    next();
  } catch (err) {
    console.log("user verification error:", err);
    next(errorCreator("Invalid user data", 400));
  }
}
