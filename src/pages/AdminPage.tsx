import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';

export function AdminPage() {
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [audit, setAudit] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    void (async () => {
      const [u, a] = await Promise.all([api.get('/admin/users'), api.get('/admin/audit')]);
      setUsers(u.data.items);
      setAudit(a.data.items);
    })();
  }, []);

  return (
    <>
      <PageHeader title="Platform" subtitle="Users, subscriptions (free plan), and audit log." />
      <div style={{ height: 280, width: '100%', marginBottom: 24 }}>
        <DataGrid
          rows={users}
          columns={[
            { field: 'email', headerName: 'Email', flex: 1 },
            { field: 'full_name', headerName: 'Name', width: 160 },
            { field: 'global_role', headerName: 'Role', width: 150 },
            { field: 'mfa_enabled', headerName: 'MFA', width: 90 },
            { field: 'is_active', headerName: 'Active', width: 90 },
          ]}
          getRowId={(r) => String(r.id)}
        />
      </div>
      <div style={{ height: 360, width: '100%' }}>
        <DataGrid
          rows={audit}
          columns={[
            { field: 'created_at', headerName: 'When', width: 180 },
            { field: 'actor_email', headerName: 'Actor', width: 200 },
            { field: 'action', headerName: 'Action', width: 160 },
            { field: 'summary', headerName: 'Summary', flex: 1 },
          ]}
          getRowId={(r) => String(r.id)}
        />
      </div>
    </>
  );
}
