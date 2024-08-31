import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import { cn } from "@/lib/utils";
import { CircleArrowLeft, Phone, Settings, Video } from "lucide-react";
import Link from "next/link";
import React from "react";
import GroupInfoSheet from "./dialogs/GroupInfoSheet";

type Props = {
  currentChatUser: object;
  isGroup: boolean;
  image?: string;
  name: string;
  options?: {
    label: string;
    destructive: boolean;
    onClick: () => void;
  }[];
  chatId: string;
};

const Header = ({
  currentChatUser,
  isGroup,
  image,
  name,
  options,
  chatId,
}: Props) => {
  const [{}, dispatch]: any = useStateProvider();
  const handleVoiceCall = () => {
    dispatch({
      type: reducerCases.SET_VOICE_CALL,
      voiceCall: {
        ...currentChatUser,
        type: "outgoing",
        callType: "voice",
        roomId: Date.now(),
      },
    });
  };

  const handleVideoCall = () => {
    dispatch({
      type: reducerCases.SET_VIDEO_CALL,
      videoCall: {
        ...currentChatUser,
        type: "outgoing",
        callType: "video",
        roomId: Date.now(),
      },
    });
  };
  return (
    <Card className="w-full flex rounded-lg items-center p-2 justify-between">
      <div className="flex items-center gap-2 flex-1">
        <Link href="/chats" className="block lg:hidden">
          <CircleArrowLeft />
        </Link>
        <Sheet>
          <SheetTrigger className="flex items-center gap-2 w-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={
                  isGroup
                    ? `${process.env.NEXT_PUBLIC_SERVER_URL}/${image}`
                    : image
                }
              ></AvatarImage>
              <AvatarFallback>
                {name.substring(0, 1).toLocaleUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="font-semibold">{name}</h2>
          </SheetTrigger>
          <GroupInfoSheet
            isGroup={isGroup}
            image={image}
            name={name}
            chatId={chatId}
          />
        </Sheet>
      </div>
      <div className="flex gap-2">
        {!isGroup && (
          <>
            <Button size="icon" variant="ghost" onClick={handleVoiceCall}>
              <Phone />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleVideoCall}>
              <Video />
            </Button>
          </>
        )}
        {options ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button size="icon" variant="secondary">
                <Settings />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {options.map((option, id) => {
                return (
                  <DropdownMenuItem
                    key={id}
                    onClick={option.onClick}
                    className={cn("font-semibold", {
                      "text-destructive": option.destructive,
                    })}
                  >
                    {option.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </Card>
  );
};

export default Header;
