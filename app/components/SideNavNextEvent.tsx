'use client';

import { useState, useEffect } from 'react';
import { getAstronomySnapshot } from '@/lib/astronomy/getAstronomySnapshot';

export default function AstronomySnapshotLoader({ locationId }: { locationId: string }) {
  const [snapshot, setSnapshot] = useState<{ today: any; tomorrow: any } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [shouldRun, setShouldRun] = useState(false);

  // This runs the process only when shouldRun becomes true
  useEffect(() => {
    if (!shouldRun) return;

    const runSnapshot = async () => {
      setIsRunning(true);
      try {
        const data = await getAstronomySnapshot(locationId, new Date(), { force: true });
        setSnapshot(data);
      } catch (error) {
        console.error("Failed to load astronomy snapshot:", error);
      } finally {
        setIsRunning(false);
        // Optional: reset so it can be triggered again
        // setShouldRun(false);
      }
    };

    runSnapshot();
  }, [shouldRun, locationId]);

  const handleRun = () => {
    setShouldRun(true);
  };

  return (
    <div>
      <button onClick={handleRun} disabled={isRunning}>
        {isRunning ? "Loading Astronomy Data..." : "Load Astronomy Snapshot"}
      </button>

      {snapshot && (
        <pre style={{ marginTop: '1rem' }}>
          {JSON.stringify(snapshot, null, 2)}
        </pre>
      )}
    </div>
  );
}