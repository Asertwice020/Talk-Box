import { ConnectDB } from "./db/connectDB.js";
import { app } from "./app.js";
import { configEnv } from "./configEnv/index.js";
import { ApiError } from "./utils/apiError.util.js";

ConnectDB()
  .then(() => {
    app.on("error", (error) => {
      throw new ApiError(
        500,
        "MongoDB Connection Successful ✅ Express Server Internal Error ❌ :: [src/app.js (app imported), src/index.js (used in this)]",
        "no debugging tips",
        error,
        error?.stack
      );
    });

    const PORT = configEnv.PORT || 8080;
    app.listen(PORT, console.log(`⚙️ Server running on port ${PORT}`));
  })
  .catch((error) => {
    throw new ApiError(
      `Have A Problem In Promise Catch Part :: src/index.js`,
      "no debugging tips",
      error,
      error?.stack
    );
  });