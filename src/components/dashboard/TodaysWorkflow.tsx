import { Box, Card, CardContent, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

export type WorkflowItem = {
  key: string;
  label: string;
  count: number;
  route: string;
  completed: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
};

const PRIORITY_COLOR: Record<string, string> = {
  urgent: '#B42318',
  high: '#B54708',
  normal: '#1F6B4A',
  low: '#667085',
};

export function TodaysWorkflow({
  items,
  onToggle,
}: {
  items: WorkflowItem[];
  onToggle: (key: string, completed: boolean) => void;
}) {
  const navigate = useNavigate();
  const done = items.filter((i) => i.completed).length;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Today&apos;s Workflow</Typography>
          <Typography variant="body2" color="text.secondary">
            {done}/{items.length} done
          </Typography>
        </Box>
        <Stack spacing={0.5}>
          {items.map((item) => (
            <Box
              key={item.key}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                borderRadius: 2,
                bgcolor: item.completed ? 'action.hover' : 'transparent',
                borderLeft: `3px solid ${PRIORITY_COLOR[item.priority]}`,
                opacity: item.completed ? 0.7 : 1,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={item.completed}
                    onChange={(e) => onToggle(item.key, e.target.checked)}
                    size="small"
                  />
                }
                label=""
                sx={{ m: 0 }}
              />
              <Box
                sx={{ flex: 1, cursor: 'pointer' }}
                onClick={() => navigate(item.route)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(item.route)}
              >
                <Typography
                  variant="body2"
                  sx={{ textDecoration: item.completed ? 'line-through' : 'none', fontWeight: 500 }}
                >
                  {item.label}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export async function toggleWorkflow(key: string, completed: boolean): Promise<void> {
  await api.post('/dashboard/workflow', { workflowKey: key, completed });
}
