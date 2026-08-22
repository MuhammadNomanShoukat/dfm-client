import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid2 as Grid,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';

type ReportSection = { kind: 'recorded' | 'insight'; title: string; body: string };
type Report = {
  type: string;
  title: string;
  sections: ReportSection[];
  provider: string;
  disclaimer: string;
};

const REPORT_TYPES = [
  { id: 'health', label: 'Animal Health' },
  { id: 'feeding', label: 'Feeding' },
  { id: 'financial', label: 'Financial' },
  { id: 'breeding', label: 'Breeding' },
  { id: 'performance', label: 'Farm Performance' },
];

export function AiReportsPage() {
  const [tab, setTab] = useState(0);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadReport(type: string) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ report: Report }>(`/ai/reports/${type}`);
      setReport(data.report);
    } catch (err) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr.response?.data?.error?.message ?? 'Could not generate report.');
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReport(REPORT_TYPES[tab].id);
  }, [tab]);

  return (
    <Box>
      <PageHeader
        title="AI reports"
        subtitle="Farm insights from your records. AI suggestions are not guaranteed facts."
      />
      <Tabs value={tab} onChange={(_, v: number) => setTab(v)} variant="scrollable" sx={{ mb: 2 }}>
        {REPORT_TYPES.map((t) => (
          <Tab key={t.id} label={t.label} />
        ))}
      </Tabs>
      {loading ? <LinearProgress sx={{ mb: 2 }} /> : null}
      {error ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      {report ? (
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="h5">{report.title}</Typography>
            <Chip size="small" label={report.provider} variant="outlined" />
          </Box>
          <Alert severity="info">{report.disclaimer}</Alert>
          <Grid container spacing={2}>
            {report.sections.map((section) => (
              <Grid key={section.title} size={{ xs: 12, md: section.kind === 'insight' ? 12 : 6 }}>
                <Card
                  sx={{
                    borderLeft: 4,
                    borderColor: section.kind === 'recorded' ? 'primary.main' : 'warning.main',
                  }}
                >
                  <CardContent>
                    <Chip
                      size="small"
                      label={section.kind === 'recorded' ? 'Recorded data' : 'AI insight'}
                      color={section.kind === 'recorded' ? 'primary' : 'warning'}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="h6">{section.title}</Typography>
                    <Typography sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{section.body}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Button variant="outlined" onClick={() => void loadReport(REPORT_TYPES[tab].id)}>
            Regenerate
          </Button>
        </Stack>
      ) : null}
    </Box>
  );
}
