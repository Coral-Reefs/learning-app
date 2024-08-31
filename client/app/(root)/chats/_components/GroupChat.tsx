import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { UserRound } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import React from "react";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  name: string;
  image: string;
  lastMessage: any;
};

const GroupChat = ({ id, name, image, lastMessage }: Props) => {
  const formatTime = (timestamp: number) => {
    return format(timestamp, "hh:mm a");
  };
  const { chatId } = useChat();
  const imageUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/${image}`;
  return (
    <Link href={`/chats/${id}`} className="w-full">
      <Card
        className={cn("p-2 flex flex-row items-center gap-4 truncate", {
          "bg-card-foreground/5": chatId == id,
        })}
      >
        <div className="flex flex-row items-center gap-4 w-full">
          <Avatar>
            <AvatarImage src={imageUrl} />
            <AvatarFallback>
              {name.charAt(0).toLocaleUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col truncate w-full">
            <div className="flex flex-row justify-between">
              <h4 className="truncate">{name}</h4>
              <p className="text-xs text-muted-foreground">
                {lastMessage ? formatTime(lastMessage.create_at) : null}
              </p>
            </div>
            {lastMessage ? (
              <span className="text-sm text-muted-foreground flex truncate overflow-ellipsis">
                <p className="font-semibold">
                  {lastMessage.user.firstName}
                  {":"}&nbsp;
                </p>
                <p className="truncate overflow-ellipsis">
                  {lastMessage.type == "text"
                    ? lastMessage.content
                    : `[${lastMessage.type}]`}
                </p>
              </span>
            ) : (
              <p className="text-sm text-muted-foreground truncate">
                {lastMessage === null
                  ? "[deleted message]"
                  : "Start the conversation!"}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default GroupChat;
