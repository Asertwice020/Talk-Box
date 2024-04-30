import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { configEnv } from "../configEnv/index.js";
/* FIXME: WHILE CREATING SCHEMAS I DEFINED THE ERROR MESSAGE, IF USER LEAVE ANY REQUIRED FILED EMPTY. BUT DON'T KNOW HOW TO USE THESE ERROR MESSAGES BY MONGOOSE YET.
  I ALSO NOTICE THAT THE PASSWORD FIELD MUST HAS MINIMUM 8 CHARACTERS, BUT I ABLE TO MAKE 3 CHARS PASSWORD.
  FIX ALL THESE MONGOOSE SIDE ISSUE BY MONGOOSE DOCS AND AI.

  I HAVE A DOUBT MAYBE IF I PROVIDE THE WRONG TYPE EVEN SO I DON'T GET ANY ERROR BY MONGOOSE BUT MY CONTROLLER LOGIC WILL DEFINITELY THROW AN ERROR!
*/
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

    about: {
      type: String,
      trim: true,
      default: "",
    },

    avatar: {
      type: String,
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