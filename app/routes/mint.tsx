import { addToast, Button, Card, CardBody, Input, toast } from "@heroui/react";
import {
  WebdeedsClient,
  LocalStoragePersistenceAdapter,
  Wallet,
  WebdeedsApiAdapter,
  Output,
  Secret,
} from "webdeeds-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Backpack } from "lucide-react";
import { useNavigate } from "react-router";

const client = new WebdeedsClient({
  baseUrl: "https://api.webdeeds.org",
});

const apiAdapter = new WebdeedsApiAdapter(client);
const persistenceAdapter = new LocalStoragePersistenceAdapter(
  "webdeeds-wallet"
);
const wallet = new Wallet(persistenceAdapter, apiAdapter);

export function meta() {
  return [
    { title: "Mint Webdeeds | DeedWallet" },
    { name: "description", content: "Mint new webdeeds" },
  ];
}

export default function Mint() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    quantity: 1,
  });
  const [mintedDeed, setMintedDeed] = useState<string | null>(null);

  const mintMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const metadata = {
        name: data.name,
        description: data.description,
        image: data.imageUrl,
      };

      const initalOutput = new Output(
        data.quantity,
        "Placeholder",
        new Secret()
      ).toString();

      const results = await client.mint.create({
        metadata,
        outputs: [initalOutput],
      });

      // Add it to the wallet
      await wallet.receive([...results.outputs]);
      return results.itemId;
    },
    onSuccess: (deedId) => {
      addToast({
        title: "Minted deed!",
        description: `Deed: ${deedId} added to you wallet.`,
        color: "success",
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["wallet-items"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mintMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) || 1 : value,
    }));
  };

  const handleGoToWallet = () => {
    navigate("/");
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Mint New Webdeed</h1>
        <Button variant="flat" color="primary" onPress={handleGoToWallet}>
          <Backpack className="w-4 h-4 mr-2" />
          Back to Wallet
        </Button>
      </div>

      {mintedDeed ? (
        <Card className="mb-6 max-w-2xl mx-auto">
          <CardBody>
            <h2 className="text-xl font-semibold mb-4">
              Webdeed Minted Successfully!
            </h2>
            <p className="mb-4">Your webdeed has been added to your wallet.</p>
            <Button
              color="primary"
              className="w-full"
              onPress={handleGoToWallet}
            >
              Go to Wallet
            </Button>
          </CardBody>
        </Card>
      ) : (
        <Card className="mb-6 max-w-2xl mx-auto">
          <CardBody>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    size="lg"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Webdeed name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <Input
                    size="lg"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your webdeed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Image URL
                  </label>
                  <Input
                    size="lg"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Quantity
                  </label>
                  <Input
                    size="lg"
                    name="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity.toString()}
                    onChange={handleChange}
                    placeholder="1"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    size="lg"
                    type="submit"
                    color="primary"
                    isLoading={mintMutation.isPending}
                  >
                    Mint Webdeed
                  </Button>
                </div>
              </div>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
