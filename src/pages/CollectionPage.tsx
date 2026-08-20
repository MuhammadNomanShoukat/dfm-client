import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { DataGrid } from '@mui/x-data-grid';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { useAuth } from '../auth/AuthContext';

export function CollectionPage() {
  const { farm } = useAuth();
  const [payload, setPayload] = useState<{
    farmers: { id: string; full_name: string }[];
    collections: Record<string, unknown>[];
    paymentSheet: { farmer_name: string; liters: string; due: string }[];
  } | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ farmerId: '', quantityLiters: 20, fatPct: 4.0, snfPct: 8.5 });

  async function load() {
    const { data } = await api.get('/collection');
    setPayload(data);
    if (data.farmers[0]) setForm((f) => ({ ...f, farmerId: f.farmerId || data.farmers[0].id }));
  }
  useEffect(() => {
    if (farm) void load();
  }, [farm?.id]);

  const totalDue = payload?.paymentSheet.reduce((s, r) => s + Number(r.due), 0) ?? 0;

  return (
    <>
      <PageHeader
        title="Collection center"
        subtitle="Farmer intake, quality, and monthly payment sheet."
        actions={
          <Button variant="contained" onClick={() => setOpen(true)}>
            Record intake
          </Button>
        }
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <KpiCard label="Farmers this month due" value={totalDue.toLocaleString()} />
        </Grid>
      </Grid>
      <div style={{ height: 280, width: '100%', marginBottom: 16 }}>
        <DataGrid
          rows={payload?.collections ?? []}
          columns={[
            { field: 'farmer_name', headerName: 'Farmer', width: 160 },
            { field: 'quantity_liters', headerName: 'Litres', width: 100 },
            { field: 'fat_pct', headerName: 'Fat', width: 80 },
            { field: 'snf_pct', headerName: 'SNF', width: 80 },
            { field: 'water_pct', headerName: 'Water %', width: 100 },
            { field: 'amount_due', headerName: 'Due', width: 110 },
          ]}
          getRowId={(r) => String(r.id)}
        />
      </div>
      <div style={{ height: 240, width: '100%' }}>
        <DataGrid
          rows={(payload?.paymentSheet ?? []).map((r, i) => ({ id: i, ...r }))}
          columns={[
            { field: 'farmer_name', headerName: 'Farmer', flex: 1 },
            { field: 'liters', headerName: 'Litres', width: 120 },
            { field: 'due', headerName: 'Amount due', width: 140 },
          ]}
        />
      </div>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Milk intake</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
            <TextField select label="Farmer" value={form.farmerId} onChange={(e) => setForm({ ...form, farmerId: e.target.value })}>
              {payload?.farmers.map((f) => (
                <MenuItem key={f.id} value={f.id}>
                  {f.full_name}
                </MenuItem>
              ))}
            </TextField>
            <TextField type="number" label="Litres" value={form.quantityLiters} onChange={(e) => setForm({ ...form, quantityLiters: Number(e.target.value) })} />
            <TextField type="number" label="Fat %" value={form.fatPct} onChange={(e) => setForm({ ...form, fatPct: Number(e.target.value) })} />
            <TextField type="number" label="SNF %" value={form.snfPct} onChange={(e) => setForm({ ...form, snfPct: Number(e.target.value) })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              await api.post('/collection/intake', form);
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
