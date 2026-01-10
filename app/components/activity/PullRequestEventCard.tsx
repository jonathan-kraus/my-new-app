import { GitPullRequest } from "lucide-react";
import { ActivityItemData } from "@/types/activity";
import { formatDate } from "@/lib/astronomy_old/formatters";
export default function PullRequestEventCard({
  item,
}: {
  item: ActivityItemData;
}) {
  return (
    <div className="rounded-lg border p-4 flex items-start gap-3">
      <GitPullRequest className="h-5 w-5 text-purple-500 mt-1" />

      <div className="flex-1">
        <div className="font-medium">{item.ref}</div>

        {item.url && (
          <a
            href={item.url}
            target="_blank"
            className="text-sm text-muted-foreground hover:underline"
          >
            View pull request
          </a>
        )}

        <div className="text-xs text-muted-foreground mt-1">
          {formatDate(item.createdAt)}
        </div>
      </div>
    </div>
  );
}
