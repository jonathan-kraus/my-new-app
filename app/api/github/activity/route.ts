// app/api/github/activity/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getRepositoryActivity,
  getRecentActivity,
  getRecentWorkflowRuns,
} from "@/lib/github";

// Configure your repositories here or get from environment
const DEFAULT_REPOSITORIES = [
  { owner: "jonathan-kraus", repo: "my-new-app" }, // Replace with your actual repos
  // Add more repositories as needed
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "repositories";
    const limit = parseInt(searchParams.get("limit") || "10");
    const username = searchParams.get("username");

    let data;

    switch (type) {
      case "user":
        if (!username) {
          return NextResponse.json(
            { error: "Username is required for user activity" },
            { status: 400 },
          );
        }
        data = await getRecentActivity(username, limit);
        break;

      case "repositories":
        // Get repositories from query params or use defaults
        const reposParam = searchParams.get("repos");
        let repositories = DEFAULT_REPOSITORIES;

        if (reposParam) {
          repositories = reposParam.split(",").map((repoStr) => {
            const [owner, repoName] = repoStr.trim().split("/");
            return { owner, repo: repoName };
          });
        }

        data = await getRepositoryActivity(repositories, limit);
        break;

      case "workflows":
        const workflowOwner = searchParams.get("owner");
        const workflowRepoName = searchParams.get("repo");

        if (!workflowOwner || !workflowRepoName) {
          return NextResponse.json(
            { error: "Owner and repo are required for workflow activity" },
            { status: 400 },
          );
        }

        data = await getRecentWorkflowRuns(
          workflowOwner,
          workflowRepoName,
          limit,
        );
        break;

      default:
        return NextResponse.json(
          { error: "Invalid type. Use 'user', 'repositories', or 'workflows'" },
          { status: 400 },
        );
    }

    return NextResponse.json({
      data,
      type,
      count: Array.isArray(data) ? data.length : 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("GitHub activity API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch GitHub activity",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
