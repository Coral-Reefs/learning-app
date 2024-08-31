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

const chatMessageSchema = z.object({
  content: z.string().min(1, { message: "This field can't be empty" }),
});

type Props = {
  setEditing: Dispatch<
    SetStateAction<{
      _id: string;
      content: string;
      type: string;
      firstName: string;
      lastName: string;
    } | null>
  >;
  editing?: {
    _id: string;
    content: string;
    type: string;
    firstName: string;
    lastName: string;
  } | null;
};

const EditInput = ({ setEditing, editing }: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { editMessage } = useMessageActions();
  const { mutate: edit, isPending } = useMutation({
    mutationFn: editMessage,
  });
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof chatMessageSchema>>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: { content: editing!.content },
  });

  const onChangeHandler = (e: any) => {
    const { value, selectionStart } = e.target;

    if (selectionStart !== null) {
      form.setValue("content", value);
    }
  };

  const onSubmitHandler = async (values: z.infer<typeof chatMessageSchema>) => {
    console.log(values);
    edit(
      {
        id: editing!._id,
        message: {
          content: values.content,
        },
      },
      {
        onSuccess(data) {
          form.reset();
          if (editing) setEditing(null);
          queryClient.invalidateQueries({ queryKey: ["messages"] });
        },
        onError(e: any) {
          console.log(e);
          toast.error(e.response.data.msg || "Unexpected error occurred");
        },
      }
    );
  };

  return (
    <Card className="w-full p-2 rounded-lg relative">
      {editing && (
        <ChatEmbed
          type="edit"
          firstName={editing.firstName}
          lastName={editing.lastName}
          content={editing.content}
          replyType={editing.type}
          setEmbed={setEditing}
        />
      )}
      <div className="flex gap-2 items-end w-full">
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
                          placeholder="Type a message"
                          className="min-h-full w-full resize-none border-0 outline-0 bg-card text-card-foreground p-1.5"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <Button disabled={isPending} size="icon" type="submit">
                <SendHorizonal />
              </Button>
            </form>
          </Form>
        </>
      </div>
    </Card>
  );
};

export default EditInput;
