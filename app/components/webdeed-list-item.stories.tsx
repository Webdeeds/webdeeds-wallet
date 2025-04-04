import type { Meta, StoryObj } from "@storybook/react";
import { WebdeedListItem } from "./webdeed-list-item";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse, delay } from "msw";

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
  title: "Components/WebdeedListItem",
  component: WebdeedListItem,
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
} satisfies Meta<typeof WebdeedListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockWebdeedData = {
  id: "webdeed-123",
  metadata: {
    name: "Sample Webdeed",
    description:
      "This is a sample webdeed with some description text that might be quite long and wrap to multiple lines.",
    image: "https://picsum.photos/200",
  },
};

export const Default: Story = {
  args: {
    itemId: "webdeed-123",
    amount: 42.5,
    onSend: (itemId) => console.log("Send clicked for item:", itemId),
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

export const Loading: Story = {
  args: {
    itemId: "webdeed-123",
    amount: 42.5,
    onSend: (itemId) => console.log("Send clicked for item:", itemId),
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

export const Sending: Story = {
  args: {
    itemId: "webdeed-123",
    amount: 42.5,
    onSend: (itemId) => console.log("Send clicked for item:", itemId),
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

export const Error: Story = {
  args: {
    itemId: "webdeed-123",
    amount: 42.5,
    onSend: (itemId) => console.log("Send clicked for item:", itemId),
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
