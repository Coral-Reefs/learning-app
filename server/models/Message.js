import mongoose from "mongoose";
const MessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  content: { type: String },
  type: { type: String, enum: ["text", "image", "video", "document", "voice"] },
  file: {
    name: { type: String },
    size: { type: Number },
  },
  reply: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  create_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.model("Message", MessageSchema);
