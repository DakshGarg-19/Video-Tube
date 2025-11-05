import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/index.js"
import path from "path";
import { fileURLToPath } from "url";
const app = express();

// recreate __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: `${__dirname}/../.env` });
const PORT = process.env.PORT;

// Global app error listener
app.on("error", (error) => {
  console.log("Error:", error.message);
  process.exit(1);
});

const startServer = async () => {
  try {
    await connectDB()
    app.listen(PORT, () => console.log("App is listening on port:", PORT));
  } catch (error) {
    process.exit(1);
  }
};

startServer()