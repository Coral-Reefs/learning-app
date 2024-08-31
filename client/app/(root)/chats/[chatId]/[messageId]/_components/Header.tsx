import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import { CircleArrowLeft, Phone, Settings, Video } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {
  currentChatUser: object;
  isGroup: boolean;
  image?: string;
  name: string;
  options?: {
    label: string;
    destructive: boolean;
    onClick: () => void;
  }[];
  chatId: string;
};

const Header = ({
  currentChatUser,
  isGroup,
  image,
  name,
  options,
  chatId,
}: Props) => {
  const [{}, dispatch]: any = useStateProvider();
  return (
    <Card className="w-full flex rounded-lg items-center p-2 py-4 justify-between">
      <div className="flex items-center gap-2 flex-1">
        <Link href={"/chats/" + chatId}>
          <CircleArrowLeft />
        </Link>
        <h2 className="font-semibold">Viewing Answers</h2>
      </div>
    </Card>
  );
};

export default Header;
