import { useEffect, useState } from 'react';
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { StatusChip } from '../components/PageHeader';
import { useAuth } from '../auth/AuthContext';

export function TasksPage() {
  const { farm, user } = useAuth();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    taskKind: 'feeding',
    priority: 'normal',
    description: '',
  });

  async function load() {
    const mine = user?.globalRole === 'worker' ? '?mine=true' : '';
    const { data } = await api.get(`/tasks${mine}`);
    setRows(data.items);
  }
  useEffect(() => {
    if (farm) void load();
  }, [farm?.id, user?.globalRole]);

  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle="Feeding, cleaning, health, and maintenance work."
        actions={
          user?.globalRole !== 'worker' ? (
            <Button variant="contained" onClick={() => setOpen(true)}>
              Create task
            </Button>
          ) : undefined
        }
      />
      <div style={{ height: 520, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={[
            { field: 'title', headerName: 'Title', flex: 1 },
            { field: 'task_kind', headerName: 'Kind', width: 130 },
            {
              field: 'status',
              headerName: 'Status',
              width: 140,
              renderCell: (p) => <StatusChip value={String(p.value)} />,
            },
            { field: 'priority', headerName: 'Priority', width: 110, renderCell: (p) => <Chip size="small" label={String(p.value)} /> },
            { field: 'assignee_name', headerName: 'Assigned', width: 140 },
            {
              field: 'id',
              headerName: '',
              width: 140,
              renderCell: (p) => (
                <Button
                  size="small"
                  onClick={async () => {
                    await api.patch(`/tasks/${p.value}`, { status: 'done' });
                    await load();
                  }}
                >
                  Mark done
                </Button>
              ),
            },
          ]}
          getRowId={(r) => String(r.id)}
        />
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>New task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <TextField select label="Kind" value={form.taskKind} onChange={(e) => setForm({ ...form, taskKind: e.target.value })}>
              {['feeding', 'cleaning', 'health', 'maintenance', 'other'].map((k) => (
                <MenuItem key={k} value={k}>
                  {k}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {['low', 'normal', 'high', 'urgent'].map((k) => (
                <MenuItem key={k} value={k}>
                  {k}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              await api.post('/tasks', form);
              setOpen(false);
              await load();
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
