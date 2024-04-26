import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { configEnv } from "../configEnv/index.js";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: [true, "User-Name is Required!"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    fullName: {
      type: String,
      required: [true, "Full-Name is Required!"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is Required!"],
      unique: true,
      lowercase: true,
    },

    avatar: {
      type: String,
      required: [true, "Avatar is Required!"],
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },

    password: {
      type: String,
      required: [true, "Password is Required!"],
      min: 8,
      max: 25,
    },

    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      userName: this.userName,
      fullName: this.fullName,
      email: this.email,
    },
    configEnv.ACCESS_TOKEN_SECRET,
    {
      expiresIn: configEnv.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    configEnv.REFRESH_TOKEN_SECRET,
    {
      expiresIn: configEnv.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// LOG
// console.log({
//   userSchemaObject: userSchema,
//   userSchemaMethods: userSchema.methods
// });

const User = model("User", userSchema);
export { User };  