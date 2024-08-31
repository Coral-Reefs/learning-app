"use client";
import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRequestActions } from "@/api/requests";
import Loading from "@/components/shared/Loading";
import ItemList from "@/components/shared/item-list/ItemList";
import AddFriendDialog from "./_components/AddFriendDialog";
import Request from "./_components/Request";
import ChatFallback from "@/components/shared/chat/ChatFallback";

const FriendsPage = () => {
  const { getRequests } = useRequestActions();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["requests"],
    queryFn: getRequests,
  });

  if (isLoading) return <Loading />;

  return (
    <>
      <ItemList title="Friends" action={<AddFriendDialog />}>
        {requests.length === 0 ? (
          <p className="w-full h-full flex items-center justify-center">
            No friend requests at the moment
          </p>
        ) : (
          requests.map((request: any) => (
            <Request
              key={request._id}
              sender={request.sender}
              id={request._id}
            />
          ))
        )}
      </ItemList>
      <ChatFallback />
    </>
  );
};

export default FriendsPage;
