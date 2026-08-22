export type Role =
  | 'super_admin'
  | 'farm_owner'
  | 'farm_manager'
  | 'veterinarian'
  | 'milk_operator'
  | 'worker'
  | 'accountant';

export type FarmSummary = {
  id: string;
  name: string;
  code: string;
  city: string | null;
  role: Role;
};

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  globalRole: Role;
  tenantId: string | null;
  mfaEnabled: boolean;
  farms: FarmSummary[];
};

export const ROLE_LABEL: Record<Role, string> = {
  super_admin: 'Super Admin',
  farm_owner: 'Farm Owner',
  farm_manager: 'Farm Manager',
  veterinarian: 'Veterinarian',
  milk_operator: 'Milk Operator',
  worker: 'Worker',
  accountant: 'Accountant',
};
