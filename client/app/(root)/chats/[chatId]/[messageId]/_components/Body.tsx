import { useMessageActions } from "@/api/messages";
import Loading from "@/components/shared/Loading";
import { useChat } from "@/hooks/useChat";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import Message from "../../_components/body/Message";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
  const { messageId } = useChat();
  const { getMessageAnswers } = useMessageActions();
  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", messageId],
    queryFn: getMessageAnswers,
  });

  if (isLoading) return <Loading />;

  console.log(messages);
  return (
    <div className="flex-1 w-full flex overflow-y-scroll flex-col-reverse gap-1 p-3 no-scrollbar">
      {messages?.map((message: any, i: number) => {
        const lastByUser = messages[i - 1]?.user._id === message.user._id;
        return (
          <>
            {message.originalQuestion && <hr className="my-3" />}
            <Message
              key={message._id}
              isGroup={isGroup}
              lastByUser={lastByUser}
              message={message}
              setEditing={setEditing}
              setReplying={setReplying}
            />
          </>
        );
      })}
    </div>
  );
};

export default Body;
