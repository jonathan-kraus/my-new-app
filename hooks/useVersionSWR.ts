/*
 * @FilePath: \my-new-app\hooks\useVersionSWR.ts
 * @LastEditTime: 2026-07-29 19:06:28
 */
"use client";
import useSWR from "swr";

export interface VersionInfo {
  name: string;
  version: string | null;
  buildTime: string | null;
  commit: string | null;
  package?: string;
}

export interface VersionAllResponse {
  name: string;
  version: string;
  buildTime: string | null;
  commit: string | null;

  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  overrides: Record<string, string> | null;

  workspacePackages: Record<string, string>;
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

export function useVersionSWR(pkg: string = "all") {
  const url = `/api/version?pkg=${encodeURIComponent(pkg)}`;

  const { data, error, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  return {
    data,
    error: error ? error.message : null,
    loading: isLoading,
  };
}
