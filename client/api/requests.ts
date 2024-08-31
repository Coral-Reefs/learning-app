import { useSession } from "@clerk/nextjs";
import axios from "axios";
import { io } from "socket.io-client";

const url = process.env.NEXT_PUBLIC_SERVER_URL + "/requests";
const socket = io(process.env.NEXT_PUBLIC_SERVER_URL!);

export const useRequestActions = () => {
  const { session } = useSession();

  const getRequests = async () => {
    const token = await session?.getToken();
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  };

  const createRequest = async (body: any) => {
    const token = await session?.getToken();
    const res = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    socket.emit("newRequest", res.data);
    return res.data;
  };

  const denyRequest = async (id: string) => {
    const token = await session?.getToken();
    const res = await axios.delete(url + "/deny/" + id, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  };

  const acceptRequest = async (id: string) => {
    const token = await session?.getToken();
    const res = await axios.post(
      `${url}/accept/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  };

  return {
    getRequests,
    createRequest,
    denyRequest,
    acceptRequest,
  };
};
