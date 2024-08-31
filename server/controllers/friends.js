import express from "express";
import Request from "../models/Request.js";
import User from "../models/User.js";
import Friend from "../models/Friend.js";
import Chat from "../models/Chat.js";
import ChatMember from "../models/ChatMember.js";
import isAuth from "../middleware/auth.js";
import Message from "../models/Message.js";
const router = express.Router();

router.delete("/:chatId", isAuth, async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) return res.status(400).json({ msg: "Chat not found" });
  if (chat.members.length !== 2)
    return res.status(400).json({ msg: "This chat doesn't have any members" });

  const friends = await Friend.findOne({ chat: req.params.chatId });
  if (!friends) return res.status(400).json({ msg: "Friend not found" });

  await Chat.findByIdAndDelete(req.params.chatId);
  await ChatMember.deleteMany({ chat: req.params.chatId });
  await Message.deleteMany({ chat: req.params.chatId });
  await Friend.findByIdAndDelete(friends._id);

  return res.json({ msg: "Deleted friend", friends });
});

router.get("/", isAuth, async (req, res) => {
  const friendships1 = await Friend.find({
    user1: req.user._id,
  }).populate("user2");
  const friendships2 = await Friend.find({
    user2: req.user._id,
  }).populate("user1");
  const friendships = [...friendships1, ...friendships2];
  const friends = friendships.map((friend) =>
    friend.user1.toString() != req.user._id ? friend.user1 : friend.user2
  );
  return res.json(friends);
});
export default router;
