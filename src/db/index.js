import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { DB_NAME } from "../constants.js";
// recreate __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: `${__dirname}/../../.env` });
const URL = process.env.DB_URL;

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${URL}/${DB_NAME}`);
    console.log(
      `\n MongoDB connected, DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MONGODB connection failed: ", error.message);
    process.exit(1);
  }
};

export default connectDB;
