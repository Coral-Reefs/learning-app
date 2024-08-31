import { useMessageActions } from "@/api/messages";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useChat } from "@/hooks/useChat";
import { useMutation } from "@tanstack/react-query";
import React, { Dispatch, SetStateAction, useState } from "react";

type Props = {
  fileDialogOpen: boolean;
  setFileDialogOpen: Dispatch<SetStateAction<boolean>>;
  fileType: string | null;
  selectedFile: File | null;
};

const FileUploadDialog = ({
  fileDialogOpen,
  setFileDialogOpen,
  fileType,
  selectedFile,
}: Props) => {
  const { chatId } = useChat();
  const { createMessage } = useMessageActions();
  const { mutate: send, isPending } = useMutation({
    mutationFn: createMessage,
  });
  const [content, setContent] = useState("");

  const onChangeHandler = (e: any) => {
    setContent(e.target.value);
  };
  const onSubmitHandler = (e: any) => {
    e.preventDefault();
    console.log(selectedFile);
    const payload = {
      chatId,
      message: {
        file: selectedFile,
        type: fileType,
        ...(content ? { content } : {}),
      },
    };
    send(payload, {
      onSuccess(data) {
        setFileDialogOpen(false);
        setContent("");
        console.log(data);
      },
      onError(e) {
        console.log(e);
      },
    });
  };
  return (
    <Dialog open={fileDialogOpen} onOpenChange={setFileDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send {fileType}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center">
          {fileType === "image" && (
            <img
              src={URL.createObjectURL(selectedFile!)}
              alt="Selected"
              className="max-w-md max-h-96 rounded-xl"
            />
          )}
          {fileType === "video" && (
            <video controls>
              <source src={URL.createObjectURL(selectedFile!)} />
            </video>
          )}
          {fileType === "document" && (
            <div className="flex items-center w-full">
              <div className="flex items-center justify-center bg-red-500 w-16 h-16 mr-4 text-white rounded-xl">
                {selectedFile!.name.split(".").pop()?.toLowerCase()}
              </div>
              <div>
                <p>{selectedFile!.name}</p>
                <p className="text-sm opacity-50">
                  {(selectedFile!.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          )}
          <form
            className="w-full flex items-center gap-3 mt-3"
            onSubmit={onSubmitHandler}
          >
            <Input
              placeholder="Add a caption..."
              className="w-full p-2 border rounded-md outline-none"
              name="content"
              onChange={onChangeHandler}
            />
            <Button disabled={isPending}>Send</Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadDialog;
