import { useState, type FormEvent } from 'react';
import { Alert, Box, Button, Card, CardContent, TextField, Typography } from '@mui/material';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const { login, verifyMfa } = useAuth();
  const [email, setEmail] = useState('owner@herdos.local');
  const [password, setPassword] = useState('HerdOS@Owner1');
  const [code, setCode] = useState('');
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mfaToken) {
        await verifyMfa(mfaToken, code);
        return;
      }
      const result = await login(email, password);
      if (result.mfaRequired && result.mfaToken) {
        setMfaToken(result.mfaToken);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr.response?.data?.error?.message ?? 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background:
          'radial-gradient(1200px 600px at 10% -10%, #3D8B68 0%, transparent 50%), linear-gradient(160deg, #0F3D2E 0%, #1A2420 55%, #3b2a12 100%)',
        p: 2,
      }}
    >
      <Card sx={{ width: 'min(440px, 100%)', p: 1 }}>
        <CardContent>
          <Typography variant="h4" sx={{ color: 'primary.dark' }}>
            HerdOS
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Sign in to your dairy operations
          </Typography>
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}
          <Box component="form" onSubmit={(e) => void onSubmit(e)} sx={{ display: 'grid', gap: 2 }}>
            {mfaToken ? (
              <TextField
                label="Authenticator code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                autoFocus
              />
            ) : (
              <>
                <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </>
            )}
            <Button type="submit" variant="contained" size="large" disabled={busy}>
              {mfaToken ? 'Verify' : 'Sign in'}
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            Demo owner: owner@herdos.local / HerdOS@Owner1
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
