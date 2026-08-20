import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../auth/AuthContext';

export function HealthPage() {
  const { farm } = useAuth();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [vaccines, setVaccines] = useState<Record<string, unknown>[]>([]);
  const [animals, setAnimals] = useState<{ id: string; animal_code: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    animalId: '',
    recordKind: 'disease',
    diagnosis: '',
    symptoms: '',
    treatment: '',
  });

  async function load() {
    const [{ data: h }, { data: a }] = await Promise.all([api.get('/health'), api.get('/animals?pageSize=100')]);
    setItems(h.items);
    setVaccines(h.vaccinations);
    setAnimals(a.items);
    if (a.items[0]) setForm((f) => ({ ...f, animalId: f.animalId || a.items[0].id }));
  }
  useEffect(() => {
    if (farm) void load();
  }, [farm?.id]);

  return (
    <>
      <PageHeader
        title="Health"
        subtitle="Disease, treatment, vaccination, and lab follow-up."
        actions={
          <Button variant="contained" onClick={() => setOpen(true)}>
            Add record
          </Button>
        }
      />
      <Typography variant="h6" sx={{ mb: 1 }}>
        Clinical records
      </Typography>
      <div style={{ height: 320, width: '100%', marginBottom: 24 }}>
        <DataGrid
          rows={items}
          columns={[
            { field: 'animal_code', headerName: 'Animal', width: 110 },
            { field: 'record_kind', headerName: 'Kind', width: 130 },
            { field: 'diagnosis', headerName: 'Diagnosis', flex: 1 },
            { field: 'treatment', headerName: 'Treatment', flex: 1 },
          ]}
          getRowId={(r) => String(r.id)}
        />
      </div>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Vaccinations
      </Typography>
      <div style={{ height: 280, width: '100%' }}>
        <DataGrid
          rows={vaccines}
          columns={[
            { field: 'animal_code', headerName: 'Animal', width: 110 },
            { field: 'vaccine_name', headerName: 'Vaccine', flex: 1 },
            { field: 'given_on', headerName: 'Given', width: 130 },
            { field: 'next_due_on', headerName: 'Next due', width: 130 },
          ]}
          getRowId={(r) => String(r.id)}
        />
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Health record</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="Animal" value={form.animalId} onChange={(e) => setForm({ ...form, animalId: e.target.value })}>
              {animals.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.animal_code}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Kind" value={form.recordKind} onChange={(e) => setForm({ ...form, recordKind: e.target.value })}>
              {['disease', 'treatment', 'vaccination', 'deworming', 'surgery', 'lab'].map((k) => (
                <MenuItem key={k} value={k}>
                  {k}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Diagnosis" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
            <TextField label="Symptoms" value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} />
            <TextField label="Treatment" value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              await api.post('/health', form);
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
