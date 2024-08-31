import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import connect from "./connection.js";
import setupSocket from "./socket.js";
import usersRouter from "./controllers/users.js";
import requestsRouter from "./controllers/requests.js";
import chatsRouter from "./controllers/chats.js";
import messagesRouter from "./controllers/messages.js";
import friendsRouter from "./controllers/friends.js";

const app = express();
const PORT = 5000;

app.use(
  cors({
    origin: process.env.ORIGIN || "https://chatterbox-self.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.static("public"));
app.use("/users", usersRouter);
app.use("/requests", requestsRouter);
app.use("/friends", friendsRouter);
app.use("/chats", chatsRouter);
app.use("/messages", messagesRouter);

connect();
mongoose.connection.once("open", () => console.log("connected to db"));

const server = app.listen(PORT, () => console.log("app on port " + PORT));

setupSocket(server);
