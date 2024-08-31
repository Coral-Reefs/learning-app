"use client";
import { useChatActions } from "@/api/chats";
import ItemList from "@/components/shared/item-list/ItemList";
import Loading from "@/components/shared/Loading";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import DMChat from "./_components/DMChat";
import CreateGroupDialog from "./_components/CreateGroupDialog";
import GroupChat from "./_components/GroupChat";

type ChatMember = {
  id: string;
  image: string;
  firstName: string;
  lastName: string;
};

type Chat = {
  image: string;
  name: string;
  lastMessage: object;
  isGroup: boolean;
  _id: string;
  members: ChatMember[];
};

type Props = React.PropsWithChildren<{}>;

const ChatsLayout = ({ children }: Props) => {
  const { getChats } = useChatActions();
  const {
    data: chats,
    isLoading,
    error,
  } = useQuery<Chat[]>({
    queryKey: ["chats"],
    queryFn: getChats,
  });

  if (isLoading) return <Loading />;

  return (
    <>
      <ItemList title="Study" action={<CreateGroupDialog />}>
        {!chats || chats.length === 0 ? (
          <p className="w-full h-full flex items-center justify-center">
            No chats available
          </p>
        ) : (
          chats.map((chat) => {
            return !chat.isGroup ? (
              <DMChat
                key={chat._id}
                id={chat._id}
                lastMessage={chat.lastMessage}
                member={chat.members[0]}
              />
            ) : (
              <GroupChat
                key={chat._id}
                id={chat._id}
                name={chat.name}
                image={chat.image}
                lastMessage={chat.lastMessage}
              />
            );
          })
        )}
      </ItemList>
      {children}
    </>
  );
};

export default ChatsLayout;
