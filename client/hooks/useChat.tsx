import { useParams } from "next/navigation";
import { useMemo } from "react";

export const useChat = () => {
  const params = useParams();

  const chatId = useMemo(
    () => params?.chatId || ("" as string),
    [params?.chatId]
  );

  const isActive = useMemo(() => !!chatId, [chatId]);

  const messageId = useMemo(
    () => params?.messageId || ("" as string),
    [params?.messageId]
  );

  const isMessageActive = useMemo(() => !!messageId, [messageId]);

  return { isActive, chatId, isMessageActive, messageId };
};
