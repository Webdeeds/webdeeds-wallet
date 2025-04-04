import type { Meta, StoryObj } from "@storybook/react";
import { SendWebdeedModal } from "./send-webdeed-modal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse, delay } from "msw";
import { useState } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  },
});

const meta = {
  title: "Components/SendWebdeedModal",
  component: SendWebdeedModal,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="w-[500px]">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof SendWebdeedModal>;

export default meta;

const mockWebdeedData = {
  id: "webdeed-123",
  metadata: {
    name: "Sample Webdeed",
    description:
      "This is a sample webdeed with some description text that might be quite long and wrap to multiple lines.",
    image: "https://picsum.photos/200",
  },
};

const mockSentDeed = "webdeed.1234567890abcdef.9876543210fedcba";

const Template = (args: any) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sentDeed, setSentDeed] = useState<string | undefined>(undefined);

  const handleSend = async (itemId: string, amount: number) => {
    setIsSending(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSentDeed(mockSentDeed);
    setIsSending(false);
  };

  return (
    <SendWebdeedModal
      {...args}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSend={handleSend}
      isSending={isSending}
      sentDeed={sentDeed}
    />
  );
};

export const Default: StoryObj = {
  render: Template,
  args: {
    itemId: "webdeed-123",
    amount: 42.5,
  },
  parameters: {
    msw: {
      handlers: [
        http.get("https://api.webdeeds.org/v1/item/webdeed-123", () => {
          return HttpResponse.json(mockWebdeedData);
        }),
      ],
    },
  },
};

export const Loading: StoryObj = {
  render: Template,
  args: {
    itemId: "webdeed-123",
    amount: 42.5,
  },
  parameters: {
    msw: {
      handlers: [
        http.get("https://api.webdeeds.org/v1/item/webdeed-123", async () => {
          await delay(2000);
          return HttpResponse.json(mockWebdeedData);
        }),
      ],
    },
  },
};

export const Sending: StoryObj = {
  render: Template,
  args: {
    itemId: "webdeed-123",
    amount: 42.5,
    isSending: true,
  },
  parameters: {
    msw: {
      handlers: [
        http.get("https://api.webdeeds.org/v1/item/webdeed-123", () => {
          return HttpResponse.json(mockWebdeedData);
        }),
      ],
    },
  },
};

export const Sent: StoryObj = {
  render: Template,
  args: {
    itemId: "webdeed-123",
    amount: 42.5,
    sentDeed: mockSentDeed,
  },
  parameters: {
    msw: {
      handlers: [
        http.get("https://api.webdeeds.org/v1/item/webdeed-123", () => {
          return HttpResponse.json(mockWebdeedData);
        }),
      ],
    },
  },
};

export const Error: StoryObj = {
  render: Template,
  args: {
    itemId: "webdeed-123",
    amount: 42.5,
  },
  parameters: {
    msw: {
      handlers: [
        http.get("https://api.webdeeds.org/v1/item/webdeed-123", () => {
          return new HttpResponse(null, { status: 404 });
        }),
      ],
    },
  },
};
