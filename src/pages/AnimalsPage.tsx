import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { api } from '../api/client';
import { PageHeader, StatusChip } from '../components/PageHeader';
import { useAuth } from '../auth/AuthContext';
import { useOffline } from '../offline/OfflineContext';

type Animal = {
  id: string;
  animal_code: string;
  name: string | null;
  breed: string;
  species: string;
  gender: string;
  status: string;
  rfid_tag: string | null;
  barn_name: string | null;
  stall_code: string | null;
  weight_kg: string | null;
  target_weight_kg: string | null;
  birth_date: string | null;
  age_years: number | null;
};

const empty = {
  animalCode: '',
  name: '',
  breed: 'Sahiwal',
  gender: 'female' as const,
  status: 'lactating' as const,
  rfidTag: '',
  weightKg: 400,
  targetWeightKg: 450,
};

export function AnimalsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { farm } = useAuth();
  const { queueCreate, status: syncStatus } = useOffline();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [rows, setRows] = useState<Animal[]>([]);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState(params.get('search') ?? '');
  const [statusFilter, setStatusFilter] = useState(params.get('status') ?? '');
  const [genderFilter, setGenderFilter] = useState('');
  const [lowWeight] = useState(params.get('filter') === 'low_weight');

  async function load() {
    const query: Record<string, string> = {};
    if (search) {
      query.search = search;
    }
    if (statusFilter) {
      query.status = statusFilter;
    }
    if (genderFilter) {
      query.gender = genderFilter;
    }
    if (lowWeight) {
      query.filter = 'low_weight';
    }
    const { data } = await api.get<{ items: Animal[]; total: number }>('/animals', { params: query });
    setRows(data.items);
    setTotal(data.total);
  }

  useEffect(() => {
    if (farm) {
      void load();
    }
  }, [farm?.id, search, statusFilter, genderFilter, lowWeight]);

  async function save() {
    if (!navigator.onLine || syncStatus === 'offline') {
      await queueCreate('animal', form);
      setOpen(false);
      setForm(empty);
      return;
    }
    await api.post('/animals', form);
    setOpen(false);
    setForm(empty);
    await load();
  }

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'animal_code', headerName: 'ID', width: 110 },
      { field: 'name', headerName: 'Name', width: 130 },
      { field: 'breed', headerName: 'Breed', width: 120 },
      { field: 'species', headerName: 'Species', width: 100 },
      {
        field: 'status',
        headerName: 'Status',
        width: 130,
        renderCell: (p) => <StatusChip value={String(p.value)} />,
      },
      { field: 'gender', headerName: 'Gender', width: 90 },
      { field: 'weight_kg', headerName: 'kg', width: 80 },
      { field: 'barn_name', headerName: 'Barn', width: 120 },
      {
        field: 'actions',
        headerName: '',
        width: 100,
        sortable: false,
        renderCell: (p) => (
          <Button size="small" onClick={() => navigate(`/animals/${p.row.id}`)}>
            View
          </Button>
        ),
      },
    ],
    [navigate],
  );

  return (
    <>
      <PageHeader
        title="Herd"
        subtitle={`${total} animals · search, filter, and open full profiles.`}
        actions={
          <Button variant="contained" onClick={() => setOpen(true)}>
            Add animal
          </Button>
        }
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 160 }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          {['lactating', 'dry', 'pregnant', 'sick', 'heifer', 'calf', 'bull'].map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Gender"
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="female">Female</MenuItem>
          <MenuItem value="male">Male</MenuItem>
        </TextField>
      </Stack>

      {isMobile ? (
        <Stack spacing={1.5}>
          {rows.map((a) => (
            <Card key={a.id} variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600}>
                  {a.animal_code}
                  {a.name ? ` · ${a.name}` : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {a.species} · {a.gender} · {a.weight_kg ? `${a.weight_kg} kg` : '—'}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <StatusChip value={a.status} />
                </Box>
                <Button size="small" sx={{ mt: 1.5 }} onClick={() => navigate(`/animals/${a.id}`)}>
                  View profile
                </Button>
              </CardContent>
            </Card>
          ))}
          {rows.length === 0 ? <Typography color="text.secondary">No animals match your filters.</Typography> : null}
        </Stack>
      ) : (
        <div style={{ height: 560, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          />
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" fullScreen={isMobile}>
        <DialogTitle>Add animal</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Animal ID" value={form.animalCode} onChange={(e) => setForm({ ...form, animalCode: e.target.value })} required />
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Breed" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
            <TextField label="RFID" value={form.rfidTag} onChange={(e) => setForm({ ...form, rfidTag: e.target.value })} />
            <TextField label="Weight (kg)" type="number" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })} />
            <TextField label="Target weight (kg)" type="number" value={form.targetWeightKg} onChange={(e) => setForm({ ...form, targetWeightKg: Number(e.target.value) })} />
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
    </>
  );
}
