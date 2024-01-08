import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new Schema({
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
  username: {
    type: String,
    required: true,
  },
});

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

/*
plz ort
---email
---password
---nutzername
---- optional -----
straße, nr
tel
man oder frau
optional geburtsdatum
createdAt

*/
