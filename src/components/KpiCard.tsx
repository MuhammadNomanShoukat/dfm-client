import { Card, CardContent, Typography, Box } from '@mui/material';
import type { ReactNode } from 'react';

type Tone = 'default' | 'warning' | 'danger';

const TONE: Record<Tone, string> = {
  default: '#1F6B4A',
  warning: '#B54708',
  danger: '#B42318',
};

export function KpiCard({
  label,
  value,
  hint,
  icon,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: Tone;
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Box sx={{ color: TONE[tone], display: 'flex' }}>{icon}</Box>
        </Box>
        <Typography variant="h4" sx={{ color: TONE[tone] }}>
          {value}
        </Typography>
        {hint ? (
          <Typography variant="caption" color="text.secondary">
            {hint}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}
