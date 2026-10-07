import { notFound } from "next/navigation";
import { MbtaExplorer } from "@/components/mbta/MbtaExplorer";
import { getMbtaCatalog } from "@/lib/mbta/catalog";

export const dynamic = "force-dynamic";

export default async function LinePage({
  params,
}: {
  params: Promise<{ lineId: string }>;
}) {
  const { lineId } = await params;
  const catalog = await getMbtaCatalog();
  const route = catalog.routes.find(
    (candidate) => candidate.id.toLowerCase() === lineId.toLowerCase(),
  );
  if (!route) notFound();
  return <MbtaExplorer initialRouteId={route.id} />;
}
