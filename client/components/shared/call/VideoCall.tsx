import { useStateProvider } from "@/context/StateContext";
import React, { useEffect } from "react";
import Container from "./Container";
import { io } from "socket.io-client";
import { useUser } from "@clerk/clerk-react";

type Props = {};

const VideoCall = (props: Props) => {
  const socket = io(process.env.NEXT_PUBLIC_SERVER_URL!);
  const { user } = useUser();
  const clerkUserId = user!.id;
  const [{ videoCall }] = useStateProvider();

  useEffect(() => {
    if (videoCall.type === "outgoing") {
      socket.emit("outgoingVideoCall", {
        to: videoCall._id,
        from: clerkUserId,
        callType: videoCall.callType,
        roomId: videoCall.roomId,
      });
    }
  }, [videoCall]);
  return <Container data={videoCall} />;
};

export default VideoCall;
