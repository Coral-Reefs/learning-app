import express from "express";
import Chat from "../models/Chat.js";
import ChatMember from "../models/ChatMember.js";
import Quiz from "../models/Quiz.js";
import Message from "../models/Message.js";
import isAuth from "../middleware/auth.js";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

router.post("/:chatId", isAuth, upload.single("file"), async (req, res) => {
  try {
    // req.body - type, content
    const membership = await ChatMember.findOne({
      user: req.user._id,
      chat: req.params.chatId,
    });

    if (!membership)
      return res.status(400).json({ msg: "You are not a member of this chat" });

    const messageData = {
      user: req.user._id,
      chat: req.params.chatId,
      ...req.body,
    };

    if (req.file) {
      messageData.file = { name: req.file.filename, size: req.file.size };
    }

    const message = await Message.create(messageData);

    const chat = await Chat.findByIdAndUpdate(req.params.chatId, {
      lastMessage: message._id,
    }).populate("members");

    return res.json({ message, chat });
  } catch (e) {
    console.log(e);
    return res.status(400).json(e);
  }
});

router.post("/quiz/:chatId", isAuth, async (req, res) => {
  try {
    // req.body - question, options: [{text, isCorrect}]
    const membership = await ChatMember.findOne({
      user: req.user._id,
      chat: req.params.chatId,
    });

    if (!membership)
      return res.status(400).json({ msg: "You are not a member of this chat" });

    const quizData = {
      user: req.user._id,
      chat: req.params.chatId,
      answers: [],
      ...req.body,
    };

    const quiz = await Quiz.create(quizData);

    const chat = await Chat.findById(req.params.chatId).populate("members");

    return res.json({ quiz, chat });
  } catch (e) {
    console.log(e);
    return res.status(400).json(e);
  }
});

router.put("/:id", isAuth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message || message.user.toString() != req.user._id)
      return res.status(400).json({ msg: "You can't edit this message" });

    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: Date.now() },
      { new: true }
    ).populate({
      path: "chat",
      populate: {
        path: "members",
      },
    });

    return res.json({ updatedMessage, chat: updatedMessage.chat });
  } catch (e) {
    return res.status(400).json(e);
  }
});

router.delete("/:id", isAuth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    console.log(message);
    if (!message || message.user.toString() != req.user._id)
      return res.status(400).json({ msg: "You can't delete this message" });

    const chat = await Chat.findById(message.chat).populate("members");

    if (message.file && message.file.name) {
      const filePath = path.join(__dirname, "../public", message.file.name);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        }
      });
    }
    await Message.findByIdAndDelete(req.params.id);

    return res.json({ msg: "Deleted message", chat });
  } catch (e) {
    console.log(e);
    return res.status(400).json(e);
  }
});

router.get("/:chatId", isAuth, async (req, res) => {
  try {
    const membership = await ChatMember.findOne({
      user: req.user._id,
      chat: req.params.chatId,
    });

    if (!membership)
      return res.status(400).json({ msg: "You are not a member of this chat" });

    const messages = await Message.find({ chat: req.params.chatId })
      .sort({
        create_at: "desc",
      })
      .populate("user")
      .populate({
        path: "reply",
        populate: {
          path: "user",
        },
      })
      .lean();

    messages.forEach((message) => {
      message.fromCurrentUser =
        message.user._id.toString() === req.user._id.toString();
    });

    return res.json(messages);
  } catch (e) {
    return res.status(400).json(e);
  }
});

router.get("/answers/:id", isAuth, async (req, res) => {
  try {
    const originalMessage = await Message.findById(req.params.id)
      .populate("user")
      .lean();
    const membership = await ChatMember.findOne({
      user: req.user._id,
      chat: originalMessage.chat,
    });

    if (!membership)
      return res.status(400).json({ msg: "You are not a member of this chat" });

    const messages = await Message.find({ reply: req.params.id })
      .sort({
        create_at: "desc",
      })
      .populate("user")
      .populate({
        path: "reply",
        populate: {
          path: "user",
        },
      })
      .lean();

    originalMessage.originalQuestion = true;
    messages.push(originalMessage);
    messages.forEach((message) => {
      message.fromCurrentUser =
        message.user._id.toString() === req.user._id.toString();
    });

    return res.json(messages);
  } catch (e) {
    return res.status(400).json(e);
  }
});

router.get("/quiz/:chatId", isAuth, async (req, res) => {
  try {
    const membership = await ChatMember.findOne({
      user: req.user._id,
      chat: req.params.chatId,
    });

    if (!membership)
      return res.status(400).json({ msg: "You are not a member of this chat" });

    const quizzes = await Quiz.find({ chat: req.params.chatId })
      .sort({
        create_at: "desc",
      })
      .populate("user")
      .lean();

    quizzes.forEach((quiz) => {
      quiz.fromCurrentUser =
        quiz.user._id.toString() === req.user._id.toString();
      quiz.isAnswered = quiz.answers.some(
        (answer) => answer.user.toString() === req.user._id.toString()
      );
    });

    return res.json(quizzes);
  } catch (e) {
    return res.status(400).json(e);
  }
});

router.post("/answerQuiz/:id", isAuth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) return res.status(400).json({ msg: "Quiz not found" });

    const isAnswered = quiz.answers.some(
      (answer) => answer.user.toString() === req.user._id.toString()
    );

    if (isAnswered)
      return res
        .status(400)
        .json({ msg: "You have already answered this quiz" });

    quiz.answers.push({
      user: req.user._id,
      answer: req.body.optionId,
    });

    await quiz.save();

    const chat = await Chat.findById(quiz.chat).populate("members");

    return res.json({ quiz, chat });
  } catch (e) {
    console.log(e);
    return res.status(400).json(e);
  }
});

export default router;
