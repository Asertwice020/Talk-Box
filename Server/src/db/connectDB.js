import { ApiError } from "../utils/apiError.util.js";
import mongoose from "mongoose";
import { configEnv } from "../configEnv/index.js";

const ConnectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(configEnv.MONGODB_URI);
    // LOG
    console.log(`\nMongo DB connected!! DB HOST :: ${connectionInstance}`);
  } catch (error) {
    const errorObj = new ApiError(
      503,
      `Facing an issue while connecting to MONGODB :: DB/index.js`,
      "1. INTERNET  2. IP ADDRESS IN NETWORK ACCESS TAB OF MONGO DB  3. REMOVE LAST '/' FROM CONNECTION STRING  4. CONFIG ENV ARE LOADING PROPERLY",
      error,
      error?.stack
    );
    // LOG
    console.log(errorObj);
    process.exit(1);
  }
};

export { ConnectDB };
