import { useEffect, useState } from 'react';
import { Alert, Box, Card, CardContent, Skeleton, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { LineChart } from '@mui/x-charts/LineChart';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { ApiError } from '../components/Feedback';
import { useAuth } from '../auth/AuthContext';
import {
  ActionCard,
  AttentionRow,
  CalvingRow,
  FeedEstimateCard,
  VaccinationRow,
  WeightRow,
} from '../components/dashboard/ActionCards';
import { FinancialOverviewSection } from '../components/dashboard/FinancialOverview';
import { TodaysWorkflow, toggleWorkflow, type WorkflowItem } from '../components/dashboard/TodaysWorkflow';

type DashData = {
  todaysWorkflow: WorkflowItem[];
  attentionAnimals: {
    id: string;
    animalCode: string;
    name: string | null;
    reason: string;
    severity: string;
  }[];
  vaccinationsDue: {
    id: string;
    animalId: string;
    animalCode: string;
    vaccine: string;
    dueDate: string;
    status: string;
  }[];
  expectedCalvings: {
    id: string;
    animalId: string;
    animalCode: string;
    daysRemaining: number;
    expectedDate: string;
  }[];
  belowTargetWeight: {
    id: string;
    animalCode: string;
    currentWeight: number;
    targetWeight: number;
    difference: number;
    trend: string;
  }[];
  feedPurchaseEstimate: {
    feedType: string;
    currentStock: number;
    unit: string;
    averageDailyConsumption: number;
    estimatedQuantity: number;
    estimatedCost: number;
    estimatedPurchaseDate: string;
  } | null;
  financialOverview: {
    totalRevenue: number;
    totalExpenses: number;
    monthRevenue: number;
    monthExpenses: number;
    revenueChangePct: number | null;
    expenseChangePct: number | null;
    netPosition: number;
    monthNet: number;
    revenueTrend: { month: string; amount: number }[];
    expenseTrend: { month: string; amount: number }[];
  };
  milkTrend: { day: string; liters: string }[];
  alerts: { id: string; title: string; body: string; severity: string }[];
};

export function DashboardPage() {
  const { farm } = useAuth();
  const [data, setData] = useState<DashData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const { data: payload } = await api.get<DashData>('/dashboard');
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

  async function handleWorkflowToggle(key: string, completed: boolean) {
    if (!data) {
      return;
    }
    setData({
      ...data,
      todaysWorkflow: data.todaysWorkflow.map((w) => (w.key === key ? { ...w, completed } : w)),
    });
    try {
      await toggleWorkflow(key, completed);
    } catch {
      void load();
    }
  }

  if (error) {
    return <ApiError message={error} onRetry={() => void load()} />;
  }
  if (!data) {
    return (
      <Box>
        <Skeleton variant="rounded" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={120} />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="What needs attention today?"
        subtitle={`Action-oriented view for ${farm?.name ?? 'your farm'} operations`}
      />

      <TodaysWorkflow items={data.todaysWorkflow} onToggle={(k, c) => void handleWorkflowToggle(k, c)} />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ActionCard
            title="Animals need attention"
            count={data.attentionAnimals.length}
            actionLabel="View all animals"
            actionRoute="/animals?status=sick"
          >
            {data.attentionAnimals.length === 0 ? (
              <Typography color="text.secondary">No animals need attention right now.</Typography>
            ) : (
              data.attentionAnimals.map((a) => (
                <AttentionRow
                  key={a.id}
                  animalId={a.id}
                  animalCode={a.animalCode}
                  name={a.name}
                  reason={a.reason}
                  severity={a.severity}
                />
              ))
            )}
          </ActionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ActionCard title="Vaccinations due" count={data.vaccinationsDue.length} actionRoute="/health" actionLabel="Open health">
            {data.vaccinationsDue.length === 0 ? (
              <Typography color="text.secondary">No vaccinations due in the next 30 days.</Typography>
            ) : (
              data.vaccinationsDue.slice(0, 5).map((v) => (
                <VaccinationRow
                  key={v.id}
                  animalId={v.animalId}
                  animalCode={v.animalCode}
                  vaccine={v.vaccine}
                  dueDate={v.dueDate}
                  status={v.status}
                />
              ))
            )}
          </ActionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <ActionCard title="Expected calvings" count={data.expectedCalvings.length} actionRoute="/breeding" actionLabel="Open breeding">
            {data.expectedCalvings.length === 0 ? (
              <Typography color="text.secondary">No calvings expected soon.</Typography>
            ) : (
              data.expectedCalvings.slice(0, 4).map((c) => (
                <CalvingRow
                  key={c.id}
                  animalId={c.animalId}
                  animalCode={c.animalCode}
                  daysRemaining={c.daysRemaining}
                  expectedDate={c.expectedDate}
                />
              ))
            )}
          </ActionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <ActionCard title="Below target weight" count={data.belowTargetWeight.length} actionRoute="/animals?filter=low_weight" actionLabel="View animals">
            {data.belowTargetWeight.length === 0 ? (
              <Typography color="text.secondary">All animals meet target weight.</Typography>
            ) : (
              data.belowTargetWeight.slice(0, 4).map((w) => (
                <WeightRow
                  key={w.id}
                  animalId={w.id}
                  animalCode={w.animalCode}
                  currentWeight={w.currentWeight}
                  targetWeight={w.targetWeight}
                  difference={w.difference}
                  trend={w.trend}
                />
              ))
            )}
          </ActionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <FeedEstimateCard estimate={data.feedPurchaseEstimate} />
        </Grid>
      </Grid>

      <FinancialOverviewSection data={data.financialOverview} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                30-day milk yield
              </Typography>
              {data.milkTrend.length > 0 ? (
                <LineChart
                  height={260}
                  xAxis={[{ scaleType: 'point', data: data.milkTrend.map((r) => r.day.slice(5)) }]}
                  series={[{ data: data.milkTrend.map((r) => Number(r.liters)), label: 'Litres', color: '#1F6B4A' }]}
                />
              ) : (
                <Typography color="text.secondary">No milk records in the last 30 days.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Alerts</Typography>
              {data.alerts.length === 0 ? (
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  No open alerts.
                </Typography>
              ) : (
                data.alerts.map((a) => (
                  <Alert key={a.id} severity={a.severity === 'warning' ? 'warning' : 'info'} sx={{ mt: 1 }}>
                    <strong>{a.title}</strong> — {a.body}
                  </Alert>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
