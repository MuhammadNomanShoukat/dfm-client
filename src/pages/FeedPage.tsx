import { useEffect, useState } from 'react';
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { DataGrid } from '@mui/x-data-grid';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../auth/AuthContext';

export function FeedPage() {
  const { farm } = useAuth();
  const [data, setData] = useState<{ types: Record<string, unknown>[]; consumption: Record<string, unknown>[] } | null>(null);
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(20);
  const [typeId, setTypeId] = useState('');

  async function load() {
    const { data: payload } = await api.get('/feed');
    setData(payload);
    if (payload.types[0]) setTypeId(String(payload.types[0].id));
  }
  useEffect(() => {
    if (farm) void load();
  }, [farm?.id]);

  return (
    <>
      <PageHeader
        title="Feed"
        subtitle="Inventory, consumption, and reorder levels."
        actions={
          <Button variant="contained" onClick={() => setOpen(true)}>
            Record consumption
          </Button>
        }
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {data?.types.map((t) => (
          <Grid key={String(t.id)} size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">{String(t.name)}</Typography>
                <Typography>
                  {String(t.quantity)} {String(t.unit)} in stock
                </Typography>
                <Typography color="text.secondary">Reorder at {String(t.reorder_level)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <div style={{ height: 360, width: '100%' }}>
        <DataGrid
          rows={data?.consumption ?? []}
          columns={[
            { field: 'feed_name', headerName: 'Feed', width: 160 },
            { field: 'consumed_at', headerName: 'Date', width: 130 },
            { field: 'quantity', headerName: 'Qty', width: 90 },
            { field: 'animal_code', headerName: 'Animal', width: 120 },
          ]}
          getRowId={(r) => String(r.id)}
        />
      </div>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Consume feed</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 280 }}>
            <TextField select label="Type" value={typeId} onChange={(e) => setTypeId(e.target.value)}>
              {data?.types.map((t) => (
                <MenuItem key={String(t.id)} value={String(t.id)}>
                  {String(t.name)}
                </MenuItem>
              ))}
            </TextField>
            <TextField type="number" label="Quantity" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              await api.post('/feed/consumption', {
                feedTypeId: typeId,
                consumedAt: new Date().toISOString().slice(0, 10),
                quantity: qty,
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
