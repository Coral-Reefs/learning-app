import { useMessageActions } from "@/api/messages";
import Loading from "@/components/shared/Loading";
import { useChat } from "@/hooks/useChat";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import Message from "./Message";
import Quiz from "./Quiz";
import QuizInput from "../input/QuizInput";

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

const QuizBody = ({ members, setEditing, setReplying, isGroup }: Props) => {
  const { chatId } = useChat();
  const { getQuizzes } = useMessageActions();
  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["quizzes", chatId],
    queryFn: getQuizzes,
  });

  if (isLoading) return <Loading />;

  return (
    <div className="flex-1 w-full flex overflow-y-scroll flex-col-reverse gap-2 p-3 no-scrollbar">
      {!quizzes.length ? (
        <div className="w-full h-full flex justify-center items-center">
          No quizzes to show. Create one now!
        </div>
      ) : (
        quizzes?.map((quiz: any, i: number) => {
          return <Quiz key={quiz._id} quiz={quiz} />;
        })
      )}
    </div>
  );
};

export default QuizBody;
