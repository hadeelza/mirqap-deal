import { supabase } from "../client";
import type { PublicCounts } from "../../../core/types/public.types";

export async function getPublicUserCounts(): Promise<
  Pick<PublicCounts, "investorsCount" | "entrepreneursCount">
> {
  const [investorsResponse, entrepreneursResponse] = await Promise.all([
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "investor")
      .eq("account_status", "active"),
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "entrepreneur")
      .eq("account_status", "active"),
  ]);

  if (investorsResponse.error) {
    throw investorsResponse.error;
  }

  if (entrepreneursResponse.error) {
    throw entrepreneursResponse.error;
  }

  return {
    investorsCount: investorsResponse.count ?? 0,
    entrepreneursCount: entrepreneursResponse.count ?? 0,
  };
}


import type {
  AppUser,
  CompleteEntrepreneurProfileValues,
  CompleteInvestorProfileValues,
  EntrepreneurProfile,
  InvestorProfile,
  UserRole,
} from "../../../core/types/auth.types";

export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as AppUser | null) ?? null;
}

export async function createUserRecord(params: {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
}) {
  const { error } = await supabase.from("users").insert({
    id: params.id,
    role: params.role,
    full_name: params.full_name,
    email: params.email,
    phone: null,
    avatar_url: null,
    account_status: "pending",
    is_verified: false,
  });

  if (error) {
    throw error;
  }
}

export async function ensureEntrepreneurProfile(userId: string) {
  const { error } = await supabase.from("entrepreneur_profiles").upsert(
    {
      user_id: userId,
      entrepreneur_type: "individual",
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    throw error;
  }
}

export async function ensureInvestorProfile(userId: string) {
  const { error } = await supabase.from("investor_profiles").upsert(
    {
      user_id: userId,
      investor_type: "individual",
      profile_visibility: "private",
      is_discoverable: true,
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    throw error;
  }
}

export async function getEntrepreneurProfile(userId: string) {
  const { data, error } = await supabase
    .from("entrepreneur_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as EntrepreneurProfile | null) ?? null;
}

export async function getInvestorProfile(userId: string) {
  const { data, error } = await supabase
    .from("investor_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as InvestorProfile | null) ?? null;
}

export async function updateUserCoreProfile(params: {
  userId: string;
  phone: string;
  accountStatus: "pending" | "active" | "suspended";
}) {
  const { error } = await supabase
    .from("users")
    .update({
      phone: params.phone || null,
      account_status: params.accountStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.userId);

  if (error) {
    throw error;
  }
}

export async function upsertEntrepreneurProfile(
  userId: string,
  values: CompleteEntrepreneurProfileValues,
) {
  const { error } = await supabase.from("entrepreneur_profiles").upsert(
    {
      user_id: userId,
      entrepreneur_type: values.entrepreneurType,
      bio: values.bio || null,
      city: values.city || null,
      country: values.country || null,
      organization_name: values.organizationName || null,
      website_url: values.websiteUrl || null,
      linkedin_url: values.linkedinUrl || null,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    throw error;
  }
}

export async function upsertInvestorProfile(
  userId: string,
  values: CompleteInvestorProfileValues,
) {
  const { error } = await supabase.from("investor_profiles").upsert(
    {
      user_id: userId,
      investor_type: values.investorType,
      organization_name: values.organizationName || null,
      bio: values.bio || null,
      website_url: values.websiteUrl || null,
      linkedin_url: values.linkedinUrl || null,
      profile_visibility: values.profileVisibility,
      is_discoverable: values.isDiscoverable,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    throw error;
  }
}


export async function getCurrentAppUser(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}