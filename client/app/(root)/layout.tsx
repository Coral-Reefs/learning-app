"use client";
import SidebarWrapper from "@/components/shared/sidebar/SidebarWrapper";
import { useStateProvider } from "@/context/StateContext";
import React from "react";
import VideoCall from "../../components/shared/call/VideoCall";
import VoiceCall from "../../components/shared/call/VoiceCall";
import IncomingVideoCall from "@/components/shared/call/IncomingVideoCall";
import IncomingVoiceCall from "@/components/shared/call/IncomingVoiceCall";

type Props = React.PropsWithChildren<{}>;

const Layout = ({ children }: Props) => {
  const [{ videoCall, voiceCall, incomingVideoCall, incomingVoiceCall }]: any =
    useStateProvider();

  return (
    <>
      {incomingVideoCall && <IncomingVideoCall />}
      {incomingVoiceCall && <IncomingVoiceCall />}
      {videoCall && (
        <div className="h-screen w-screen max-h-full overflow-hidden">
          <VideoCall />
        </div>
      )}
      {voiceCall && (
        <div className="h-screen w-screen max-h-full overflow-hidden">
          <VoiceCall />
        </div>
      )}
      {!voiceCall && !videoCall && <SidebarWrapper>{children}</SidebarWrapper>}
    </>
  );
};

export default Layout;
