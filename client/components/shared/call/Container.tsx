import { useUsersActions } from "@/api/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { reducerCases } from "@/context/constants";
import { useSocket } from "@/context/SocketContext";
import { useStateProvider } from "@/context/StateContext";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { Phone } from "lucide-react";
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { cn } from "@/lib/utils";

type Props = {
  data: any;
};

const Container = ({ data }: Props) => {
  const socket = io(process.env.NEXT_PUBLIC_SERVER_URL!);
  const socketListener = useSocket();
  const { user } = useUser();
  const [{}, dispatch] = useStateProvider();
  const [callAccepted, setCallAccepted] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const { getToken } = useUsersActions();

  useEffect(() => {
    if (!socketListener) return;

    if (data.type === "outgoing") {
      socketListener.on("callAccepted", () => setCallAccepted(true));
    } else {
      setTimeout(() => {
        setCallAccepted(true);
      }, 1000);
    }

    return () => {
      socketListener.off("callAccepted");
    };
  }, [data, socketListener]);

  const { data: returnedToken, isLoading } = useQuery({
    queryKey: ["callToken"],
    queryFn: getToken,
  });

  useEffect(() => {
    if (!isLoading && returnedToken) {
      setToken(returnedToken.token);
    }
  }, [callAccepted]);

  const generateKitToken = () => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expiredTimestamp = currentTimestamp + 7200;
    const token = ZegoUIKitPrebuilt.generateKitTokenForTest(
      parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID!),
      process.env.NEXT_PUBLIC_ZEGO_SERVER_ID!,
      data.roomId.toString(),
      user!.id,
      user?.firstName + " " + user?.lastName,
      expiredTimestamp
    );
    return token;
  };

  useEffect(() => {
    if (callAccepted) {
      const myToken = generateKitToken();
      const zp = ZegoUIKitPrebuilt.create(myToken);
      zp.joinRoom({
        container: document.querySelector("#root") as any,
        ...(data.callType === "voice"
          ? { turnOnCameraWhenJoining: false }
          : {}),
        sharedLinks: [
          {
            url:
              window.location.origin +
              window.location.pathname +
              "?roomID=" +
              data.roomId,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        showPreJoinView: false,
        onLeaveRoom: () => {
          endCall();
          zp.destroy();
          stopMediaDevices();
        },
        onUserLeave(users) {
          if (users.length == 1) {
            zp.destroy();
            stopMediaDevices();
          }
        },
      });

      const stopMediaDevices = () => {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          navigator.mediaDevices.enumerateDevices().then((devices) => {
            devices.forEach((device) => {
              if (
                device.kind === "videoinput" ||
                device.kind === "audioinput"
              ) {
                navigator.mediaDevices
                  .getUserMedia({ [device.kind.split("input")[0]]: true })
                  .then((stream) => {
                    stream.getTracks().forEach((track) => track.stop());
                  });
              }
            });
          });
        }
      };

      return () => {
        socketListener?.off("rejectVoiceCall");
        socketListener?.off("rejectVideoCall");
        stopMediaDevices();
      };
    }
  }, [callAccepted, token, data, socketListener]);

  const endCall = () => {
    const id = data._id;
    if (data.callType === "voice") {
      socket.emit("rejectVoiceCall", { from: id });
    } else {
      socket.emit("rejectVideoCall", { from: id });
    }

    dispatch({ type: reducerCases.END_CALL });
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <div className="flex flex-col gap-3 items-center">
        {!callAccepted && (
          <>
            <h4 className="text-5xl">
              {data.firstName} {data.lastName}
            </h4>
            <p className="animate-pulse text-lg">Calling...</p>
          </>
        )}
      </div>

      {!callAccepted && (
        <>
          <div className="my-24">
            <Avatar className="w-72 h-72">
              <AvatarImage src={data.image} alt="Profile picture" />
              <AvatarFallback>{data.firstName.substring(0, 1)}</AvatarFallback>
            </Avatar>
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="w-16 h-16"
            onClick={endCall}
          >
            <Phone className="rotate-[135deg]" />
          </Button>
        </>
      )}

      {callAccepted && <div id="root" className="w-screen h-screen"></div>}
    </div>
  );
};

export default Container;
