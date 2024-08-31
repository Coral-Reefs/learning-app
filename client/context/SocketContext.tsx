"use client";
import { createContext, useContext, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { io, Socket } from "socket.io-client"; // Import Socket type
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useStateProvider } from "./StateContext";
import { reducerCases } from "./constants";

export const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: any) => {
  const socket = useRef<Socket | null>(null);
  const { user } = useUser();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [{}, dispatch] = useStateProvider();

  useEffect(() => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

    if (!serverUrl) {
      throw new Error(
        "NEXT_PUBLIC_SERVER_URL is not defined in the environment variables."
      );
    }

    if (user) {
      socket.current = io(serverUrl, {
        query: { userId: user.id },
      });
      socket.current.on("connect", () => {
        console.log("Connected to socket server");
      });

      const receiveRequestHandler = () => {
        console.log("Received friend request");
        queryClient.invalidateQueries({ queryKey: ["requests"] });
      };
      const receiveMessageHandler = () => {
        console.log("Received message");
        queryClient.invalidateQueries({ queryKey: ["messages"] });
        queryClient.invalidateQueries({ queryKey: ["chats"] });
        queryClient.invalidateQueries({ queryKey: ["chat"] });
        queryClient.refetchQueries({ queryKey: ["quizzes"] });
      };
      const removedFriendHandler = () => {
        console.log("Deleted friend");
        queryClient.invalidateQueries({ queryKey: ["chats"] });
        router.push("/chats");
      };
      type CallProps = {
        from: any;
        roomId: string;
        callType: string;
      };
      const incomingVoiceCall = ({ from, roomId, callType }: CallProps) => {
        dispatch({
          type: reducerCases.SET_INCOMING_VOICE_CALL,
          incomingVoiceCall: { ...from, roomId, callType },
        });
      };
      const incomingVideoCall = ({ from, roomId, callType }: CallProps) => {
        dispatch({
          type: reducerCases.SET_INCOMING_VIDEO_CALL,
          incomingVideoCall: { ...from, roomId, callType },
        });
      };
      const callRejected = () => {
        console.log("rejected");
        dispatch({ type: reducerCases.END_CALL });
      };

      socket.current.on("receiveRequest", receiveRequestHandler);
      socket.current.on("receiveMessage", receiveMessageHandler);
      socket.current.on("removedFriend", removedFriendHandler);
      socket.current.on("incomingVoiceCall", incomingVoiceCall);
      socket.current.on("incomingVideoCall", incomingVideoCall);
      socket.current.on("voiceCallRejected", callRejected);
      socket.current.on("videoCallRejected", callRejected);

      return () => {
        if (socket.current) {
          socket.current.disconnect();
        }
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
