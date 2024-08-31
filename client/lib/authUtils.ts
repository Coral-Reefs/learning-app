import { auth } from "@clerk/nextjs/server";

export const getSessionToken = async () => {
  const { getToken } = auth();
  const token = await getToken();
  return token;
};

export const getUser = () => {
  const { userId } = auth();
  return userId;
};
