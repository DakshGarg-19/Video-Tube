import express from "express";
import connectDB from "./db/index.js";
import path from "path";
import { fileURLToPath } from "url";
const app = express();

// recreate __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT;

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
