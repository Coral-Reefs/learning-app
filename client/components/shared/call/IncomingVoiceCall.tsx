import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import React from "react";
import { io } from "socket.io-client";

type Props = {};

const IncomingVoiceCall = (props: Props) => {
  const [{ incomingVoiceCall }, dispatch] = useStateProvider();
  const socket = io(process.env.NEXT_PUBLIC_SERVER_URL!);

  const acceptCall = () => {
    dispatch({
      type: reducerCases.SET_VOICE_CALL,
      voiceCall: { ...incomingVoiceCall, type: "incoming" },
    });
    socket.emit("acceptIncomingCall", { id: incomingVoiceCall._id });

    dispatch({
      type: reducerCases.SET_INCOMING_VOICE_CALL,
      incomingVoiceCall: undefined,
    });
  };
  const rejectCall = () => {
    dispatch({ type: reducerCases.END_CALL });
    socket.emit("rejectVoiceCall", { from: incomingVoiceCall._id });
  };
  return (
    <Card className="w-80 fixed bottom-8 right-6 z-50 drop-shadow-xl flex gap-5 items-center py-4 px-5 border-4">
      <Avatar className="w-16 h-16">
        <AvatarImage src={incomingVoiceCall.image} alt="Profile picture" />
        <AvatarFallback>
          {incomingVoiceCall.firstName.substring(0, 1)}
        </AvatarFallback>
      </Avatar>

      <div>
        <div>{incomingVoiceCall.firstName}</div>
        <div className="text-xs">Incoming Voice Call</div>
        <div className="flex gap-2 mt-2">
          <Button variant="destructive" size="sm" onClick={rejectCall}>
            Reject
          </Button>
          <Button size="sm" onClick={acceptCall}>
            Accept
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default IncomingVoiceCall;
