"use client";
import { useMessageActions } from "@/api/messages";
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
  id: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const DeleteMessageDialog = ({ id, open, setOpen }: Props) => {
  const { deleteMessage } = useMessageActions();
  const { mutate: remove, isPending } = useMutation({
    mutationFn: deleteMessage,
  });
  const queryClient = useQueryClient();
  const deleteMessageHandler = async () => {
    console.log("delete");
    remove(id, {
      onSuccess(data) {
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
          <AlertDialogTitle>Delete message</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this message?
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={deleteMessageHandler}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteMessageDialog;
