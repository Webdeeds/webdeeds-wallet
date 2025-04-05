import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Chip,
  Alert,
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { WebdeedsClient } from "webdeeds-js";
import { useState } from "react";
import { Copy } from "lucide-react";

const client = new WebdeedsClient({
  baseUrl: "https://api.webdeeds.org",
});

interface SendWebdeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  amount: number;
  onSend: (itemId: string, amount: number) => void;
  isSending?: boolean;
  sentDeed?: string;
  onComplete?: () => void;
}

export function SendWebdeedModal({
  isOpen,
  onClose,
  itemId,
  amount,
  onSend,
  isSending = false,
  sentDeed,
  onComplete,
}: SendWebdeedModalProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["webdeed-metadata", itemId],
    queryFn: async () => {
      const item = await client.registry.getItemById(itemId);
      return item;
    },
  });

  const [sendAmount, setSendAmount] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSend = () => {
    const amountToSend = parseFloat(sendAmount);
    if (!isNaN(amountToSend) && amountToSend > 0 && amountToSend <= amount) {
      onSend(itemId, amountToSend);
    }
  };

  const handleCopy = async () => {
    if (sentDeed) {
      await navigator.clipboard.writeText(sentDeed);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    if (sentDeed) {
      if (
        window.confirm(
          "Are you sure you want to close? Make sure you've copied the deed value!"
        )
      ) {
        onClose();
        onComplete?.();
      }
    } else {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <ModalHeader>
          <h2 className="text-xl font-semibold">Send Webdeed</h2>
        </ModalHeader>
        <ModalBody>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg overflow-hidden">
                  <img
                    src={data?.metadata?.image || "/placeholder.png"}
                    alt={data?.metadata?.name || "Webdeed"}
                    className="object-cover h-full w-full"
                  />
                </div>
                <div>
                  <Chip size="sm" variant="flat" className="mb-1">
                    {itemId}
                  </Chip>
                  <h3 className="font-semibold">
                    {data?.metadata?.name || "Untitled"}
                  </h3>
                  <p className="text-sm text-gray-600">Available: {amount}</p>
                </div>
              </div>
              {sentDeed ? (
                <div className="space-y-2">
                  <Alert color="success" variant="flat">
                    Webdeed is ready to be sent!
                  </Alert>
                  <div className="flex gap-2">
                    <Input
                      value={sentDeed}
                      isReadOnly
                      className="flex-1 font-mono text-sm"
                    />
                    <Button
                      variant="flat"
                      onPress={handleCopy}
                      endContent={<Copy className="h-4 w-4" />}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <Input
                    size="lg"
                    type="number"
                    label="Amount to send"
                    placeholder="Enter amount"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    min={0}
                    max={amount}
                    step="0.1"
                  />
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={handleClose}>
            Cancel
          </Button>
          {sentDeed ? (
            <Button color="primary" onPress={handleClose}>
              Done
            </Button>
          ) : (
            <Button
              color="primary"
              onPress={handleSend}
              isLoading={isSending}
              isDisabled={
                !sendAmount ||
                parseFloat(sendAmount) <= 0 ||
                parseFloat(sendAmount) > amount
              }
            >
              Send
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
