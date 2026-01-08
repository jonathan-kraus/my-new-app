import { ActivityItemData } from "@/types/activity";
import { formatDate } from "@/lib/astronomy_old/formatters";
import { GitCommit } from "lucide-react";

export default function PushEventCard({ item }: { item: ActivityItemData }) {
  return (
    <div className="rounded-lg border p-4 flex items-start gap-3">
      <GitCommit className="h-5 w-5 text-blue-500 mt-1" />

      <div className="flex-1">
        <div className="font-medium">
          Pushed to <span className="text-blue-600">{item.ref}</span>
        </div>

        {item.url && (
          <a
            href={item.url}
            target="_blank"
            className="text-sm text-muted-foreground hover:underline"
          >
            View commit
          </a>
        )}

        <div className="text-xs text-muted-foreground mt-1">
          {formatDate(item.created_at)}
        </div>
      </div>
    </div>
  );
}
