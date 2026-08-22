import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { StatusChip } from '../PageHeader';

export function ActionCard({
  title,
  count,
  children,
  actionLabel,
  actionRoute,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  actionLabel?: string;
  actionRoute?: string;
}) {
  const navigate = useNavigate();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h6">{title}</Typography>
          {count !== undefined ? (
            <Chip label={count} size="small" color={count > 0 ? 'warning' : 'default'} />
          ) : null}
        </Box>
        <Stack spacing={1.5} sx={{ maxHeight: 320, overflow: 'auto' }}>
          {children}
        </Stack>
        {actionLabel && actionRoute ? (
          <Button size="small" sx={{ mt: 2 }} onClick={() => navigate(actionRoute)}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function AttentionRow({
  animalCode,
  name,
  reason,
  severity,
  animalId,
}: {
  animalCode: string;
  name: string | null;
  reason: string;
  severity: string;
  animalId: string;
}) {
  const navigate = useNavigate();
  const tone = severity === 'error' ? 'error' : severity === 'warning' ? 'warning' : 'info';

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1,
        alignItems: { sm: 'center' },
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Typography variant="subtitle2">
          {animalCode}
          {name ? ` — ${name}` : ''}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {reason}
        </Typography>
        <Chip size="small" label={severity} color={tone} variant="outlined" sx={{ mt: 0.5 }} />
      </Box>
      <Button size="small" variant="outlined" onClick={() => navigate(`/animals/${animalId}`)}>
        View animal
      </Button>
    </Box>
  );
}

export function VaccinationRow({
  animalCode,
  vaccine,
  dueDate,
  status,
  animalId,
}: {
  animalCode: string;
  vaccine: string;
  dueDate: string;
  status: string;
  animalId: string;
}) {
  const navigate = useNavigate();
  return (
    <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="subtitle2">{animalCode}</Typography>
      <Typography variant="body2">{vaccine}</Typography>
      <Typography variant="caption" color="text.secondary">
        Due {dueDate.slice(0, 10)}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
        <StatusChip value={status === 'overdue' ? 'open' : 'in_progress'} />
        <Button size="small" onClick={() => navigate(`/animals/${animalId}`)}>
          View
        </Button>
        <Button size="small" onClick={() => navigate('/health')}>
          Mark done
        </Button>
      </Box>
    </Box>
  );
}

export function CalvingRow({
  animalCode,
  daysRemaining,
  expectedDate,
  animalId,
}: {
  animalCode: string;
  daysRemaining: number;
  expectedDate: string;
  animalId: string;
}) {
  const navigate = useNavigate();
  return (
    <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="subtitle2">{animalCode}</Typography>
      <Typography variant="body2">
        Expected calving in {daysRemaining} day{daysRemaining === 1 ? '' : 's'}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {expectedDate.slice(0, 10)}
      </Typography>
      <Button size="small" sx={{ mt: 1 }} onClick={() => navigate(`/animals/${animalId}`)}>
        View
      </Button>
    </Box>
  );
}

export function WeightRow({
  animalCode,
  currentWeight,
  targetWeight,
  difference,
  trend,
  animalId,
}: {
  animalCode: string;
  currentWeight: number;
  targetWeight: number;
  difference: number;
  trend: string;
  animalId: string;
}) {
  const navigate = useNavigate();
  return (
    <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="subtitle2">{animalCode}</Typography>
      <Typography variant="body2">
        {currentWeight} kg / target {targetWeight} kg ({difference.toFixed(1)} kg below)
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Trend: {trend}
      </Typography>
      <Button size="small" sx={{ mt: 1 }} onClick={() => navigate(`/animals/${animalId}`)}>
        View animal
      </Button>
    </Box>
  );
}

export function FeedEstimateCard({
  estimate,
}: {
  estimate: {
    feedType: string;
    currentStock: number;
    unit: string;
    averageDailyConsumption: number;
    estimatedQuantity: number;
    estimatedCost: number;
    estimatedPurchaseDate: string;
  } | null;
}) {
  if (!estimate) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6">Next feed purchase</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            No feed inventory configured yet.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6">Next feed purchase</Typography>
        <Typography variant="h4" sx={{ color: '#1F6B4A', my: 1 }}>
          ₨ {estimate.estimatedCost.toLocaleString()}
        </Typography>
        <Stack spacing={0.5}>
          <Typography variant="body2">
            {estimate.feedType} · ~{estimate.estimatedQuantity} {estimate.unit}
          </Typography>
          <Typography variant="body2">Est. date: {estimate.estimatedPurchaseDate}</Typography>
          <Typography variant="body2">
            Stock: {estimate.currentStock} {estimate.unit} · ~{estimate.averageDailyConsumption} {estimate.unit}/day
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
