import { useSession } from "@clerk/nextjs";
import axios from "axios";
import { io } from "socket.io-client";

const url = process.env.NEXT_PUBLIC_SERVER_URL + "/friends";
const socket = io(process.env.NEXT_PUBLIC_SERVER_URL!);

export const useFriendActions = () => {
  const { session } = useSession();

  const removeFriend = async (chatId: string) => {
    const token = await session?.getToken();
    const res = await axios.delete(`${url}/${chatId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    socket.emit("removeFriend", res.data);
    return res.data;
  };

  const getFriends = async () => {
    const token = await session?.getToken();
    const res = await axios.get(`${url}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  };

  return {
    removeFriend,
    getFriends,
  };
};
