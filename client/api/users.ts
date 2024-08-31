import { useSession } from "@clerk/nextjs";
import axios from "axios";

const url = process.env.NEXT_PUBLIC_SERVER_URL + "/users";

export const useUsersActions = () => {
  const { session } = useSession();

  const getUser = async () => {
    if (!session) return {};
    const token = await session.getToken();
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  };

  const getToken = async () => {
    const token = await session?.getToken();
    const res = await axios.get(`${url}/generate-token`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  };

  return { getUser, getToken };
};
