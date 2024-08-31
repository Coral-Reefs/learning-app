import { useSession } from "@clerk/nextjs";
import axios from "axios";
import { io } from "socket.io-client";

const url = process.env.NEXT_PUBLIC_SERVER_URL + "/messages";
const socket = io(process.env.NEXT_PUBLIC_SERVER_URL!);

export const useMessageActions = () => {
  const { session } = useSession();

  const getMessages = async ({ queryKey: [key, chatId] }: any) => {
    const token = await session?.getToken();
    const res = await axios.get(`${url}/${chatId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // console.log(token);
    return res.data;
  };
  const getQuizzes = async ({ queryKey: [key, chatId] }: any) => {
    const token = await session?.getToken();
    const res = await axios.get(`${url}/quiz/${chatId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  };

  const getMessageAnswers = async ({ queryKey: [key, messageId] }: any) => {
    const token = await session?.getToken();
    console.log(messageId);
    const res = await axios.get(`${url}/answers/${messageId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  };

  const createMessage = async ({ chatId, message }: any) => {
    const token = await session?.getToken();
    const res = await axios.post(`${url}/${chatId}`, message, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    socket.emit("newMessage", res.data);
    return res.data;
  };

  const createQuiz = async ({ chatId, quiz }: any) => {
    const token = await session?.getToken();
    const res = await axios.post(`${url}/quiz/${chatId}`, quiz, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    socket.emit("newMessage", res.data);
    return res.data;
  };

  const answerQuiz = async ({ id, optionId }: any) => {
    const token = await session?.getToken();
    const res = await axios.post(
      `${url}/answerQuiz/${id}`,
      { optionId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    socket.emit("newMessage", res.data);
    return res.data;
  };

  const editMessage = async ({ id, message }: any) => {
    const token = await session?.getToken();
    const res = await axios.put(`${url}/${id}`, message, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    socket.emit("newMessage", res.data);
    return res.data;
  };

  const deleteMessage = async (id: any) => {
    console.log("id", id);
    const token = await session?.getToken();
    const res = await axios.delete(`${url}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    socket.emit("newMessage", res.data);
    return res.data;
  };

  return {
    getMessages,
    createMessage,
    editMessage,
    deleteMessage,
    getMessageAnswers,
    getQuizzes,
    createQuiz,
    answerQuiz,
  };
};
