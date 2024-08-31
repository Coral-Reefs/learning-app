import mongoose from "mongoose";
const QuizSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  question: { type: String },
  options: [{ text: { type: String }, isCorrect: { type: Boolean } }],
  answers: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      answer: { type: mongoose.Schema.Types.ObjectId },
    },
  ],
  create_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.model("Quiz", QuizSchema);
