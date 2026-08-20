import type { ReactNode } from 'react';
import { Box, Chip, Typography } from '@mui/material';

const MAP: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
  lactating: { label: 'Lactating', color: 'success' },
  dry: { label: 'Dry', color: 'warning' },
  pregnant: { label: 'Pregnant', color: 'info' },
  sick: { label: 'Sick', color: 'error' },
  sold: { label: 'Sold', color: 'default' },
  dead: { label: 'Dead', color: 'default' },
  heifer: { label: 'Heifer', color: 'info' },
  calf: { label: 'Calf', color: 'info' },
  bull: { label: 'Bull', color: 'default' },
  open: { label: 'Open', color: 'warning' },
  in_progress: { label: 'In progress', color: 'info' },
  done: { label: 'Done', color: 'success' },
  morning: { label: 'Morning', color: 'success' },
  evening: { label: 'Evening', color: 'info' },
  night: { label: 'Night', color: 'default' },
};

export function StatusChip({ value }: { value: string }) {
  const meta = MAP[value] ?? { label: value.replaceAll('_', ' '), color: 'default' as const };
  return <Chip size="small" label={meta.label} color={meta.color} variant="outlined" />;
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, gap: 2, flexWrap: 'wrap' }}>
      <Box>
        <Typography variant="h4">{title}</Typography>
        {subtitle ? (
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>{actions}</Box>
    </Box>
  );
}
