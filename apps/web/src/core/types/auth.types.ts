export type UserRole = "entrepreneur" | "investor" | "admin";
export type AccountStatus = "pending" | "active" | "suspended";
export type EntrepreneurType = "individual" | "team" | "company" | "institution";
export type InvestorType = "angel" | "individual" | "institution" | "incubator" | "accelerator";
export type ProfileVisibility = "public" | "private";

export interface AppUser {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  account_status: AccountStatus;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface EntrepreneurProfile {
  user_id: string;
  entrepreneur_type: EntrepreneurType | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  organization_name: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface InvestorProfile {
  user_id: string;
  investor_type: InvestorType | null;
  organization_name: string | null;
  bio: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  profile_visibility: ProfileVisibility | null;
  is_discoverable: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SignInFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  fullName: string;
  email: string;
  password: string;
  phone:string,
  confirmPassword: string;
  role: Exclude<UserRole, "admin">;
}

export interface CompleteEntrepreneurProfileValues {
  phone: string;
  entrepreneurType: EntrepreneurType;
  bio: string;
  city: string;
  country: string;
  organizationName: string;
  websiteUrl: string;
  linkedinUrl: string;
}

export interface CompleteInvestorProfileValues {
  phone: string;
  investorType: InvestorType;
  organizationName: string;
  bio: string;
  websiteUrl: string;
  linkedinUrl: string;
  profileVisibility: ProfileVisibility;
  isDiscoverable: boolean;
}