import { useQuery } from "@tanstack/react-query";
import { WebdeedsClient } from "webdeeds-js";
import { ListItem } from "./list-item";
import { Button } from "@heroui/react";

const client = new WebdeedsClient({
  baseUrl: "https://api.webdeeds.org",
});

interface WebdeedListItemProps {
  itemId: string;
  amount: number;
  onSend: (itemId: string) => void;
  isSending?: boolean;
}

export function WebdeedListItem({
  itemId,
  amount,
  onSend,
  isSending = false,
}: WebdeedListItemProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["webdeed-metadata", itemId],
    queryFn: async () => {
      const item = await client.registry.getItemById(itemId);
      return item;
    },
  });

  const actions = (
    <Button
      size="sm"
      variant="flat"
      onPress={() => onSend(itemId)}
      isLoading={isSending}
    >
      Send
    </Button>
  );

  return (
    <ListItem
      id={itemId}
      amount={amount}
      imageUrl={data?.metadata?.image}
      title={data?.metadata?.name}
      description={data?.metadata?.description}
      actions={actions}
      isLoading={isLoading}
    />
  );
}
