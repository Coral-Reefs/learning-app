"use client";
import { Card, CardContent } from "@/components/ui/card";
import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import { z } from "zod";
import { useChat } from "@/hooks/useChat";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMessageActions } from "@/api/messages";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { Mic, SendHorizonal } from "lucide-react";
import ChatEmbed from "./components/ChatEmbed";
import EmojiPickerComponent from "./components/EmojiPickerComponent";
import FileUpload from "./components/FileUpload";
import CaptureAudio from "./components/CaptureAudio";

const chatMessageSchema = z.object({
  content: z.string().min(1, { message: "This field can't be empty" }),
});

type Props = {
  setReplying: Dispatch<
    SetStateAction<{
      _id: string;
      content: string;
      type: string;
      firstName: string;
      lastName: string;
    } | null>
  >;
  replying?: {
    _id: string;
    content: string;
    type: string;
    firstName: string;
    lastName: string;
  } | null;
};

const ChatInput = ({ setReplying, replying }: Props) => {
  const { chatId } = useChat();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [showAudioRecorder, setshowAudioRecorder] = useState(false);

  const { createMessage } = useMessageActions();
  const { mutate: send, isPending } = useMutation({
    mutationFn: createMessage,
  });
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof chatMessageSchema>>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: { content: "" },
  });

  const onChangeHandler = (e: any) => {
    const { value, selectionStart } = e.target;

    if (selectionStart !== null) {
      form.setValue("content", value);
    }
  };
  const content = form.watch("content");

  const onSubmitHandler = async (values: z.infer<typeof chatMessageSchema>) => {
    const payload = {
      chatId,
      message: {
        type: "text",
        content: values.content,
        ...(replying ? { reply: replying._id } : {}),
      },
    };
    send(payload, {
      onSuccess(data) {
        console.log(data);
        form.reset();
        if (replying) setReplying(null);
        queryClient.invalidateQueries({ queryKey: ["messages"] });
      },
      onError(e: any) {
        console.log(e);
        toast.error(e.response.data.msg || "Unexpected error occurred");
      },
    });
  };

  return (
    <Card className="w-full p-2 rounded-lg relative">
      {replying && (
        <ChatEmbed
          type="reply"
          firstName={replying.firstName}
          lastName={replying.lastName}
          content={replying.content}
          replyType={replying.type}
          setEmbed={setReplying}
        />
      )}
      <div className="flex gap-2 items-end w-full">
        {!showAudioRecorder && (
          <>
            <EmojiPickerComponent textareaRef={textareaRef} form={form} />
            <FileUpload />
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmitHandler)}
                className="flex gap-2 items-end w-full"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => {
                    return (
                      <FormItem className="h-full w-full">
                        <FormControl>
                          <TextareaAutosize
                            onKeyDown={async (e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                await form.handleSubmit(onSubmitHandler)();
                              }
                            }}
                            rows={1}
                            maxRows={3}
                            {...field}
                            ref={textareaRef}
                            onChange={onChangeHandler}
                            onClick={onChangeHandler}
                            placeholder="Ask a question..."
                            className="min-h-full w-full resize-none border-0 outline-0 bg-card text-card-foreground p-1.5"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {content.length ? (
                  <Button disabled={isPending} size="icon" type="submit">
                    <SendHorizonal />
                  </Button>
                ) : (
                  <Button disabled={isPending} size="icon" type="button">
                    <Mic onClick={() => setshowAudioRecorder(true)} />
                  </Button>
                )}
              </form>
            </Form>
          </>
        )}
        {showAudioRecorder && (
          <CaptureAudio
            replying={replying}
            setReplying={setReplying}
            hide={setshowAudioRecorder}
          />
        )}
      </div>
    </Card>
  );
};

export default ChatInput;
