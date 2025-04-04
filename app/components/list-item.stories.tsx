import type { Meta, StoryObj } from "@storybook/react";
import { ListItem } from "./list-item";
import { Button } from "@heroui/react";

const meta = {
  title: "Components/ListItem",
  component: ListItem,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    imageUrl: "https://picsum.photos/200",
    title: "Sample Webdeed",
    description:
      "This is a sample webdeed with some description text that might be quite long and wrap to multiple lines.",
    id: "webdeed-123456789",
    amount: 42.5,
    actions: (
      <Button size="sm" variant="flat">
        Send
      </Button>
    ),
  },
};

export const TruncatedContent: Story = {
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
  args: {
    imageUrl: "https://picsum.photos/200",
    title:
      "This is a very long title that should be truncated with an ellipsis when it reaches the maximum width of the container",
    description:
      "This is an even longer description that should also be truncated with an ellipsis when it reaches the maximum width of the container. It contains multiple sentences and should demonstrate how the truncation works with very long content.",
    id: "webdeed-123456789",
    amount: 42.5,
    actions: (
      <Button size="sm" variant="flat">
        Send
      </Button>
    ),
  },
};

export const Loading: Story = {
  args: {
    id: "webdeed-123456789",
    amount: 42.5,
    isLoading: true,
  },
};

export const MissingContent: Story = {
  args: {
    id: "webdeed-123456789",
    amount: 42.5,
    actions: (
      <Button size="sm" variant="flat">
        Send
      </Button>
    ),
  },
};
