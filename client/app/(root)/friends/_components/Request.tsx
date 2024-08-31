import { useRequestActions } from "@/api/requests";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, UserRound, X } from "lucide-react";
import React from "react";
import { toast } from "sonner";

type Props = {
  id: string;
  sender: {
    image: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
};

const Request = ({
  id,
  sender: { image, firstName, lastName, phone },
}: Props) => {
  const { denyRequest, acceptRequest } = useRequestActions();
  const { mutate: deny, isPending: denyPending } = useMutation({
    mutationFn: denyRequest,
  });
  const { mutate: accept, isPending: acceptPending } = useMutation({
    mutationFn: acceptRequest,
  });
  const queryClient = useQueryClient();
  return (
    <Card className="w-full p-2 flex flex-row items-center justify-between gap-2">
      <div className="flex items-center gap-4 truncate">
        <Avatar>
          <AvatarImage src={image} />
          <AvatarFallback>
            <UserRound />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col truncate">
          <h4 className="truncate">
            {firstName} {lastName}
          </h4>
          <p className="text-xs text-muted-foreground truncate">{phone}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          disabled={denyPending || acceptPending}
          onClick={() => {
            accept(id, {
              onSuccess(data) {
                toast.success(data.msg);
                queryClient.invalidateQueries({ queryKey: ["requests"] });
              },
              onError(e: any) {
                toast.error(e.response.data.msg);
                console.log(e);
              },
            });
          }}
        >
          <Check />
        </Button>
        <Button
          size="icon"
          disabled={denyPending || acceptPending}
          variant="destructive"
          onClick={() => {
            deny(id, {
              onSuccess(data) {
                toast.success(data.msg);
                queryClient.invalidateQueries({ queryKey: ["requests"] });
              },
              onError(e: any) {
                toast.error(e.response.data.msg);
                console.log(e);
              },
            });
          }}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
    </Card>
  );
};

export default Request;
