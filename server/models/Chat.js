import mongoose from "mongoose";
const ChatSchema = new mongoose.Schema({
  name: { type: String },
  image: { type: String },
  isGroup: { type: Boolean },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  create_at: { type: Date, default: Date.now },
});

export default mongoose.model("Chat", ChatSchema);
