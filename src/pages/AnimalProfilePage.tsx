import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { LineChart } from '@mui/x-charts/LineChart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { api } from '../api/client';
import { PageHeader, StatusChip } from '../components/PageHeader';
import { ApiError } from '../components/Feedback';

type Profile = {
  animal: Record<string, unknown>;
  timeline: { id: string; title: string; event_at: string; event_type: string }[];
  health: Record<string, unknown>[];
  vaccinations: Record<string, unknown>[];
  breeding: Record<string, unknown>[];
  production: Record<string, unknown>[];
  feeding: Record<string, unknown>[];
  finance: Record<string, unknown>[];
  weightHistory: { weight_kg: string; recorded_at: string }[];
};

const TABS = ['Overview', 'Health', 'Vaccinations', 'Weight', 'Breeding', 'Feeding', 'Production', 'Financial', 'Timeline'] as const;

export function AnimalProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [data, setData] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [weightInput, setWeightInput] = useState('');

  async function load() {
    if (!id) {
      return;
    }
    setError(null);
    try {
      const { data: payload } = await api.get<Profile>(`/animals/${id}/profile`);
      setData(payload);
    } catch (err) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr.response?.data?.error?.message ?? 'Could not load animal profile.');
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  async function recordWeight() {
    if (!id || !weightInput) {
      return;
    }
    await api.post(`/animals/${id}/weight`, { weightKg: Number(weightInput) });
    setWeightInput('');
    await load();
  }

  if (error) {
    return <ApiError message={error} onRetry={() => void load()} />;
  }
  if (!data) {
    return <Typography>Loading profile…</Typography>;
  }

  const a = data.animal;
  const code = String(a.animal_code ?? '');
  const name = a.name ? String(a.name) : null;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/animals')} sx={{ mb: 2 }}>
        Back to herd
      </Button>
      <PageHeader
        title={`${code}${name ? ` — ${name}` : ''}`}
        subtitle={`${String(a.breed)} · ${String(a.gender)} · ${String(a.species)}`}
        actions={<StatusChip value={String(a.status)} />}
      />

      <Tabs
        value={tab}
        onChange={(_, v: number) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        {TABS.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">Overview</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Row label="Animal ID" value={code} />
                  <Row label="RFID" value={String(a.rfid_tag ?? '—')} />
                  <Row label="Birth date" value={a.birth_date ? String(a.birth_date).slice(0, 10) : '—'} />
                  <Row label="Weight" value={a.weight_kg ? `${a.weight_kg} kg` : '—'} />
                  <Row label="Target weight" value={a.target_weight_kg ? `${a.target_weight_kg} kg` : '—'} />
                  <Row label="Location" value={[a.barn_name, a.stall_code].filter(Boolean).join(' · ') || '—'} />
                  <Row label="Purchase" value={a.purchase_price ? `₨ ${a.purchase_price}` : '—'} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 1 && <RecordList title="Health records" items={data.health} fields={['record_kind', 'diagnosis', 'recorded_at']} />}
      {tab === 2 && <RecordList title="Vaccinations" items={data.vaccinations} fields={['vaccine_name', 'given_on', 'next_due_on']} />}
      {tab === 3 && (
        <Box>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">Record weight</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
                <TextField
                  label="Weight (kg)"
                  type="number"
                  size="small"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                />
                <Button variant="contained" onClick={() => void recordWeight()}>
                  Save
                </Button>
              </Stack>
            </CardContent>
          </Card>
          {data.weightHistory.length > 1 ? (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">Weight trend</Typography>
                <LineChart
                  height={240}
                  xAxis={[{
                    scaleType: 'point',
                    data: [...data.weightHistory].reverse().map((w) => String(w.recorded_at).slice(0, 10)),
                  }]}
                  series={[{
                    data: [...data.weightHistory].reverse().map((w) => Number(w.weight_kg)),
                    color: '#1F6B4A',
                  }]}
                />
              </CardContent>
            </Card>
          ) : null}
          <RecordList title="Weight history" items={data.weightHistory} fields={['weight_kg', 'recorded_at']} />
        </Box>
      )}
      {tab === 4 && <RecordList title="Breeding history" items={data.breeding} fields={['event_kind', 'expected_calving_date', 'event_at']} />}
      {tab === 5 && <RecordList title="Feeding history" items={data.feeding} fields={['feed_name', 'quantity', 'consumed_at']} />}
      {tab === 6 && <RecordList title="Production (milk)" items={data.production} fields={['quantity_liters', 'shift', 'recorded_at']} />}
      {tab === 7 && <RecordList title="Financial" items={data.finance} fields={['entry_type', 'category', 'amount', 'entry_date']} />}
      {tab === 8 && (
        <Stack spacing={1}>
          {data.timeline.map((ev) => (
            <Card key={ev.id} variant="outlined">
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="subtitle2">{ev.title}</Typography>
                  <Chip size="small" label={ev.event_type} variant="outlined" />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {new Date(ev.event_at).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
          {data.timeline.length === 0 ? <Typography color="text.secondary">No activity yet.</Typography> : null}
        </Stack>
      )}
    </Box>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={500}>{value}</Typography>
    </Box>
  );
}

function RecordList({
  title,
  items,
  fields,
}: {
  title: string;
  items: Record<string, unknown>[];
  fields: string[];
}) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        {items.length === 0 ? (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            No records yet.
          </Typography>
        ) : (
          <Stack spacing={1} sx={{ mt: 1 }}>
            {items.map((item, idx) => (
              <Box key={String(item.id ?? idx)} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                {fields.map((f) => (
                  <Typography key={f} variant="body2">
                    {f.replaceAll('_', ' ')}: {String(item[f] ?? '—').slice(0, 40)}
                  </Typography>
                ))}
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
