import { requireRuntimeAdmin, RuntimeAccessError } from "@/lib/runtime/admin";
import { MbtaRefresh } from "@/components/mbta/MbtaRefresh";

export const dynamic = "force-dynamic";

export default async function MbtaAdminPage() {
  try {
    await requireRuntimeAdmin();
  } catch (error) {
    if (error instanceof RuntimeAccessError)
      return (
        <p role="alert" className="p-6">
          {error.message}
        </p>
      );
    throw error;
  }
  return <MbtaRefresh />;
}
