import mongoose from "mongoose";
const ChatMemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  lastSeenMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
});

export default mongoose.model("ChatMember", ChatMemberSchema);
