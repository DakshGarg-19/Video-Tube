import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.db.js";
import path from "path";
import { fileURLToPath } from "url";

// recreate __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
dotenv.config({ path: "../.env" });
const PORT = process.env.PORT || 8000;

const startServer = async () => {
  await connectDB();
  console.log("MongoDB connected successfully");
  app.listen(PORT, () => console.log("Server is running on port:", PORT));
};

startServer();
