import { Server } from "socket.io";
import User from "./models/User.js";

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.ORIGIN || "https://chatterbox-self.vercel.app",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  const userSocketMap = new Map();

  const disconnect = (socket) => {
    console.log(`Client disconected: ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if ((socketId = socket.id)) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  //   functions
  const newRequestHandler = async (data) => {
    const receiverSocketId = userSocketMap.get(data.receiver);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveRequest");
    }
  };

  const newMessageHandler = async (data) => {
    data.chat.members.forEach(async (member) => {
      const receiverSocketId = userSocketMap.get(member._id);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage");
      }
    });
  };

  const removeFriendHandler = async (data) => {
    const user1SocketId = userSocketMap.get(data.friends.user1);
    const user2SocketId = userSocketMap.get(data.friends.user2);
    if (user1SocketId) {
      io.to(user1SocketId).emit("removedFriend");
    }
    if (user2SocketId) {
      io.to(user2SocketId).emit("removedFriend");
    }
  };

  const outgoingVoiceCall = async (data) => {
    const receiverSocketId = userSocketMap.get(data.to);
    const from = await User.findOne({ clerkUserId: data.from });
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incomingVoiceCall", {
        from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  };
  const outgoingVideoCall = async (data) => {
    const receiverSocketId = userSocketMap.get(data.to);
    const from = await User.findOne({ clerkUserId: data.from });
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incomingVideoCall", {
        from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  };
  const rejectVoiceCall = async (data) => {
    const senderSocketId = userSocketMap.get(data.from);
    if (senderSocketId) {
      io.to(senderSocketId).emit("voiceCallRejected");
    }
  };
  const rejectVideoCall = (data) => {
    const senderSocketId = userSocketMap.get(data.from);
    if (senderSocketId) {
      io.to(senderSocketId).emit("videoCallRejected");
    }
  };
  const acceptIncomingCall = ({ id }) => {
    const senderSocketId = userSocketMap.get(id);
    io.to(senderSocketId).emit("callAccepted");
  };
  const refreshGroupHandler = (data) => {
    const members = data.chat.members;
    members.forEach((member) => {
      const memberSocketId = userSocketMap.get(member);
      if (memberSocketId) {
        io.to(memberSocketId).emit("receiveMessage"); // to refresh the chats
      }
    });
  };
  const deleteGroupHandler = (data) => {
    const members = data.chat.members;
    members.forEach((member) => {
      const memberSocketId = userSocketMap.get(member);
      if (memberSocketId) {
        io.to(memberSocketId).emit("removedFriend"); // to refresh the chats
      }
    });
  };

  io.on("connection", async (socket) => {
    const clerkUserId = socket.handshake.query.userId;

    if (clerkUserId) {
      const mongoUser = await User.findOne({ clerkUserId });
      const mongoUserId = mongoUser._id.toString();
      if (mongoUserId) {
        userSocketMap.set(mongoUserId, socket.id);
        console.log(
          `User connected: ${mongoUserId} with socket ID: ${socket.id}`
        );
      } else {
        console.log("User not found");
      }
    } else {
      console.log("User ID not provided during connection");
    }

    socket.on("newRequest", newRequestHandler);
    socket.on("newMessage", newMessageHandler);
    socket.on("removeFriend", removeFriendHandler);
    socket.on("outgoingVoiceCall", outgoingVoiceCall);
    socket.on("outgoingVideoCall", outgoingVideoCall);
    socket.on("rejectVoiceCall", rejectVoiceCall);
    socket.on("rejectVideoCall", rejectVideoCall);
    socket.on("acceptIncomingCall", acceptIncomingCall);
    socket.on("refreshGroup", refreshGroupHandler);
    socket.on("deleteGroup", deleteGroupHandler);

    socket.on("disconnect", () => disconnect);
  });
};
export default setupSocket;
