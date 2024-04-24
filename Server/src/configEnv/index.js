import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const validateEnvVar = (varName, expectedType) => {
  const value = process.env[varName];

  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }

  // Convert before type check
  const convertedValue = expectedType === "number" ? Number(value) : value;

  if (typeof convertedValue !== expectedType) {
    throw new Error(
      `Invalid type for environment variable: ${varName}. Expected ${expectedType}, got ${typeof value}`
    );
  }

  return convertedValue;
};

const configEnv = {
  PORT: validateEnvVar("PORT", "number"),

  MONGODB_URI: validateEnvVar("MONGODB_URI", "string"),

  CLIENT_CORS_ORIGIN: validateEnvVar("CLIENT_CORS_ORIGIN", "string"),

  CLOUDINARY_CLOUD_NAME: validateEnvVar("CLOUDINARY_CLOUD_NAME", "string"),

  CLOUDINARY_API_KEY: validateEnvVar("CLOUDINARY_API_KEY", "string"),

  CLOUDINARY_API_SECRET: validateEnvVar("CLOUDINARY_API_SECRET", "string"),

  ACCESS_TOKEN_SECRET: validateEnvVar("ACCESS_TOKEN_SECRET", "string"),

  ACCESS_TOKEN_EXPIRY: validateEnvVar("ACCESS_TOKEN_EXPIRY", "string"),

  REFRESH_TOKEN_SECRET: validateEnvVar("REFRESH_TOKEN_SECRET", "string"),

  REFRESH_TOKEN_EXPIRY: validateEnvVar("REFRESH_TOKEN_EXPIRY", "string"),
};

export { configEnv };
