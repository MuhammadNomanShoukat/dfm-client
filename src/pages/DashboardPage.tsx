import { useEffect, useState } from 'react';
import { Alert, Box, Card, CardContent, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { LineChart } from '@mui/x-charts/LineChart';
import PetsIcon from '@mui/icons-material/Pets';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import PaymentsIcon from '@mui/icons-material/Payments';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { api } from '../api/client';
import { KpiCard } from '../components/KpiCard';
import { PageHeader } from '../components/PageHeader';
import { ApiError } from '../components/Feedback';
import { useAuth } from '../auth/AuthContext';

type Dash = {
  kpis: {
    totalAnimals: number;
    lactating: number;
    dry: number;
    pregnant: number;
    sick: number;
    milkToday: number;
    milkWeek: number;
    milkMonth: number;
    revenue: number;
    expenses: number;
    profit: number;
    feedConsumption: number;
    upcomingVaccinations: { animal_code: string; vaccine_name: string; next_due_on: string }[];
    upcomingDeliveries: { animal_code: string; expected_calving_date: string }[];
  };
  milkTrend: { day: string; liters: string }[];
  alerts: { id: string; title: string; body: string; severity: string }[];
  widgets: string[];
  catalog: string[];
};

const LABELS: Record<string, string> = {
  totalAnimals: 'Total animals',
  lactating: 'Lactating',
  dry: 'Dry',
  pregnant: 'Pregnant',
  sick: 'Sick',
  milkToday: 'Daily milk (L)',
  milkWeek: 'Weekly milk (L)',
  milkMonth: 'Monthly milk (L)',
  revenue: 'Revenue (month)',
  expenses: 'Expenses (month)',
  profit: 'Profit (month)',
  feedConsumption: 'Feed used (kg)',
  upcomingVaccinations: 'Upcoming vaccinations',
  upcomingDeliveries: 'Upcoming deliveries',
  aiAlerts: 'AI alerts',
};

export function DashboardPage() {
  const { farm } = useAuth();
  const [data, setData] = useState<Dash | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const { data: payload } = await api.get<Dash>('/dashboard');
      setData(payload);
    } catch (err) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr.response?.data?.error?.message ?? 'Could not load dashboard.');
    }
  }

  useEffect(() => {
    if (farm) {
      void load();
    }
  }, [farm?.id]);

  async function toggleWidget(id: string, on: boolean) {
    if (!data) {
      return;
    }
    const widgets = on ? [...data.widgets, id] : data.widgets.filter((w) => w !== id);
    const { data: next } = await api.put('/dashboard/layout', { widgets });
    setData({ ...data, widgets: next.widgets });
  }

  if (error) {
    return <ApiError message={error} onRetry={() => void load()} />;
  }
  if (!data) {
    return <Typography>Loading pasture…</Typography>;
  }

  const k = data.kpis;
  const money = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <Box>
      <PageHeader title="Farm pulse" subtitle="Live herd, milk, money, and AI alerts for the selected farm." />
      <Grid container spacing={2}>
        {data.widgets.includes('totalAnimals') && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard label="Total animals" value={k.totalAnimals} icon={<PetsIcon />} />
          </Grid>
        )}
        {data.widgets.includes('lactating') && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard label="Lactating" value={k.lactating} />
          </Grid>
        )}
        {data.widgets.includes('dry') && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard label="Dry" value={k.dry} tone="warning" />
          </Grid>
        )}
        {data.widgets.includes('pregnant') && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard label="Pregnant" value={k.pregnant} />
          </Grid>
        )}
        {data.widgets.includes('sick') && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard label="Sick" value={k.sick} tone={k.sick ? 'danger' : 'default'} icon={<WarningAmberIcon />} />
          </Grid>
        )}
        {data.widgets.includes('milkToday') && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard label="Daily milk" value={`${k.milkToday.toFixed(1)} L`} icon={<WaterDropIcon />} />
          </Grid>
        )}
        {data.widgets.includes('milkWeek') && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard label="Weekly milk" value={`${k.milkWeek.toFixed(0)} L`} />
          </Grid>
        )}
        {data.widgets.includes('milkMonth') && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard label="Monthly milk" value={`${k.milkMonth.toFixed(0)} L`} />
          </Grid>
        )}
        {data.widgets.includes('revenue') && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard label="Revenue" value={money(k.revenue)} icon={<PaymentsIcon />} />
          </Grid>
        )}
        {data.widgets.includes('expenses') && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard label="Expenses" value={money(k.expenses)} tone="warning" />
          </Grid>
        )}
        {data.widgets.includes('profit') && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard label="Profit" value={money(k.profit)} tone={k.profit < 0 ? 'danger' : 'default'} />
          </Grid>
        )}
        {data.widgets.includes('feedConsumption') && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard label="Feed this month" value={`${k.feedConsumption} kg`} />
          </Grid>
        )}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                30-day yield
              </Typography>
              <LineChart
                height={280}
                xAxis={[{ scaleType: 'point', data: data.milkTrend.map((r) => r.day.slice(5)) }]}
                series={[{ data: data.milkTrend.map((r) => Number(r.liters)), label: 'Litres', color: '#1F6B4A' }]}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">Due soon</Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {k.upcomingVaccinations.map((v) => (
                  <Alert key={v.animal_code + v.vaccine_name} severity="info">
                    {v.animal_code}: {v.vaccine_name} · {String(v.next_due_on).slice(0, 10)}
                  </Alert>
                ))}
                {k.upcomingDeliveries.map((v) => (
                  <Alert key={v.animal_code} severity="warning">
                    Calving {v.animal_code} · {String(v.expected_calving_date).slice(0, 10)}
                  </Alert>
                ))}
                {k.upcomingVaccinations.length + k.upcomingDeliveries.length === 0 ? (
                  <Typography color="text.secondary">Nothing due in the next window.</Typography>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6">AI alerts</Typography>
              {data.alerts.map((a) => (
                <Alert key={a.id} severity={a.severity === 'warning' ? 'warning' : 'info'} sx={{ mt: 1 }}>
                  <strong>{a.title}</strong> — {a.body}
                </Alert>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Configure widgets</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {data.catalog.map((id) => (
                  <FormControlLabel
                    key={id}
                    control={
                      <Checkbox
                        checked={data.widgets.includes(id)}
                        onChange={(e) => void toggleWidget(id, e.target.checked)}
                      />
                    }
                    label={LABELS[id] ?? id}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
