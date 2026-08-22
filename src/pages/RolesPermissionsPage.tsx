import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { ROLE_LABEL } from '../types/session';
import { ROLES } from '../types/roles';

type Permission = { id: string; module: string; action: string; label: string };

type Matrix = {
  permissions: Permission[];
  matrix: Record<string, string[]>;
};

const EDITABLE_ROLES = ROLES.filter((r) => r !== 'super_admin');

export function RolesPermissionsPage() {
  const [data, setData] = useState<Matrix | null>(null);
  const [roleTab, setRoleTab] = useState(0);
  const [dirty, setDirty] = useState<Record<string, string[]>>({});
  const [saved, setSaved] = useState(false);

  async function load() {
    const { data: payload } = await api.get<Matrix>('/permissions/matrix');
    setData(payload);
    setDirty(payload.matrix);
  }

  useEffect(() => {
    void load();
  }, []);

  if (!data) {
    return <Typography>Loading permissions…</Typography>;
  }

  const role = EDITABLE_ROLES[roleTab];
  const selected = new Set(dirty[role] ?? []);

  function toggle(permId: string) {
    const current = dirty[role] ?? [];
    const next = selected.has(permId) ? current.filter((id) => id !== permId) : [...current, permId];
    setDirty({ ...dirty, [role]: next });
    setSaved(false);
  }

  async function save() {
    await api.put('/permissions/matrix', { role, permissionIds: dirty[role] ?? [] });
    setSaved(true);
    await load();
  }

  const grouped = data.permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    const list = acc[p.module] ?? [];
    list.push(p);
    acc[p.module] = list;
    return acc;
  }, {});

  return (
    <Box>
      <PageHeader
        title="Roles & permissions"
        subtitle="Configure what each role can view, create, edit, delete, export, and approve."
        actions={
          <Button variant="contained" onClick={() => void save()}>
            Save {ROLE_LABEL[role]}
          </Button>
        }
      />
      {saved ? (
        <Typography color="success.main" sx={{ mb: 2 }}>
          Permissions saved.
        </Typography>
      ) : null}
      <Tabs value={roleTab} onChange={(_, v: number) => setRoleTab(v)} variant="scrollable" sx={{ mb: 2 }}>
        {EDITABLE_ROLES.map((r) => (
          <Tab key={r} label={ROLE_LABEL[r]} />
        ))}
      </Tabs>
      <Stack spacing={2}>
        {Object.entries(grouped).map(([module, perms]) => (
          <Card key={module}>
            <CardContent>
              <Typography variant="h6" sx={{ textTransform: 'capitalize', mb: 1 }}>
                {module.replaceAll('_', ' ')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {perms.map((p) => (
                  <FormControlLabel
                    key={p.id}
                    control={<Checkbox checked={selected.has(p.id)} onChange={() => toggle(p.id)} size="small" />}
                    label={p.label}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
