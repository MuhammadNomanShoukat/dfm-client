import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { DataGrid } from '@mui/x-data-grid';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { useAuth } from '../auth/AuthContext';

export function FinancePage() {
  const { farm } = useAuth();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [pnl, setPnl] = useState({ income: 0, expense: 0, profit: 0 });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    entryType: 'expense',
    category: 'maintenance',
    amount: 0,
    entryDate: new Date().toISOString().slice(0, 10),
    description: '',
  });

  async function load() {
    const { data } = await api.get('/finance');
    setItems(data.items);
    setPnl(data.pnl);
  }
  useEffect(() => {
    if (farm) void load();
  }, [farm?.id]);

  return (
    <>
      <PageHeader
        title="Finance"
        subtitle="Income, expenses, and this month’s P&L."
        actions={
          <Button variant="contained" onClick={() => setOpen(true)}>
            Add entry
          </Button>
        }
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <KpiCard label="Income" value={pnl.income.toLocaleString()} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <KpiCard label="Expenses" value={pnl.expense.toLocaleString()} tone="warning" />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <KpiCard label="Profit" value={pnl.profit.toLocaleString()} tone={pnl.profit < 0 ? 'danger' : 'default'} />
        </Grid>
      </Grid>
      <div style={{ height: 480, width: '100%' }}>
        <DataGrid
          rows={items}
          columns={[
            { field: 'entry_date', headerName: 'Date', width: 120 },
            { field: 'entry_type', headerName: 'Type', width: 110 },
            { field: 'category', headerName: 'Category', width: 140 },
            { field: 'amount', headerName: 'Amount', width: 120 },
            { field: 'description', headerName: 'Description', flex: 1 },
          ]}
          getRowId={(r) => String(r.id)}
        />
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Finance entry</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="Type" value={form.entryType} onChange={(e) => setForm({ ...form, entryType: e.target.value })}>
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </TextField>
            <TextField label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <TextField type="number" label="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
            <TextField type="date" label="Date" InputLabelProps={{ shrink: true }} value={form.entryDate} onChange={(e) => setForm({ ...form, entryDate: e.target.value })} />
            <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              await api.post('/finance', form);
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
