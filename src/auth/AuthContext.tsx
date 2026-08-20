import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, getActiveFarm, setActiveFarm } from '../api/client';
import type { FarmSummary, SessionUser } from '../types/session';

type AuthState = {
  user: SessionUser | null;
  farm: FarmSummary | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ mfaRequired: boolean; mfaToken?: string }>;
  verifyMfa: (mfaToken: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  selectFarm: (farmId: string) => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [farm, setFarm] = useState<FarmSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const applyUser = useCallback((next: SessionUser) => {
    setUser(next);
    const stored = getActiveFarm();
    const match = next.farms.find((item) => item.id === stored) ?? next.farms[0] ?? null;
    setFarm(match);
    setActiveFarm(match?.id ?? null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get<{ user: SessionUser }>('/auth/me');
      applyUser(data.user);
    } catch {
      setUser(null);
      setFarm(null);
    } finally {
      setLoading(false);
    }
  }, [applyUser]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.mfaRequired) {
      return { mfaRequired: true, mfaToken: data.mfaToken as string };
    }
    applyUser(data.user as SessionUser);
    return { mfaRequired: false };
  }, [applyUser]);

  const verifyMfa = useCallback(async (mfaToken: string, code: string) => {
    const { data } = await api.post('/auth/mfa/verify', { mfaToken, code });
    applyUser(data.user as SessionUser);
  }, [applyUser]);

  const logout = useCallback(async () => {
    await api.post('/auth/logout');
    setUser(null);
    setFarm(null);
    setActiveFarm(null);
  }, []);

  const selectFarm = useCallback((farmId: string) => {
    setUser((current) => {
      if (!current) {
        return current;
      }
      const match = current.farms.find((item) => item.id === farmId) ?? null;
      setFarm(match);
      setActiveFarm(match?.id ?? null);
      return current;
    });
  }, []);

  const value = useMemo(
    () => ({ user, farm, loading, login, verifyMfa, logout, selectFarm, refresh }),
    [user, farm, loading, login, verifyMfa, logout, selectFarm, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
