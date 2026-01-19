import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { ActivityItemData } from "@/types/activity";
import { formatTime } from "@/lib/astronomy/formatTime";

export default function VercelDeploymentCard({
  item,
}: {
  item: ActivityItemData;
}) {
  const icon =
    item.state === "READY" ? (
      <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
    ) : item.state === "ERROR" ? (
      <XCircle className="h-5 w-5 text-red-500 mt-1" />
    ) : (
      <Loader2 className="h-5 w-5 text-yellow-500 mt-1 animate-spin" />
    );

  return (
    <div className="rounded-lg border p-4 flex items-start gap-3">
      {icon}

      <div className="flex-1">
        <div className="font-medium">{item.url}</div>

        <div className="text-xs text-muted-foreground mt-1">
          {formatTime(item.createdAt)}
        </div>
      </div>
    </div>
  );
}
