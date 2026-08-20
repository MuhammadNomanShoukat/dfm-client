import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../auth/AuthContext';

export function BreedingPage() {
  const { farm } = useAuth();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [animals, setAnimals] = useState<{ id: string; animal_code: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    animalId: '',
    eventKind: 'heat',
    result: '',
    expectedCalvingDate: '',
    notes: '',
  });

  async function load() {
    const [{ data: b }, { data: a }] = await Promise.all([
      api.get('/breeding'),
      api.get('/animals?pageSize=100'),
    ]);
    setRows(b.items);
    setAnimals(a.items);
    if (a.items[0]) {
      setForm((f) => ({ ...f, animalId: f.animalId || a.items[0].id }));
    }
  }
  useEffect(() => {
    if (farm) void load();
  }, [farm?.id]);

  const columns: GridColDef[] = [
    { field: 'animal_code', headerName: 'Animal', width: 110 },
    { field: 'event_kind', headerName: 'Event', width: 180 },
    { field: 'result', headerName: 'Result', width: 120 },
    { field: 'expected_calving_date', headerName: 'EDC', width: 130 },
    { field: 'notes', headerName: 'Notes', flex: 1 },
  ];

  return (
    <>
      <PageHeader
        title="Breeding"
        subtitle="Heat, AI, pregnancy checks, calving, and abortion records."
        actions={
          <Button variant="contained" onClick={() => setOpen(true)}>
            Add event
          </Button>
        }
      />
      <div style={{ height: 520, width: '100%' }}>
        <DataGrid rows={rows} columns={columns} getRowId={(r) => String(r.id)} />
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Breeding event</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="Animal" value={form.animalId} onChange={(e) => setForm({ ...form, animalId: e.target.value })}>
              {animals.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.animal_code}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Kind" value={form.eventKind} onChange={(e) => setForm({ ...form, eventKind: e.target.value })}>
              {['heat', 'artificial_insemination', 'natural_breeding', 'pregnancy_check', 'calving', 'abortion'].map((k) => (
                <MenuItem key={k} value={k}>
                  {k.replaceAll('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Result" value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} />
            <TextField
              type="date"
              label="Expected calving"
              InputLabelProps={{ shrink: true }}
              value={form.expectedCalvingDate}
              onChange={(e) => setForm({ ...form, expectedCalvingDate: e.target.value })}
            />
            <TextField label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              await api.post('/breeding', {
                ...form,
                expectedCalvingDate: form.expectedCalvingDate || null,
                result: form.result || null,
              });
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
