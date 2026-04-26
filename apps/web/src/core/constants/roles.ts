export const USER_ROLES = {
    admin: "admin",
    investor: "investor",
    entrepreneur: "entrepreneur",
  } as const;
  
  export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
  
  export const PUBLIC_REGISTER_ROLES = {
    investor: USER_ROLES.investor,
    entrepreneur: USER_ROLES.entrepreneur,
  } as const;
  
  export type PublicRegisterRole =
    (typeof PUBLIC_REGISTER_ROLES)[keyof typeof PUBLIC_REGISTER_ROLES];