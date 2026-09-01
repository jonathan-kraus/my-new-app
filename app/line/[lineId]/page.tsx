import Link from "next/link";
import { notFound } from "next/navigation";
import { LineArrivals } from "@/app/components/LineArrivals";
import { stopsByLine, type MBTALineId } from "@/lib/mbta/stops";

const lineIds = Object.keys(stopsByLine) as MBTALineId[];

function resolveLineId(param: string): MBTALineId | null {
  const decoded = decodeURIComponent(param).toLowerCase();
  return lineIds.find((id) => id.toLowerCase() === decoded) ?? null;
}

export function generateStaticParams() {
  return lineIds.map((lineId) => ({ lineId }));
}

export default async function LinePage({
  params,
}: {
  params: Promise<{ lineId: string }>;
}) {
  const { lineId } = await params;
  const line = resolveLineId(lineId);

  if (!line) notFound();

  return (
    <div>
      <div className="max-w-xl mx-auto px-6 pt-6">
        <Link href="/line" className="text-sm text-blue-400 hover:underline">
          ← All lines
        </Link>
      </div>
      <LineArrivals
        lineId={line}
        defaultStopId={line === "Green-C" ? "place-denrd" : undefined}
      />
    </div>
  );
}
