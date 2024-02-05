import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

export function createJwt(user) {
  const payload = {
    id: user._id,
  };

  return jwt.sign(payload, process.env.SECURITY_KEY, { expiresIn: "168h" });
}

export function verifyJwt(token) {
  if (!token) return console.log("verifyJwt --> JWT-key not entered");

  return jwt.verify(token, process.env.SECURITY_KEY);
}
