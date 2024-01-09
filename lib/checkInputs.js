import { check } from "express-validator";

export default function checkInputs() {
  return [
    check("email")
      // .trim()
      .exists()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      // .escape()
      .withMessage("Email is not valid"),

    check("password")
      // .trim()
      .exists()
      .notEmpty()
      // .escape()
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/gm)
      .withMessage([
        "Password must be 8 characters or longer and must contain at least:",
        " - one lowercase letter",
        " - one uppercase letter",
        " - one digit",
        " - one non-alphanumeric character",
      ]),
  ];
}
