import {
  CatalogSyncBusyError,
  publishMbtaCatalog,
  recordMbtaSyncFailure,
} from "./catalog";
import { fetchMbtaCatalog } from "./catalog-source";

export async function syncMbtaCatalog() {
  const startedAt = new Date().toISOString();
  try {
    const catalog = await fetchMbtaCatalog();
    return await publishMbtaCatalog(catalog, startedAt);
  } catch (error) {
    if (!(error instanceof CatalogSyncBusyError)) {
      await recordMbtaSyncFailure(startedAt).catch(() => undefined);
    }
    throw error;
  }
}
