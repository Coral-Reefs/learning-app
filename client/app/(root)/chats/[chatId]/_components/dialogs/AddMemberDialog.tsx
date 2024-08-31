"use client";
import { useChatActions } from "@/api/chats";
import { useFriendActions } from "@/api/friends";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, CirclePlus, UserPlus2, Users2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { Dispatch, SetStateAction, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type Props = {
  chatId: string;
  existingMembers: object[];
};

const createGroupFormSchema = z.object({
  members: z
    .string()
    .array()
    .min(1, { message: "You must select at least 1 friend" }),
});

const AddMemberDialog = ({ chatId, existingMembers }: Props) => {
  const { getFriends } = useFriendActions();
  const { addMember } = useChatActions();
  const { data: friends, isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
  });
  const { mutate: add, isPending } = useMutation({
    mutationFn: addMember,
  });
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof createGroupFormSchema>>({
    resolver: zodResolver(createGroupFormSchema),
    defaultValues: {
      members: [],
    },
  });

  const members = form.watch("members", []);

  const unselectedFriends = useMemo(() => {
    if (!friends) return [];

    const existingMemberIds = existingMembers.map((member: any) => member._id);

    return friends.filter(
      (friend: any) =>
        !members.includes(friend._id) && !existingMemberIds.includes(friend._id)
    );
  }, [members.length, friends?.length]);

  const onSubmitHandler = (values: z.infer<typeof createGroupFormSchema>) => {
    add(
      {
        chatId,
        members: values.members,
      },
      {
        onSuccess(data) {
          form.reset();
          queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
        },
        onError(e: any) {
          toast.error(e.response.data.msg || "Unexpected error occurred");
        },
      }
    );
  };

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger>
          <DialogTrigger asChild>
            <Button size="icon" variant="outline">
              <UserPlus2 />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add Member</p>
        </TooltipContent>
      </Tooltip>

      <DialogContent className="block">
        <DialogHeader>
          <DialogTitle className="text-center">Add member</DialogTitle>
          <DialogDescription className="text-center">
            Add your friends to this group!
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitHandler)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="members"
              render={() => {
                return (
                  <FormItem>
                    <FormLabel>Friends</FormLabel>
                    <FormControl>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          disabled={unselectedFriends.length === 0}
                        >
                          <Button
                            className="w-full flex justify-between text-primary/50"
                            variant="outline"
                          >
                            <p>Select Friends</p>
                            <ChevronsUpDown className="w-4 h-4 ms-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          {unselectedFriends.map((friend: any) => {
                            return (
                              <DropdownMenuCheckboxItem
                                key={friend._id}
                                className="flex items-center gap-2 w-full p-2"
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    form.setValue("members", [
                                      ...members,
                                      friend._id,
                                    ]);
                                  }
                                }}
                              >
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={friend.image} />
                                  <AvatarFallback>
                                    {friend.firstName.substring(0, 1)}
                                  </AvatarFallback>
                                </Avatar>
                                <h4 className="truncate">
                                  {friend.firstName} {friend.lastName}
                                </h4>
                              </DropdownMenuCheckboxItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            {members && members.length ? (
              <Card className="flex items-center gap-8 overflow-x-auto w-full h-24 p-5 pt-8 no-scrollbar">
                {friends
                  ?.filter((friend: { _id: string }) =>
                    members.includes(friend._id)
                  )
                  .map(
                    (friend: {
                      _id: string;
                      image: string;
                      firstName: string;
                    }) => {
                      return (
                        <div
                          key={friend._id}
                          className="flex flex-col items-center gap-1"
                        >
                          <div className="relative">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={friend.image} />
                              <AvatarFallback>
                                {friend.firstName.substring(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                            <X
                              className="text-primary/60 w-4 h-4 absolute bottom-8 left-10 bg-muted rounded-full cursor-pointer"
                              onClick={() =>
                                form.setValue(
                                  "members",
                                  members.filter((id) => id !== friend._id)
                                )
                              }
                            />
                          </div>
                          <p className="truncate text-sm">{friend.firstName}</p>
                        </div>
                      );
                    }
                  )}
              </Card>
            ) : null}
            <DialogFooter>
              <Button disabled={isPending}>Add</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberDialog;
