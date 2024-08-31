import express from "express";
import Chat from "../models/Chat.js";
import ChatMember from "../models/ChatMember.js";
import Message from "../models/Message.js";
import isAuth from "../middleware/auth.js";
import fs from "fs";
import path from "path";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.get("/", isAuth, async (req, res) => {
  let chats = await Chat.find({
    members: req.user._id,
  })
    .populate("members")
    .populate({
      path: "lastMessage",
      populate: {
        path: "user",
      },
    });

  chats = chats.sort((a, b) => {
    const dateA = a.lastMessage
      ? new Date(a.lastMessage.create_at)
      : new Date(a.create_at);
    const dateB = b.lastMessage
      ? new Date(b.lastMessage.create_at)
      : new Date(b.create_at);
    return dateB - dateA;
  });

  chats.forEach((chat) => {
    if (!chat.isGroup) {
      chat.members = chat.members.filter((member) => {
        return member._id.toString() !== req.user._id.toString();
      });
    }
  });
  return res.json(chats);
});

router.get("/:id", isAuth, async (req, res) => {
  try {
    const membership = await ChatMember.findOne({
      user: req.user._id,
      chat: req.params.id,
    });

    if (!membership)
      return res.status(400).json({ msg: "You are not a member of this chat" });

    let chat = await Chat.findById(req.params.id).populate("members");

    if (!chat.isGroup) {
      const otherMemberDetails = chat.members.filter(
        (member) => member._id.toString() !== req.user._id.toString()
      )[0];

      if (!otherMemberDetails) {
        return res.status(404).json({ message: "Other user not found" });
      }

      const lastSeenMessage = await ChatMember.findOne({
        user: otherMemberDetails._id,
        chat: req.params.id,
      });

      return res.json({
        ...chat.toObject(),
        otherMember: {
          ...otherMemberDetails.toObject(),
          lastSeenMessage: lastSeenMessage.lastSeenMessage,
        },
      });
    }

    return res.json(chat);
  } catch (e) {
    return res.status(400).json(e);
  }
});

router.post("/group", isAuth, upload.single("image"), async (req, res) => {
  // req.body = image, name, members id array
  req.body.members.push(req.user._id);
  const chatData = {
    isGroup: true,
    ...req.body,
  };

  if (req.file) {
    chatData.image = req.file.filename;
  }

  const chat = await Chat.create(chatData);

  req.body.members.map(async (user) => {
    await ChatMember.create({
      user,
      chat: chat._id,
    });
  });

  return res.json({ msg: "Created group", chat });
});

router.post("/group/:id", isAuth, async (req, res) => {
  // req.body = new member id

  const chat = await Chat.findById(req.params.id);

  const addMembersPromises = req.body.map(async (userId) => {
    await ChatMember.create({
      user: userId,
      chat: chat._id,
    });

    chat.members.push(userId);
  });

  await Promise.all(addMembersPromises);
  await chat.save();

  return res.json({ msg: "Added new members to group", chat });
});

router.delete("/:chatId", isAuth, async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) return res.status(400).json({ msg: "Chat not found" });
  if (chat.members.length < 1)
    return res.status(400).json({ msg: "This chat doesn't have any members" });

  await Chat.findByIdAndDelete(req.params.chatId);
  await ChatMember.deleteMany({ chat: req.params.chatId });
  await Message.deleteMany({ chat: req.params.chatId });

  return res.json({ msg: "Deleted group", chat });
});

router.delete("/leave/:chatId", isAuth, async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) return res.status(400).json({ msg: "Chat not found" });

  const membership = await ChatMember.findOne({
    user: req.user._id,
    chat: req.params.chatId,
  });
  if (!membership)
    return res.status(400).json({ msg: "You are not in this group" });

  await ChatMember.findByIdAndDelete(membership._id);
  chat.members.pull(req.user._id);
  await chat.save();

  return res.json({ msg: "You left a group", chat });
});

// router.post("/markRead", isAuth, async (req, res) => {
//   // req.body - chat, message
//   const chat = await Chat.findById(req.body.chatId).populate("members");
//   if (!chat) return res.status(400).json("Can't find chat");

//   let membership = await ChatMember.findOne({
//     user: req.user._id,
//     chat: req.body.chatId,
//   });
//   if (!membership)
//     return res.status(400).json({ msg: "You are not in this group" });

//   const lastMessage = await Message.findById(req.body.message);
//   membership = await ChatMember.findByIdAndUpdate(
//     membership._id,
//     {
//       lastSeenMessage: lastMessage ? lastMessage._id : undefined,
//     },
//     { new: true }
//   );

//   return res.json({ msg: "read", chat, membership });
// });

export default router;
