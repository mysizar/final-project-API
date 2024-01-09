import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    jwt: String,
    csrf: String,
    activated: {
      type: Boolean,
      default: false,
    },
    about: {
      username: {
        type: String,
        required: true,
      },
      location: {
        zip: {
          type: String,
          minLength: 4,
          maxLength: 5,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        street: String,
        house: {
          type: String,
          minLength: 1,
        },
      },
      gender: {
        type: String,
        enum: {
          values: ["male", "female", "other"],
          message: "Gender '{VALUE}' is not supported by the database",
        },
      },
      rate: {
        average: Number,
        votes: Number,
      },
      tel: String,
      birthday: Date,
    },
  },
  { timestamps: true }
);

// Hook - hashed password before saving to the database
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Add methods - compare password
UserSchema.methods.auth = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

export const UserModel = model("user", UserSchema);
