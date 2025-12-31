// app/(client)/logs/page.tsx
export default async function LogsPage() {
  const logs = await db.log.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Recent Logs</h1>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-2xl shadow-xl">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
              <th>Time</th><th>Level</th><th>Message</th><th>User</th><th>Page</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-t hover:bg-gray-50">
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td className={`font-bold ${log.level === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                  {log.level.toUpperCase()}
                </td>
                <td>{log.message}</td>
                <td>{log.userId}</td>
                <td>{log.page}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
