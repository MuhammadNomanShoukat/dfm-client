import { useState } from 'react';
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../auth/AuthContext';

export function SettingsPage() {
  const { user, refresh } = useAuth();
  const [qr, setQr] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function setup() {
    const { data } = await api.post('/auth/mfa/setup');
    setQr(data.qrDataUrl);
  }

  async function enable() {
    await api.post('/auth/mfa/enable', { code });
    setMsg('MFA is on. Next sign-in will ask for a code.');
    await refresh();
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Account security and MFA (TOTP)." />
      <Card>
        <CardContent>
          <Typography variant="h6">{user?.fullName}</Typography>
          <Typography color="text.secondary">{user?.email}</Typography>
          <Typography sx={{ mt: 1 }}>MFA: {user?.mfaEnabled ? 'Enabled' : 'Off'}</Typography>
          <Stack spacing={2} sx={{ mt: 2, maxWidth: 360 }}>
            <Button variant="outlined" onClick={() => void setup()}>
              Generate authenticator QR
            </Button>
            {qr ? <img src={qr} alt="MFA QR code" width={180} height={180} /> : null}
            <TextField label="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} />
            <Button variant="contained" onClick={() => void enable()} disabled={!qr}>
              Enable MFA
            </Button>
            {msg ? <Alert severity="success">{msg}</Alert> : null}
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
