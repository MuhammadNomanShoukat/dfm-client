import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid2 as Grid,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../auth/AuthContext';

type Plan = {
  id: string;
  name: string;
  description: string | null;
  priceMonthly: number;
  limits: Record<string, number | boolean>;
  features: string[];
};

type Current = {
  planId: string;
  plan: Plan;
  usage: { animals: number; users: number; farms: number };
  status: string;
};

export function SubscriptionPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [current, setCurrent] = useState<Current | null>(null);

  async function load() {
    const [plansRes, currentRes] = await Promise.all([
      api.get<{ items: Plan[] }>('/subscription/plans'),
      api.get<Current>('/subscription/current'),
    ]);
    setPlans(plansRes.data.items);
    setCurrent(currentRes.data);
  }

  useEffect(() => {
    void load();
  }, []);

  async function selectPlan(planId: string) {
    await api.patch('/subscription/plan', { planId });
    await load();
  }

  if (!current) {
    return <Typography>Loading subscription…</Typography>;
  }

  const limits = current.plan.limits;

  return (
    <Box>
      <PageHeader title="Subscription" subtitle="Your plan limits and features — not hard-coded in the UI." />
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">
            Current plan: {current.plan.name}
          </Typography>
          <Chip label={current.status} size="small" sx={{ mt: 1 }} color="success" />
          <Stack spacing={1} sx={{ mt: 2 }}>
            <UsageBar label="Animals" used={current.usage.animals} max={Number(limits.maxAnimals ?? 0)} />
            <UsageBar label="Users" used={current.usage.users} max={Number(limits.maxUsers ?? 0)} />
            <UsageBar label="Farms" used={current.usage.farms} max={Number(limits.maxFarms ?? 0)} />
          </Stack>
        </CardContent>
      </Card>
      <Grid container spacing={2}>
        {plans.map((plan) => (
          <Grid key={plan.id} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: '100%', border: plan.id === current.planId ? 2 : 0, borderColor: 'primary.main' }}>
              <CardContent>
                <Typography variant="h6">{plan.name}</Typography>
                <Typography variant="h5" sx={{ my: 1 }}>
                  {plan.priceMonthly > 0 ? `₨ ${plan.priceMonthly.toLocaleString()}/mo` : 'Free'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {plan.description}
                </Typography>
                <Stack spacing={0.5} sx={{ mb: 2 }}>
                  {plan.features.map((f) => (
                    <Typography key={f} variant="caption">
                      · {f.replaceAll('_', ' ')}
                    </Typography>
                  ))}
                </Stack>
                {plan.id !== current.planId && (user?.globalRole === 'super_admin' || user?.globalRole === 'farm_owner') ? (
                  <Button fullWidth variant="outlined" onClick={() => void selectPlan(plan.id)}>
                    Select
                  </Button>
                ) : plan.id === current.planId ? (
                  <Chip label="Current" color="primary" size="small" />
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function UsageBar({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (used / max) * 100) : 0;
  return (
    <Box>
      <Typography variant="body2">
        {label}: {used} / {max}
      </Typography>
      <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 3 }} />
    </Box>
  );
}
