import { ActivityItemData } from "@/types/activity";
import PushEventCard from "./PushEventCard";
import PullRequestEventCard from "./PullRequestEventCard";
import WorkflowRunCard from "./WorkflowRunCard";
import VercelDeploymentCard from "./VercelDeploymentCard";

export default function ActivityItem({ item }: { item: ActivityItemData }) {
  switch (item.type) {
    case "PushEvent":
      return <PushEventCard item={item} />;

    case "PullRequestEvent":
      return <PullRequestEventCard item={item} />;

    case "WorkflowRunEvent":
      return <WorkflowRunCard item={item} />;

    case "vercel":
      return <VercelDeploymentCard item={item} />;

    default:
      return (
        <div className="rounded-lg border p-4 text-sm text-muted-foreground">
          Unknown event type: {item.type}
        </div>
      );
  }
}
