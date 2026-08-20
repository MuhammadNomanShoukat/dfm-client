import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import { api } from '../api/client';

const KINDS = [
  { id: 'animals', label: 'Animal report' },
  { id: 'milk', label: 'Milk report' },
  { id: 'finance', label: 'Financial report' },
  { id: 'health', label: 'Health report' },
  { id: 'inventory', label: 'Inventory report' },
  { id: 'employees', label: 'Employee report' },
];

export function ReportsPage() {
  async function download(kind: string, format: 'csv' | 'xlsx') {
    const res = await api.get(`/reports/export/${kind}`, { params: { format }, responseType: 'blob' });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${kind}.${format === 'xlsx' ? 'xlsx' : 'csv'}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader title="Reports" subtitle="Export CSV or Excel for animals, milk, finance, health, inventory, and people." />
      <Stack spacing={2}>
        {KINDS.map((k) => (
          <Card key={k.id}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h6">{k.label}</Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={() => void download(k.id, 'csv')}>
                  CSV
                </Button>
                <Button variant="contained" onClick={() => void download(k.id, 'xlsx')}>
                  Excel
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </>
  );
}
