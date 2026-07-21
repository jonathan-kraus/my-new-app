// app/logview/page.tsx
import LogViewer from "./LogViewer";
import { getLogs } from "./getLogs";

export const metadata = {
  title: "Log Viewer",
};

export default async function Page() {
  const initialData = await getLogs({
    page: 1,
    pageSize: 50,
  });

  return <LogViewer initialData={initialData} />;
}
