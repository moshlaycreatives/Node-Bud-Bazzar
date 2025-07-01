import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const DB_URL = process.env.DB_URL;

// ╔════════════════════════════╗
// ║      Connect Database      ║
// ╚════════════════════════════╝
export const connectDb = async () => {
  try {
    if (!DB_URL) {
      throw new Error("Database URL is not defined in environment variables.");
    }

    const connectionInstance = await mongoose.connect(DB_URL);
    console.info(
      `==> 🗄️  DB connected | DB host ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("An error occurred while connecting db:", error);
  }
};
