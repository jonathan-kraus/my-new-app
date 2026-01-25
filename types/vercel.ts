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
