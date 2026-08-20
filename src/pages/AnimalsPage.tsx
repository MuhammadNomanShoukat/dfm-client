import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { StatusChip } from '../components/PageHeader';
import { useAuth } from '../auth/AuthContext';

type Animal = {
  id: string;
  animal_code: string;
  name: string | null;
  breed: string;
  gender: string;
  status: string;
  rfid_tag: string | null;
  barn_name: string | null;
  stall_code: string | null;
  weight_kg: string | null;
};

const empty = {
  animalCode: '',
  name: '',
  breed: 'Sahiwal',
  gender: 'female' as const,
  status: 'lactating' as const,
  rfidTag: '',
  weightKg: 400,
};

export function AnimalsPage() {
  const { farm } = useAuth();
  const [rows, setRows] = useState<Animal[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [timeline, setTimeline] = useState<{ id: string; title: string; event_at: string }[] | null>(null);

  async function load() {
    const { data } = await api.get<{ items: Animal[] }>('/animals');
    setRows(data.items);
  }

  useEffect(() => {
    if (farm) {
      void load();
    }
  }, [farm?.id]);

  async function save() {
    await api.post('/animals', form);
    setOpen(false);
    setForm(empty);
    await load();
  }

  async function openTimeline(id: string) {
    const { data } = await api.get(`/animals/${id}`);
    setTimeline(data.timeline);
  }

  const columns: GridColDef[] = [
    { field: 'animal_code', headerName: 'ID', width: 110 },
    { field: 'name', headerName: 'Name', width: 130 },
    { field: 'breed', headerName: 'Breed', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (p) => <StatusChip value={String(p.value)} />,
    },
    { field: 'rfid_tag', headerName: 'RFID', width: 140 },
    { field: 'barn_name', headerName: 'Barn', width: 120 },
    { field: 'stall_code', headerName: 'Stall', width: 90 },
    { field: 'weight_kg', headerName: 'kg', width: 80 },
    {
      field: 'actions',
      headerName: '',
      width: 120,
      sortable: false,
      renderCell: (p) => (
        <Button size="small" onClick={() => void openTimeline(p.row.id)}>
          Timeline
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Herd"
        subtitle="Complete animal profiles, RFID, and lifecycle status."
        actions={
          <Button variant="contained" onClick={() => setOpen(true)}>
            Add animal
          </Button>
        }
      />
      <div style={{ height: 560, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        />
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add animal</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Animal ID" value={form.animalCode} onChange={(e) => setForm({ ...form, animalCode: e.target.value })} />
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Breed" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
            <TextField label="RFID" value={form.rfidTag} onChange={(e) => setForm({ ...form, rfidTag: e.target.value })} />
            <TextField
              select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
            >
              {['lactating', 'dry', 'pregnant', 'sick', 'heifer', 'calf', 'bull'].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => void save()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={Boolean(timeline)} onClose={() => setTimeline(null)} fullWidth>
        <DialogTitle>Animal timeline</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {timeline?.map((ev) => (
              <Typography key={ev.id}>
                {new Date(ev.event_at).toLocaleString()} — {ev.title}
              </Typography>
            ))}
            {timeline && timeline.length === 0 ? <Typography>No events yet.</Typography> : null}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
