import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, Reply, X } from "lucide-react";
import React, { Dispatch, SetStateAction } from "react";

type Props = {
  type: string;
  firstName: string;
  lastName: string;
  content: string;
  replyType: string;
  setEmbed: Dispatch<
    SetStateAction<{
      _id: string;
      content: string;
      type: string;
      firstName: string;
      lastName: string;
    } | null>
  >;
};

const ChatEmbed = ({
  type,
  firstName,
  lastName,
  content,
  replyType,
  setEmbed,
}: Props) => {
  return (
    <div className="flex items-center gap-3 p-1">
      {type == "reply" ? <Reply /> : <Pencil />}
      <Card className="w-full p-2 border-l-blue-300 border-l-4">
        <span className="text-sm font-semibold">
          {firstName} {lastName}
        </span>
        <p className="truncate">{content || `[${replyType}]`}</p>
      </Card>
      <Button variant="ghost" size="icon" onClick={() => setEmbed(null)}>
        <X />
      </Button>
    </div>
  );
};

export default ChatEmbed;
