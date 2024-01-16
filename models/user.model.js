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
    activationString: String,
    newEmail: {
      type: String,
      unique: true,
      validate: {
        validator: function (value) {
          return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(value);
        },
        message: "Invalid email address format",
      },
    },
    info: {
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
        tel: String,
        birthday: Date,
      },
      rating: {
        type: [Number],
        min: 1,
        max: 5,
      },
      favorites: { type: [Schema.Types.ObjectId], ref: "product" },
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
