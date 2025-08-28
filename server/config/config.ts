import dotenv from "dotenv";
dotenv.config();
const requiredEnvVars = [
  "MONGO_URI",
  "REDIS_URL",
  "GOOGLE_CLIENT_ID",
  "NODE_ENV",
  "PORT",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "JWT_SECRET_RESET_PASSWORD",
  "EMAIL_USER",
  "EMAIL_PASSWORD",
  "FRONT_END_URL",
  "PRODUCTION_SERVER",
  "FRONTEND_API_KEY",
  "SWAGGER_PASSWORD",
  "SWAGGER_USER"
];

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error("Missing required environment variables:");
  missingEnvVars.forEach((key) => console.error(`- ${key}`));
  process.exit(1);
} else {
  console.log("All environment variables loaded successfully");
}

export const config = {
  mongoURI: process.env.MONGO_URI!,
  redisURL: process.env.REDIS_URL || "redis://localhost:6379",
  googleClientID: process.env.GOOGLE_CLIENT_ID!,
  nodeEnv: process.env.NODE_ENV!,
  port: Number(process.env.PORT) || 3000,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY!,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET!,
  jwtSecret: process.env.JWT_SECRET!,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
  jwtSecretResetPassword: process.env.JWT_SECRET_RESET_PASSWORD!,
  emailUser: process.env.EMAIL_USER!,
  emailPassword: process.env.EMAIL_PASSWORD!,
  frontEndUrl: process.env.FRONT_END_URL,
  serverUrl: process.env.PRODUCTION_SERVER,
  frontApiKey: process.env.FRONTEND_API_KEY,
  swaggerPassword: process.env.SWAGGER_PASSWORD,
  swaggerUser: process.env.SWAGGER_USER,
};
