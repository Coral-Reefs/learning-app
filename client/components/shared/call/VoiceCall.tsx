import { useStateProvider } from "@/context/StateContext";
import React, { useEffect } from "react";
import Container from "./Container";
import { io } from "socket.io-client";
import { useUser } from "@clerk/clerk-react";

type Props = {};

const VoiceCall = (props: Props) => {
  const socket = io(process.env.NEXT_PUBLIC_SERVER_URL!);
  const { user } = useUser();
  const clerkUserId = user!.id;
  const [{ voiceCall }] = useStateProvider();

  useEffect(() => {
    if (voiceCall.type === "outgoing") {
      socket.emit("outgoingVoiceCall", {
        to: voiceCall._id,
        from: clerkUserId,
        callType: voiceCall.callType,
        roomId: voiceCall.roomId,
      });
    }
  }, [voiceCall]);
  return <Container data={voiceCall} />;
};

export default VoiceCall;
