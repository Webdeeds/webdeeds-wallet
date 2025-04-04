import { Button, Card, Chip, Skeleton, Tooltip } from "@heroui/react";
import { Copy } from "lucide-react";
import { useState } from "react";

interface ListItemProps {
  imageUrl?: string;
  title?: string;
  description?: string;
  id: string;
  amount: number;
  actions?: React.ReactNode;
  isLoading?: boolean;
}

const DiamondIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-current"
  >
    <path
      d="M8 2L14 8L8 14L2 8L8 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function ListItem({
  imageUrl,
  title,
  description,
  id,
  amount,
  actions,
  isLoading = false,
}: ListItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="relative">
      <div className="flex items-stretch gap-4 p-4">
        <div className="h-24 w-24 rounded-lg overflow-hidden">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <img
              src={imageUrl || "/placeholder.png"}
              alt={title || "Placeholder"}
              className="object-cover"
            />
          )}
        </div>
        <div className="flex-1 flex flex-col justify-evenly min-w-0">
          <div className="flex flex-1 items-start justify-between">
            <div className="min-w-0">
              {isLoading ? (
                <>
                  <Skeleton className="h-6 w-32 rounded-lg" />
                  <Skeleton className="h-4 w-48 rounded-lg mt-1" />
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold truncate">
                    {title || "Untitled"}
                  </h3>
                  <p className="text-gray-600 mt-1 truncate">
                    {description || "No description available"}
                  </p>
                </>
              )}
            </div>
            {actions && <div className="ml-4 flex-shrink-0">{actions}</div>}
          </div>
          <div className="flex items-center justify-between gap-2 mt-2">
            <Chip
              color="primary"
              variant="flat"
              startContent={<DiamondIcon />}
              className="rounded-md"
              size="sm"
            >
              {amount}
            </Chip>
            <Tooltip content={id} placement="top">
              <Button
                size="sm"
                variant="flat"
                className="text-gray-500"
                onPress={handleCopyId}
                endContent={
                  <Copy className="h-4 w-4 select-none pointer-events-none" />
                }
              >
                <span className="truncate">{copied ? "Copied!" : id}</span>
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </Card>
  );
}
