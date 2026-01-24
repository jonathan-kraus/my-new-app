export interface VercelUsage {
  bandwidth: number;
  serverlessExecutionCount: number;
  edgeExecutionCount: number;
  storage: number;
  builds: number;
  periodStart: string;
  periodEnd: string;
}

export interface VercelDeployment {
  uid: string;
  url: string;
  state: string;
  createdAt: number;
  meta: {
    githubCommitMessage?: string;
    githubCommitRef?: string;
    githubCommitSha?: string;
  };
}

export interface VercelProject {
  name: string;
  framework: string;
  environment: Array<{ key: string; value: string }>;
}

