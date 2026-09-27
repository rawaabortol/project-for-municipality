const DEV_FALLBACK_SECRET = "dev_jwt_secret";

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET must be set in production.");
}

export const JWT_SECRET = process.env.JWT_SECRET || DEV_FALLBACK_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
