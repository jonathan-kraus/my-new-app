/*
 * @FilePath: \my-new-app\hooks\useVersionSWR.ts
 * @LastEditTime: 2026-07-21 18:22:50
 */
'use client'
import useSWR from "swr";

export interface VersionInfo {
  name: string;
  version: string | null;
  buildTime: string | null;
  commit: string | null;
  package?: string;
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

export function useVersionSWR(pkg?: string) {
  const url = pkg
    ? `/api/version?pkg=${encodeURIComponent(pkg)}`
    : `/api/version`;

  const { data, error, isLoading } = useSWR<VersionInfo>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  return {
    data,
    error: error ? error.message : null,
    loading: isLoading,
  };
}
