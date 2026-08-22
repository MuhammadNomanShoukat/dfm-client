import { Card, CardContent, Grid2 as Grid, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { KpiCard } from '../KpiCard';

type FinancialOverview = {
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

const money = (n: number) => `₨ ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const pctLabel = (pct: number | null): string => {
  if (pct === null) {
    return '';
  }
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct}% vs previous month`;
};

export function FinancialOverviewSection({ data }: { data: FinancialOverview }) {
  const months = data.revenueTrend.map((r) => r.month.slice(5));

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Financial overview
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard label="Total revenue" value={money(data.totalRevenue)} hint={`This month: ${money(data.monthRevenue)}`} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard
              label="This month revenue"
              value={money(data.monthRevenue)}
              hint={pctLabel(data.revenueChangePct)}
              tone={data.revenueChangePct !== null && data.revenueChangePct < 0 ? 'warning' : 'default'}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard
              label="Total expenses"
              value={money(data.totalExpenses)}
              hint={`This month: ${money(data.monthExpenses)}`}
              tone="warning"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard
              label="Net position"
              value={money(data.netPosition)}
              hint={`This month: ${money(data.monthNet)}`}
              tone={data.netPosition < 0 ? 'danger' : 'default'}
            />
          </Grid>
          {data.revenueTrend.length > 1 ? (
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Revenue trend
              </Typography>
              <LineChart
                height={200}
                xAxis={[{ scaleType: 'point', data: months }]}
                series={[{ data: data.revenueTrend.map((r) => r.amount), color: '#1F6B4A', label: 'Revenue' }]}
              />
            </Grid>
          ) : null}
          {data.expenseTrend.length > 1 ? (
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Expense trend
              </Typography>
              <LineChart
                height={200}
                xAxis={[{ scaleType: 'point', data: months }]}
                series={[{ data: data.expenseTrend.map((r) => r.amount), color: '#B54708', label: 'Expenses' }]}
              />
            </Grid>
          ) : null}
        </Grid>
      </CardContent>
    </Card>
  );
}
