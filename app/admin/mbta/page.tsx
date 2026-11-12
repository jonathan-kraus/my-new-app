import { MbtaRefresh } from "@/components/mbta/MbtaRefresh";
import { RuntimeAccessError, requireRuntimeAdmin } from "@/lib/runtime/admin";

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
