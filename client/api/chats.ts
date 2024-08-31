import { useSession } from "@clerk/nextjs";
import axios from "axios";
import { io } from "socket.io-client";

const url = process.env.NEXT_PUBLIC_SERVER_URL + "/chats";
const socket = io(process.env.NEXT_PUBLIC_SERVER_URL!);

export const useChatActions = () => {
  const { session } = useSession();

  const getChats = async () => {
    const token = await session?.getToken();
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  };

  const getChatById = async ({ queryKey }: any) => {
    const id = queryKey[1];
    const token = await session?.getToken();
    const res = await axios.get(`${url}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  };

  const createGroup = async (group: any) => {
    const token = await session?.getToken();
    const res = await axios.post(`${url}/group`, group, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    socket.emit("refreshGroup", res.data);

    return res.data;
  };

  const addMember = async ({ chatId, members }: any) => {
    const token = await session?.getToken();
    const res = await axios.post(`${url}/group/${chatId}`, members, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    socket.emit("newMessage", res.data);
    socket.emit("refreshGroup", res.data);
    return res.data;
  };

  const deleteGroup = async (id: any) => {
    const token = await session?.getToken();
    const res = await axios.delete(`${url}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    socket.emit("deleteGroup", res.data);
    return res.data;
  };

  const leaveGroup = async (id: any) => {
    const token = await session?.getToken();
    const res = await axios.delete(`${url}/leave/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    socket.emit("newMessage", res.data);
    socket.emit("refreshGroup", res.data);
    return res.data;
  };

  // const markRead = async (body: any) => {
  //   const token = await session?.getToken();
  //   const res = await axios.post(`${url}/markRead`, body, {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   });
  //   socket.emit("newMessage", res.data);
  //   return res.data;
  // };

  return {
    getChats,
    getChatById,
    createGroup,
    deleteGroup,
    leaveGroup,
    addMember,
  };
};
