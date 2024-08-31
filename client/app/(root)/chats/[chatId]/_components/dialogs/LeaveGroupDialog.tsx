"use client";
import { useChatActions } from "@/api/chats";
import { useFriendActions } from "@/api/friends";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

type Props = {
  chatId: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const LeaveGroupDialog = ({ chatId, open, setOpen }: Props) => {
  const { leaveGroup } = useChatActions();
  const { mutate: leave, isPending } = useMutation({
    mutationFn: leaveGroup,
  });
  const queryClient = useQueryClient();
  const router = useRouter();
  const leaveGroupHandler = async () => {
    leave(chatId, {
      onSuccess(data) {
        toast.success(data.msg);
        queryClient.invalidateQueries({ queryKey: ["chats"] });
        router.push("/chats");
      },
      onError(e: any) {
        console.log(e);
        toast.error(e.response.data.msg || "Unexpected error occured");
      },
    });
  };
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. You will not be able to message this
            group.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isPending} onClick={leaveGroupHandler}>
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LeaveGroupDialog;
