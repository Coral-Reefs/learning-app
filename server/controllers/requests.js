import express from "express";
import Request from "../models/Request.js";
import User from "../models/User.js";
import Friend from "../models/Friend.js";
import Chat from "../models/Chat.js";
import ChatMember from "../models/ChatMember.js";
import isAuth from "../middleware/auth.js";
import Message from "../models/Message.js";

const router = express.Router();

router.post("/", isAuth, async (req, res) => {
  // req.body - receiver's phone
  const phone = req.body.phone;

  if (req.user.phone == phone)
    return res.status(400).json({
      msg: "I know you're lonely, but you can't send a friend request to yourself",
    });

  const receiver = await User.findOne({ phone });
  if (!receiver)
    return res.status(400).json({ msg: "This user doesn't exist" });

  const isSent = await Request.findOne({
    sender: req.user._id,
    receiver: receiver._id,
  });
  if (isSent)
    return res
      .status(400)
      .json({ msg: "Chill, you've already sent a request to this user" });

  const isReceived = await Request.findOne({
    sender: receiver._id,
    receiver: req.user._id,
  });
  if (isReceived)
    return res
      .status(400)
      .json({ msg: "This user has already sent you a request" });

  const isFriends1 = await Friend.findOne({
    user1: req.user._id,
    user2: receiver._id,
  });
  const isFriends2 = await Friend.findOne({
    user1: receiver._id,
    user2: req.user._id,
  });
  if (isFriends1 || isFriends2)
    return res
      .status(400)
      .json({ msg: "You are already friends with this user" });

  const request = await Request.create({
    sender: req.user._id,
    receiver: receiver._id,
  });

  return res.json(request);
});

router.get("/", isAuth, async (req, res) => {
  const requests = await Request.find({ receiver: req.user._id }).populate(
    "sender"
  );
  return res.json(requests);
});

router.delete("/deny/:id", isAuth, async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) return res.status(400).json({ msg: "Request doesn't exist" });

  if (req.user._id.toString() != request.receiver.toString())
    return res.status(400).json({ msg: "An error occured" });

  await Request.findByIdAndDelete(req.params.id);
  return res.json({ msg: "Friend request denied" });
});

router.post("/accept/:id", isAuth, async (req, res) => {
  const request = await Request.findById(req.params.id).populate("sender");
  if (!request) return res.status(400).json({ msg: "Request doesn't exist" });

  if (req.user._id.toString() != request.receiver.toString())
    return res.status(400).json({ msg: "An error occured" });

  const chat = await Chat.create({
    isGroup: false,
    members: [req.user._id, request.sender._id],
  });
  await Friend.create({
    user1: req.user._id,
    user2: request.sender._id,
    chat: chat._id,
  });

  await ChatMember.create({
    user: req.user._id,
    chat: chat._id,
  });
  await ChatMember.create({
    user: request.sender._id,
    chat: chat._id,
  });

  await Request.findByIdAndDelete(req.params.id);

  return res.json({
    msg: "You are now friends with " + request.sender.firstName,
  });
});

export default router;
