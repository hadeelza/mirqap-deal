export const ACCOUNT_STATUSES = {
    pending: "pending",
    active: "active",
    suspended: "suspended",
  } as const;
  
  export type AccountStatus =
    (typeof ACCOUNT_STATUSES)[keyof typeof ACCOUNT_STATUSES];