export const ROLES = [
  'super_admin',
  'farm_owner',
  'farm_manager',
  'veterinarian',
  'milk_operator',
  'worker',
  'accountant',
] as const;

export type Role = (typeof ROLES)[number];
