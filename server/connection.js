import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const { DB_URL } = process.env;

const connect = async () => {
  try {
    await mongoose.connect(DB_URL);
  } catch (e) {
    console.error(`Error connecting to mongodb ${e.message}`);
  }
};
export default connect;
