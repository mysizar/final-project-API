import { check } from "express-validator";

export default function checkInputs() {
  return [
    check("email")
      .exists()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("Email is not valid"),

    check("password")
      .exists()
      .notEmpty()
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
