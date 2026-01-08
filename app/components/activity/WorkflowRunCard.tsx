import { Workflow, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { ActivityItemData } from "@/types/activity";
import { formatDate } from "@/lib/astronomy_old/formatters";
export default function WorkflowRunCard({ item }: { item: ActivityItemData }) {
  const icon =
    item.state === "success" ? (
      <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
    ) : item.state === "failure" ? (
      <XCircle className="h-5 w-5 text-red-500 mt-1" />
    ) : (
      <Loader2 className="h-5 w-5 text-yellow-500 mt-1 animate-spin" />
    );

  return (
    <div className="rounded-lg border p-4 flex items-start gap-3">
      {icon}

      <div className="flex-1">
        <div className="font-medium">{item.ref}</div>

        {item.url && (
          <a
            href={item.url}
            target="_blank"
            className="text-sm text-muted-foreground hover:underline"
          >
            View workflow run
          </a>
        )}

        <div className="text-xs text-muted-foreground mt-1">
          {formatDate(item.created_at)}
        </div>
      </div>
    </div>
  );
}
