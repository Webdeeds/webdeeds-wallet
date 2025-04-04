import { Button, Card, CardBody, Input, Tabs, Tab } from "@heroui/react";
import {
  WebdeedsClient,
  LocalStoragePersistenceAdapter,
  Wallet,
  WebdeedsApiAdapter,
} from "webdeeds-js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { Route } from "./+types/home";
import { WebdeedListItem } from "~/components/webdeed-list-item";
import { Backpack, HistoryIcon, PlusCircle } from "lucide-react";
import { SendWebdeedModal } from "~/components/send-webdeed-modal";
import { Link } from "react-router";

const client = new WebdeedsClient({
  baseUrl: "https://api.webdeeds.org",
});

const apiAdapter = new WebdeedsApiAdapter(client);
const persistenceAdapter = new LocalStoragePersistenceAdapter(
  "webdeeds-wallet"
);
const wallet = new Wallet(persistenceAdapter, apiAdapter);

// Custom storage for seen webdeeds
const SEEN_WEBDEEDS_KEY = "webdeeds-seen";
const getSeenWebdeeds = (): string[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(SEEN_WEBDEEDS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const addSeenWebdeed = (itemId: string) => {
  const seen = getSeenWebdeeds();
  if (!seen.includes(itemId)) {
    seen.push(itemId);
    localStorage.setItem(SEEN_WEBDEEDS_KEY, JSON.stringify(seen));
  }
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DeedWallet | Webdeeds Wallet" },
    { name: "description", content: "A simple Webdeeds wallet implementation" },
  ];
}

export default function Home() {
  const queryClient = useQueryClient();
  const [outputString, setOutputString] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [generatedOutputs, setGeneratedOutputs] = useState<
    Record<string, string>
  >({});
  const [seenWebdeeds, setSeenWebdeeds] = useState<string[]>([]);

  // Load seen webdeeds on mount
  useEffect(() => {
    setSeenWebdeeds(getSeenWebdeeds());
  }, []);

  const { data: items, isLoading } = useQuery({
    queryKey: ["wallet-items"],
    queryFn: async () => {
      const items = await wallet.list();
      // Add new items to seen list
      items.forEach((item) => {
        addSeenWebdeed(item.itemId);
      });
      setSeenWebdeeds(getSeenWebdeeds());
      return items;
    },
  });

  const receiveMutation = useMutation({
    mutationFn: async (outputStrings: string[]) => {
      await wallet.receive(outputStrings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-items"] });
      setOutputString("");
    },
  });

  const sendMutation = useMutation({
    mutationFn: async ({
      itemId,
      amount,
    }: {
      itemId: string;
      amount: number;
    }) => {
      const output = await wallet.send(itemId, amount);
      return output;
    },
    onSuccess: (output, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: ["wallet-items"] });
      setGeneratedOutputs((prev) => ({ ...prev, [itemId]: output }));
    },
  });

  const handleReceive = () => {
    if (outputString.trim()) {
      receiveMutation.mutate([outputString]);
    }
  };

  const handleSend = (itemId: string, amount: number) => {
    sendMutation.mutate({ itemId, amount });
  };

  const handleModalComplete = () => {
    setGeneratedOutputs((prev) => {
      const newOutputs = { ...prev };
      delete newOutputs[selectedItemId!];
      return newOutputs;
    });
  };

  // Get all webdeeds, including those with 0 balance
  const allWebdeeds = seenWebdeeds.map((itemId) => {
    const activeItem = items?.find((item) => item.itemId === itemId);
    return {
      itemId,
      totalAmount: activeItem?.totalAmount || 0,
      isActive: !!activeItem,
    };
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">DeedsWallet</h1>
        <Link to="/mint">
          <Button
            color="primary"
            variant="flat"
            startContent={<PlusCircle className="w-4 h-4" />}
          >
            Mint New
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardBody>
          <h2 className="text-xl font-semibold mb-4">Receive Webdeeds</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Enter deed"
              value={outputString}
              onChange={(e) => setOutputString(e.target.value)}
              className="flex-1"
            />
            <Button
              onPress={handleReceive}
              isLoading={receiveMutation.isPending}
            >
              Receive
            </Button>
          </div>
        </CardBody>
      </Card>

      <Tabs aria-label="Webdeeds sections" color="primary" variant="bordered">
        <Tab
          key="inventory"
          title={
            <div className="flex items-center gap-2">
              <Backpack className="w-4 h-4" />
              <span>Inventory</span>
            </div>
          }
        >
          <div>
            {isLoading ? (
              <div>Loading...</div>
            ) : items && items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.itemId}>
                    <WebdeedListItem
                      itemId={item.itemId}
                      amount={item.totalAmount}
                      onSend={() => setSelectedItemId(item.itemId)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div>No webdeeds in your wallet</div>
            )}
          </div>
        </Tab>

        <Tab
          key="seen"
          title={
            <div className="flex items-center gap-2">
              <HistoryIcon className="w-4 h-4" />
              <span>Seen</span>
            </div>
          }
        >
          <div>
            {isLoading ? (
              <div>Loading...</div>
            ) : allWebdeeds.length > 0 ? (
              <div className="space-y-4">
                {allWebdeeds.map((item) => (
                  <div
                    key={item.itemId}
                    className={!item.isActive ? "opacity-50" : ""}
                  >
                    <WebdeedListItem
                      itemId={item.itemId}
                      amount={item.totalAmount}
                      onSend={() =>
                        item.isActive && setSelectedItemId(item.itemId)
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div>No seen webdeeds</div>
            )}
          </div>
        </Tab>
      </Tabs>

      {selectedItemId && (
        <SendWebdeedModal
          isOpen={!!selectedItemId}
          onClose={() => setSelectedItemId(null)}
          itemId={selectedItemId}
          amount={
            items?.find((item) => item.itemId === selectedItemId)
              ?.totalAmount || 0
          }
          onSend={handleSend}
          isSending={sendMutation.isPending}
          sentDeed={generatedOutputs[selectedItemId]}
          onComplete={handleModalComplete}
        />
      )}
    </div>
  );
}
