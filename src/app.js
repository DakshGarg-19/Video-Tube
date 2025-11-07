import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./db/index.js";
import path from "path";
import { fileURLToPath } from "url";
const app = express();
const PORT = process.env.PORT;

// recreate __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public")); 
app.use(cookieParser())

// Global app error listener
app.on("error", (error) => {
  console.log("Error:", error.message);
  process.exit(1);
});

const startServer = async () => {
  await connectDB();
  console.log("MongoDB connected successfully");
  app.listen(PORT || 8000, () =>
    console.log("App is listening on port:", PORT)
  );
};

startServer();

export { app };
