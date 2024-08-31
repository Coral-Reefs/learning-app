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
import React, { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

type Props = {
  chatId: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const DeleteGroupDialog = ({ chatId, open, setOpen }: Props) => {
  const { deleteGroup } = useChatActions();
  const { mutate: remove, isPending } = useMutation({
    mutationFn: deleteGroup,
  });
  const queryClient = useQueryClient();
  const deleteGroupHandler = async () => {
    remove(chatId, {
      onSuccess(data) {
        toast.success(data.msg);
        queryClient.invalidateQueries({ queryKey: ["chats"] });
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
            This action cannot be undone. All messages will be deleted and you
            will not be able to message this group.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={deleteGroupHandler}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteGroupDialog;
