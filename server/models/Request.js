import mongoose from "mongoose";
const RequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("Request", RequestSchema);
