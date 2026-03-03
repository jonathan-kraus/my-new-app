// app/database-explorer/page.tsx
import { neon } from '@neondatabase/serverless';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

const sql = neon(process.env.DATABASE_URL!);

async function getTableStats() {
  const tables = await sql`
    SELECT
      t.table_name,
      t.table_schema,
      (
        SELECT COUNT(*)
        FROM information_schema.columns c
        WHERE c.table_name = t.table_name
          AND c.table_schema = t.table_schema
      ) AS column_count,
      (
        SELECT n_live_tup
        FROM pg_stat_user_tables s
        WHERE s.relname = t.table_name
          AND s.schemaname = t.table_schema
      ) AS estimated_rows,
      pg_size_pretty(
        pg_total_relation_size(
          quote_ident(t.table_schema) || '.' || quote_ident(t.table_name)
        )
      ) AS total_size,
      pg_total_relation_size(
        quote_ident(t.table_schema) || '.' || quote_ident(t.table_name)
      ) AS total_size_bytes
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
    ORDER BY total_size_bytes DESC;
  `;

  const columns = await sql`
    SELECT
      table_name,
      column_name,
      data_type,
      is_nullable,
      column_default,
      ordinal_position
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
  `;

  return { tables, columns };
}

export default async function DatabaseExplorerPage() {
  const session = await auth();
  if (!session) redirect('/api/auth/signin');

  const { tables, columns } = await getTableStats();

  const columnsByTable: Record<string, typeof columns> = {};
  for (const col of columns) {
    if (!columnsByTable[col.table_name]) columnsByTable[col.table_name] = [];
    columnsByTable[col.table_name].push(col);
  }

  const totalSize = tables.reduce((sum: number, t: any) => sum + Number(t.total_size_bytes), 0);
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", minHeight: '100vh', background: '#0a0a0f', color: '#e2e8f0', padding: '0' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .header {
          border-bottom: 1px solid #1e293b;
          padding: 32px 48px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          background: linear-gradient(180deg, #0d0d1a 0%, #0a0a0f 100%);
        }

        .header-title {
          font-family: 'Syne', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #f8fafc;
        }

        .header-title span {
          color: #22d3ee;
        }

        .header-sub {
          font-size: 0.7rem;
          color: #475569;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-top: 4px;
        }

        .stats-bar {
          display: flex;
          gap: 32px;
          padding: 20px 48px;
          border-bottom: 1px solid #1e293b;
          background: #0d0d1a;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-value {
          font-size: 1.4rem;
          font-weight: 600;
          color: #22d3ee;
          font-family: 'Syne', sans-serif;
        }

        .stat-label {
          font-size: 0.65rem;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .content {
          padding: 40px 48px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .table-card {
          border: 1px solid #1e293b;
          border-radius: 8px;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .table-card:hover {
          border-color: #334155;
        }

        .table-header {
          display: grid;
          grid-template-columns: 1fr auto auto auto;
          gap: 24px;
          align-items: center;
          padding: 20px 24px;
          background: #0d1117;
          cursor: pointer;
          user-select: none;
        }

        .table-header:hover {
          background: #111827;
        }

        .table-name {
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: #f1f5f9;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .table-name::before {
          content: '▸';
          color: #22d3ee;
          font-size: 0.7rem;
          transition: transform 0.2s;
        }

        .table-card.open .table-name::before {
          transform: rotate(90deg);
        }

        .badge {
          font-size: 0.65rem;
          padding: 3px 8px;
          border-radius: 4px;
          background: #1e293b;
          color: #64748b;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .badge.cyan {
          background: #083344;
          color: #22d3ee;
        }

        .badge.green {
          background: #052e16;
          color: #4ade80;
        }

        .columns-section {
          display: none;
          border-top: 1px solid #1e293b;
        }

        .table-card.open .columns-section {
          display: block;
        }

        .columns-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.75rem;
        }

        .columns-table th {
          text-align: left;
          padding: 10px 24px;
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #475569;
          background: #080c12;
          border-bottom: 1px solid #1e293b;
          font-weight: 500;
        }

        .columns-table td {
          padding: 10px 24px;
          border-bottom: 1px solid #0f172a;
          color: #94a3b8;
          font-family: 'IBM Plex Mono', monospace;
        }

        .columns-table tr:last-child td {
          border-bottom: none;
        }

        .columns-table tr:hover td {
          background: #0d1117;
          color: #cbd5e1;
        }

        .col-name {
          color: #e2e8f0 !important;
          font-weight: 500;
        }

        .col-type {
          color: #818cf8 !important;
        }

        .nullable-yes { color: #64748b !important; }
        .nullable-no { color: #f97316 !important; }

        .empty-state {
          text-align: center;
          padding: 80px 48px;
          color: #334155;
          font-size: 0.85rem;
        }

        .refresh-note {
          padding: 12px 48px;
          font-size: 0.65rem;
          color: #334155;
          letter-spacing: 0.08em;
          border-top: 1px solid #0f172a;
          margin-top: auto;
        }
      `}</style>

      <div className="header">
        <div>
          <div className="header-title">DB <span>Explorer</span></div>
          <div className="header-sub">Live schema · public schema · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        </div>
      </div>

      <div className="stats-bar">
        <div className="stat">
          <div className="stat-value">{tables.length}</div>
          <div className="stat-label">Tables</div>
        </div>
        <div className="stat">
          <div className="stat-value">{columns.length}</div>
          <div className="stat-label">Total Columns</div>
        </div>
        <div className="stat">
          <div className="stat-value">{formatBytes(totalSize)}</div>
          <div className="stat-label">Total Size</div>
        </div>
      </div>

      <div className="content">
        {tables.length === 0 ? (
          <div className="empty-state">No tables found in public schema.</div>
        ) : (
          tables.map((table: any) => {
            const cols = columnsByTable[table.table_name] || [];
            return (
              <details key={table.table_name} className="table-card">
                <summary className="table-header" style={{ listStyle: 'none' }}>
                  <div className="table-name">{table.table_name}</div>
                  <span className="badge cyan">{table.column_count} cols</span>
                  <span className="badge green">~{Number(table.estimated_rows).toLocaleString()} rows</span>
                  <span className="badge">{table.total_size}</span>
                </summary>
                <div className="columns-section">
                  <table className="columns-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Column</th>
                        <th>Type</th>
                        <th>Nullable</th>
                        <th>Default</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cols.map((col: any) => (
                        <tr key={col.column_name}>
                          <td style={{ color: '#334155' }}>{col.ordinal_position}</td>
                          <td className="col-name">{col.column_name}</td>
                          <td className="col-type">{col.data_type}</td>
                          <td className={col.is_nullable === 'YES' ? 'nullable-yes' : 'nullable-no'}>
                            {col.is_nullable === 'YES' ? 'yes' : 'no'}
                          </td>
                          <td style={{ color: '#475569' }}>{col.column_default ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            );
          })
        )}
      </div>

      <div className="refresh-note">
        ⟳ This page queries live schema on every load — new tables appear automatically.
      </div>
    </div>
  );
}
