import { useMessageActions } from "@/api/messages";
import Loading from "@/components/shared/Loading";
import { useChat } from "@/hooks/useChat";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import Message from "./Message";

type Props = {
  setEditing: Dispatch<
    SetStateAction<{
      _id: string;
      type: string;
      content: string;
      firstName: string;
      lastName: string;
    } | null>
  >;
  setReplying: Dispatch<
    SetStateAction<{
      _id: string;
      content: string;
      type: string;
      firstName: string;
      lastName: string;
    } | null>
  >;
  members: {
    lastSeenMessage: string;
    firstName: string;
    [key: string]: any;
  }[];
  isGroup: boolean;
};

const Body = ({ members, setEditing, setReplying, isGroup }: Props) => {
  const { chatId } = useChat();
  const { getMessages } = useMessageActions();
  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", chatId],
    queryFn: getMessages,
  });

  if (isLoading) return <Loading />;

  return (
    <div className="flex-1 w-full flex overflow-y-scroll flex-col-reverse gap-1 p-3 no-scrollbar">
      {messages?.map((message: any, i: number) => {
        const lastByUser = messages[i - 1]?.user._id === message.user._id;

        return (
          <Message
            key={message._id}
            isGroup={isGroup}
            lastByUser={lastByUser}
            message={message}
            setEditing={setEditing}
            setReplying={setReplying}
          />
        );
      })}
    </div>
  );
};

export default Body;
