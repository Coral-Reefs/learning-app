import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { UserPlus2 } from "lucide-react";
import React, { useState } from "react";
import AddMemberDialog from "./AddMemberDialog";
import { useQuery } from "@tanstack/react-query";
import { useChatActions } from "@/api/chats";

type Props = {
  isGroup: boolean;
  name: string;
  image?: string;
  chatId: any;
};

const GroupInfoSheet = ({ isGroup, name, image, chatId }: Props) => {
  const { getChatById } = useChatActions();

  const {
    data: chat,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: getChatById,
  });
  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>{isGroup ? "Group info" : "Profile"}</SheetTitle>
        <SheetDescription></SheetDescription>
      </SheetHeader>
      <div className="w-full flex flex-col items-center gap-3">
        <Avatar className="h-40 w-40">
          <AvatarImage
            src={
              isGroup ? `${process.env.NEXT_PUBLIC_SERVER_URL}/${image}` : image
            }
          ></AvatarImage>
          <AvatarFallback className="text-5xl">
            {name.substring(0, 1).toLocaleUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-xl font-bold">{name}</h1>
        <p className="text-sm">
          {isGroup ? chat.members.length + " members" : chat.otherMember.phone}
        </p>
      </div>
      {isGroup && (
        <div className="py-3 space-y-2">
          <div className="flex justify-between items-center">
            <h5>Members</h5>
            <AddMemberDialog chatId={chat._id} existingMembers={chat.members} />
          </div>

          {chat.members.map((member: any) => {
            return (
              <Card className="flex p-2 items-center gap-3" key={member._id}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.image}></AvatarImage>
                  <AvatarFallback>
                    {name.substring(0, 1).toLocaleUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {member.firstName}
              </Card>
            );
          })}
        </div>
      )}
    </SheetContent>
  );
};

export default GroupInfoSheet;
