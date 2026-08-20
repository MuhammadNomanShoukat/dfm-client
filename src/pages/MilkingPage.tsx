import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { StatusChip } from '../components/PageHeader';
import { useAuth } from '../auth/AuthContext';

type Row = {
  id: string;
  recorded_at: string;
  shift: string;
  quantity_liters: string;
  fat_pct: string | null;
  animal_code: string;
  animal_name: string | null;
};

export function MilkingPage() {
  const { farm } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [animals, setAnimals] = useState<{ id: string; animal_code: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ animalId: '', shift: 'morning', quantityLiters: 8, fatPct: 4.1 });

  async function load() {
    const [{ data: milk }, { data: herd }] = await Promise.all([
      api.get<{ items: Row[] }>('/milking'),
      api.get<{ items: { id: string; animal_code: string }[] }>('/animals?pageSize=100'),
    ]);
    setRows(milk.items);
    setAnimals(herd.items);
    if (herd.items[0] && !form.animalId) {
      setForm((f) => ({ ...f, animalId: herd.items[0].id }));
    }
  }

  useEffect(() => {
    if (farm) {
      void load();
    }
  }, [farm?.id]);

  const columns: GridColDef[] = [
    { field: 'animal_code', headerName: 'Animal', width: 110 },
    { field: 'animal_name', headerName: 'Name', width: 120 },
    {
      field: 'recorded_at',
      headerName: 'When',
      width: 180,
      valueFormatter: (v) => (v ? new Date(String(v)).toLocaleString() : ''),
    },
    {
      field: 'shift',
      headerName: 'Shift',
      width: 120,
      renderCell: (p) => <StatusChip value={String(p.value)} />,
    },
    { field: 'quantity_liters', headerName: 'Litres', width: 100 },
    { field: 'fat_pct', headerName: 'Fat %', width: 90 },
  ];

  return (
    <>
      <PageHeader
        title="Milking"
        subtitle="Morning, evening, and night yields with quality."
        actions={
          <Button variant="contained" onClick={() => setOpen(true)}>
            Record milking
          </Button>
        }
      />
      <div style={{ height: 560, width: '100%' }}>
        <DataGrid rows={rows} columns={columns} disableRowSelectionOnClick />
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Record milking</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Animal"
              value={form.animalId}
              onChange={(e) => setForm({ ...form, animalId: e.target.value })}
            >
              {animals.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.animal_code}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Shift"
              value={form.shift}
              onChange={(e) => setForm({ ...form, shift: e.target.value })}
            >
              <MenuItem value="morning">Morning</MenuItem>
              <MenuItem value="evening">Evening</MenuItem>
              <MenuItem value="night">Night</MenuItem>
            </TextField>
            <TextField
              type="number"
              label="Quantity (L)"
              value={form.quantityLiters}
              onChange={(e) => setForm({ ...form, quantityLiters: Number(e.target.value) })}
            />
            <TextField
              type="number"
              label="Fat %"
              value={form.fatPct}
              onChange={(e) => setForm({ ...form, fatPct: Number(e.target.value) })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              await api.post('/milking', form);
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
