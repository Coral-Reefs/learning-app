"use client";
import { useChatActions } from "@/api/chats";
import ChatContainer from "@/components/shared/chat/ChatContainer";
import Loading from "@/components/shared/Loading";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import Header from "./_components/Header";
import Body from "./_components/body/Body";
import ChatInput from "./_components/input/ChatInput";
import RemoveFriendDialog from "./_components/dialogs/RemoveFriendDialog";
import Error from "./error";
import EditInput from "./_components/input/EditInput";
import DeleteGroupDialog from "./_components/dialogs/DeleteGroupDialog";
import LeaveGroupDialog from "./_components/dialogs/LeaveGroupDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuizBody from "./_components/body/QuizBody";
import QuizInput from "./_components/input/QuizInput";

type Props = {
  params: { chatId: string };
};

const ChatPage = ({ params: { chatId } }: Props) => {
  const { getChatById } = useChatActions();
  const {
    data: chat,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: getChatById,
  });

  const [removeFriendDialog, setRemoveFriendDialog] = useState(false);
  const [deleteGroupDialog, setDeleteGroupDialog] = useState(false);
  const [leaveGroupDialog, setLeaveGroupDialog] = useState(false);
  const [editing, setEditing] = useState<{
    _id: string;
    type: string;
    content: string;
    firstName: string;
    lastName: string;
  } | null>(null);
  const [replying, setReplying] = useState<{
    _id: string;
    content: string;
    type: string;
    firstName: string;
    lastName: string;
  } | null>(null);
  const [tab, setTab] = useState<"quiz" | "chat">("quiz");

  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;

  return (
    <ChatContainer>
      <RemoveFriendDialog
        chatId={chatId}
        open={removeFriendDialog}
        setOpen={setRemoveFriendDialog}
      />
      <DeleteGroupDialog
        chatId={chatId}
        open={deleteGroupDialog}
        setOpen={setDeleteGroupDialog}
      />
      <LeaveGroupDialog
        chatId={chatId}
        open={leaveGroupDialog}
        setOpen={setLeaveGroupDialog}
      />
      <Header
        name={
          chat.isGroup
            ? chat.name
            : `${chat.otherMember.firstName} ${chat.otherMember.lastName}`
        }
        image={chat.isGroup ? chat.image || undefined : chat.otherMember.image}
        options={
          chat.isGroup
            ? [
                {
                  label: "Leave group",
                  destructive: false,
                  onClick: () => setLeaveGroupDialog(true),
                },
                {
                  label: "Delete group",
                  destructive: true,
                  onClick: () => setDeleteGroupDialog(true),
                },
              ]
            : [
                {
                  label: "Remove friend",
                  destructive: true,
                  onClick: () => setRemoveFriendDialog(true),
                },
              ]
        }
        currentChatUser={chat.otherMember || chat.members}
        isGroup={chat.isGroup}
        chatId={chatId}
      />
      <Tabs defaultValue="quiz">
        <TabsList className="flex">
          <TabsTrigger
            value="quiz"
            className="flex-1"
            onClick={() => setTab("quiz")}
          >
            Quizzes
          </TabsTrigger>
          <TabsTrigger
            value="chat"
            className="flex-1"
            onClick={() => setTab("chat")}
          >
            Chat
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab == "chat" ? (
        <>
          <Body
            setEditing={setEditing}
            setReplying={setReplying}
            isGroup={chat.isGroup}
            members={
              chat.isGroup
                ? chat.members
                  ? chat.members
                  : []
                : chat.otherMember
                ? [chat.otherMember]
                : []
            }
          />
          {editing ? (
            <EditInput setEditing={setEditing} editing={editing} />
          ) : (
            <ChatInput setReplying={setReplying} replying={replying} />
          )}
        </>
      ) : (
        <>
          <QuizBody
            setEditing={setEditing}
            setReplying={setReplying}
            isGroup={chat.isGroup}
            members={
              chat.isGroup
                ? chat.members
                  ? chat.members
                  : []
                : chat.otherMember
                ? [chat.otherMember]
                : []
            }
          />
          <QuizInput />
        </>
      )}
    </ChatContainer>
  );
};

export default ChatPage;
