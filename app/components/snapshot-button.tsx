"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";

interface SnapshotButtonProps {
  onComplete?: () => void;
}

export function SnapshotButton({ onComplete }: SnapshotButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function takeSnapshot() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/db/snapshot", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setMessage(`Recorded ${data.tablesRecorded} tables`);
        onComplete?.();
      } else {
        setMessage("Failed to take snapshot");
      }
    } catch {
      setMessage("Error taking snapshot");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={takeSnapshot}
        disabled={loading}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
        Take Snapshot
      </Button>
      {message && (
        <span className="text-xs text-muted-foreground animate-in fade-in">
          {message}
        </span>
      )}
    </div>
  );
}
