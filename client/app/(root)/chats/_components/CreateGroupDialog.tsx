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
import { ChevronsUpDown, CirclePlus, Users2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type Props = {};

const createGroupFormSchema = z.object({
  name: z.string().min(1, {
    message: "This field can't be empty",
  }),
  members: z
    .string()
    .array()
    .min(1, { message: "You must select at least 1 friend" }),
});

const CreateGroupDialog = (props: Props) => {
  const [groupImage, setGroupImage] = useState<File | null>(null);
  const { getFriends } = useFriendActions();
  const { createGroup } = useChatActions();
  const { data: friends, isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
  });
  const { mutate: create, isPending } = useMutation({
    mutationFn: createGroup,
  });

  const form = useForm<z.infer<typeof createGroupFormSchema>>({
    resolver: zodResolver(createGroupFormSchema),
    defaultValues: {
      name: "",
      members: [],
    },
  });

  const imageChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGroupImage(file);
    }
  };

  const members = form.watch("members", []);

  const unselectedFriends = useMemo(() => {
    return friends
      ? friends.filter((friend: any) => !members.includes(friend._id))
      : [];
  }, [members.length, friends?.length]);

  const onSubmitHandler = (values: z.infer<typeof createGroupFormSchema>) => {
    create(
      {
        name: values.name,
        members: values.members,
        image: groupImage,
      },
      {
        onSuccess(data) {
          form.reset();
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
              <CirclePlus />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Create Study Group</p>
        </TooltipContent>
      </Tooltip>

      <DialogContent className="block">
        <DialogHeader>
          <DialogTitle className="text-center">
            Create a study group
          </DialogTitle>
          <DialogDescription className="text-center">
            Add your friends to get started!
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitHandler)}
            className="space-y-8"
          >
            <div className="flex justify-center mb-4">
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <Avatar className="w-24 h-24">
                  {groupImage ? (
                    <AvatarImage src={URL.createObjectURL(groupImage)} />
                  ) : (
                    <AvatarFallback>
                      <Users2 />
                    </AvatarFallback>
                  )}
                </Avatar>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={imageChangeHandler}
                />
              </label>
            </div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Group name..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="members"
              render={() => {
                return (
                  <FormItem>
                    <FormLabel>Members</FormLabel>
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
              <Button disabled={isPending}>Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;
