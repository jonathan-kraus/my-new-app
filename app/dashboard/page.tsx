// app/dashboard/page.tsx
import { headers } from 'next/headers';
import ClientComponent from '@/app/components/ClientComponent';
export default async function Dashboard() {
  const headersList = headers();  // ✅ Server OK
  const userAgent = headersList.get('user-agent');

  return <ClientComponent userAgent={userAgent} />;  // Pass down
}
