import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../auth/AuthContext';

export function EmployeesPage() {
  const { farm } = useAuth();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employeeCode: '', fullName: '', roleTitle: 'Worker', salary: 25000 });

  async function load() {
    const { data } = await api.get('/employees');
    setItems(data.items);
  }
  useEffect(() => {
    if (farm) void load();
  }, [farm?.id]);

  return (
    <>
      <PageHeader
        title="People"
        subtitle="Employees, shifts, and payroll figures."
        actions={
          <Button variant="contained" onClick={() => setOpen(true)}>
            Add employee
          </Button>
        }
      />
      <div style={{ height: 480, width: '100%' }}>
        <DataGrid
          rows={items}
          columns={[
            { field: 'employee_code', headerName: 'Code', width: 100 },
            { field: 'full_name', headerName: 'Name', flex: 1 },
            { field: 'role_title', headerName: 'Title', width: 140 },
            { field: 'shift', headerName: 'Shift', width: 110 },
            { field: 'salary', headerName: 'Salary', width: 120 },
          ]}
          getRowId={(r) => String(r.id)}
        />
      </div>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Employee</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
            <TextField label="Code" value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} />
            <TextField label="Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <TextField label="Title" value={form.roleTitle} onChange={(e) => setForm({ ...form, roleTitle: e.target.value })} />
            <TextField type="number" label="Salary" value={form.salary} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              await api.post('/employees', form);
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
