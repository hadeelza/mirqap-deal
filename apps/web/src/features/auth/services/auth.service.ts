import { supabase } from "../../../lib/supabase/client";
import { ROUTES } from "../../../core/constants/routes";
import type { RegisterFormValues } from "../../../core/types/auth.types";
export type UserRole = "admin" | "investor" | "entrepreneur";

export type SignInPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: Exclude<UserRole, "admin">;
};

export type CompleteEntrepreneurProfilePayload = {
  entrepreneurType: "individual" | "team" | "company" | "institution";
  bio: string;
  city: string;
  country: string;
  organizationName: string;
  websiteUrl?: string;
  linkedinUrl?: string;
};

export type CompleteInvestorProfilePayload = {
  investorType: "angel" | "individual" | "institution" | "incubator" | "accelerator";
  organizationName: string;
  bio: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  profileVisibility?: "public" | "private";
  isDiscoverable?: boolean;
  minTicketSar?: number | null;
  maxTicketSar?: number | null;
};

export type AuthResult = {
  redirectTo: string;
  requiresEmailConfirmation: boolean;
};

function normalizeText(value?: string | null) {
  return value?.trim() || null;
}

function mapAuthError(message: string) {
  const text = message.toLowerCase();

  if (text.includes("invalid login credentials")) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة";
  }

  if (text.includes("email not confirmed")) {
    return "يجب تأكيد البريد الإلكتروني أولًا";
  }

  if (text.includes("user already registered")) {
    return "هذا البريد الإلكتروني مستخدم مسبقًا";
  }

  if (text.includes("email rate limit exceeded")) {
    return "تم تجاوز الحد المسموح لطلبات البريد، حاول بعد قليل";
  }

  if (text.includes("password should be at least")) {
    return "كلمة المرور قصيرة جدًا";
  }

  return message || "حدث خطأ غير متوقع";
}

async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(mapAuthError(error.message));
  }

  if (!user) {
    throw new Error("تعذر العثور على المستخدم الحالي");
  }

  return user.id;
}

async function ensureUsersRow(payload: RegisterPayload, userId: string) {
  const { error } = await supabase.from("users").upsert(
    {
      id: userId,
      role: payload.role,
      full_name: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      account_status: "active",
      is_verified: true,
    },
    { onConflict: "id" }
  );

  if (error) {
    throw new Error(error.message);
  }
}

async function ensureRoleProfile(role: Exclude<UserRole, "admin">, userId: string) {
  if (role === "entrepreneur") {
    const { error } = await supabase.from("entrepreneur_profiles").upsert(
      {
        user_id: userId,
        entrepreneur_type: "individual",
      },
      { onConflict: "user_id" }
    );

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const { error } = await supabase.from("investor_profiles").upsert(
    {
      user_id: userId,
      investor_type: "individual",
      profile_visibility: "public",
      is_discoverable: true,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    throw new Error(error.message);
  }

  const { error: preferencesError } = await supabase.from("investor_preferences").upsert(
    {
      investor_id: userId,
      min_ticket_sar: null,
      max_ticket_sar: null,
    },
    { onConflict: "investor_id" }
  );

  if (preferencesError) {
    throw new Error(preferencesError.message);
  }
}

function isEntrepreneurProfileComplete(profile: {
  entrepreneur_type?: string | null;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  organization_name?: string | null;
} | null) {
  return Boolean(
    profile?.entrepreneur_type &&
      profile?.bio &&
      profile?.city &&
      profile?.country &&
      profile?.organization_name
  );
}

function isInvestorProfileComplete(profile: {
  investor_type?: string | null;
  bio?: string | null;
  organization_name?: string | null;
} | null) {
  return Boolean(profile?.investor_type && profile?.bio && profile?.organization_name);
}

export async function getPostAuthRedirect(userId?: string) {
  const resolvedUserId = userId || (await getCurrentUserId());

  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", resolvedUserId)
    .single();

  if (userError || !userRow) {
    throw new Error(userError?.message || "تعذر جلب بيانات المستخدم");
  }

  const role = userRow.role as UserRole;

  if (role === "admin") {
    return ROUTES.admin.dashboard;
  }

  if (role === "entrepreneur") {
    const { data: profile, error: profileError } = await supabase
      .from("entrepreneur_profiles")
      .select("entrepreneur_type, bio, city, country, organization_name")
      .eq("user_id", resolvedUserId)
      .maybeSingle();

    if (profileError) {
      throw new Error(profileError.message);
    }

    return isEntrepreneurProfileComplete(profile)
      ? ROUTES.entrepreneur.dashboard
      : ROUTES.auth.completeProfile;
  }

  const { data: profile, error: profileError } = await supabase
    .from("investor_profiles")
    .select("investor_type, bio, organization_name")
    .eq("user_id", resolvedUserId)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  return isInvestorProfileComplete(profile)
    ? ROUTES.investor.dashboard
    : ROUTES.auth.completeProfile;
}

export async function signInService(payload: SignInPayload): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });

  if (error) {
    throw new Error(mapAuthError(error.message));
  }

  if (!data.user) {
    throw new Error("تعذر تسجيل الدخول");
  }

  const redirectTo = await getPostAuthRedirect(data.user.id);

  return {
    redirectTo,
    requiresEmailConfirmation: false,
  };
}



export async function registerService(values: RegisterFormValues) {
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.fullName,
        phone: values.phone,
        role: values.role,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("تعذر إنشاء الحساب حالياً.");
  }

  return {
    user: data.user,
    session: data.session,
    redirectTo: data.session ? ROUTES.auth.completeProfile : ROUTES.auth.signIn,
    needsEmailConfirmation: !data.session,
    message: data.session
      ? "تم إنشاء الحساب بنجاح."
      : "تم إنشاء الحساب. فعّل البريد الإلكتروني ثم سجّل الدخول لإكمال الملف الشخصي.",
  };
}

export async function signOutService() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(mapAuthError(error.message));
  }
}

export async function forgotPasswordService(email: string) {
  const redirectTo = `${window.location.origin}${ROUTES.auth.resetPassword}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    throw new Error(mapAuthError(error.message));
  }

  return true;
}

export async function resetPasswordService(password: string) {
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    throw new Error(mapAuthError(error.message));
  }

  return true;
}


import type {
  AppUser,
  CompleteEntrepreneurProfileValues,
  CompleteInvestorProfileValues,
} from "../../../core/types/auth.types";




export async function completeEntrepreneurProfileService(
  appUser: AppUser,
  values: CompleteEntrepreneurProfileValues,
) {
  const now = new Date().toISOString();

  const { error: userError } = await supabase
    .from("users")
    .update({
      phone: values.phone,
      account_status: "active",
      updated_at: now,
    })
    .eq("id", appUser.id);

  if (userError) {
    throw new Error("تعذر تحديث بيانات المستخدم.");
  }

  const { error: profileError } = await supabase
    .from("entrepreneur_profiles")
    .upsert(
      {
        user_id: appUser.id,
        entrepreneur_type: values.entrepreneurType,
        bio: values.bio,
        city: values.city,
        country: values.country,
        organization_name: values.organizationName,
        website_url: values.websiteUrl || null,
        linkedin_url: values.linkedinUrl || null,
        created_at: now,
        updated_at: now,
      },
      {
        onConflict: "user_id",
      },
    );

  if (profileError) {
    throw new Error("تعذر تحديث ملف رائد الأعمال.");
  }

  await supabase.auth.signOut();

  return ROUTES.auth.signIn;
}



// export async function completeEntrepreneurProfileService(
//   userId: string,
//   payload: CompleteEntrepreneurProfilePayload
// ): Promise<string>;
// export async function completeEntrepreneurProfileService(
//   payload: CompleteEntrepreneurProfilePayload
// ): Promise<string>;
// export async function completeEntrepreneurProfileService(
//   userIdOrPayload: string | CompleteEntrepreneurProfilePayload,
//   maybePayload?: CompleteEntrepreneurProfilePayload
// ): Promise<string> {
//   const userId =
//     typeof userIdOrPayload === "string" ? userIdOrPayload : await getCurrentUserId();
//   const payload =
//     typeof userIdOrPayload === "string" ? maybePayload : userIdOrPayload;

//   if (!payload) {
//     throw new Error("بيانات الملف الشخصي غير مكتملة");
//   }

//   const { error } = await supabase.from("entrepreneur_profiles").upsert(
//     {
//       user_id: userId,
//       entrepreneur_type: payload.entrepreneurType,
//       bio: normalizeText(payload.bio),
//       city: normalizeText(payload.city),
//       country: normalizeText(payload.country),
//       organization_name: normalizeText(payload.organizationName),
//       website_url: normalizeText(payload.websiteUrl),
//       linkedin_url: normalizeText(payload.linkedinUrl),
//     },
//     { onConflict: "user_id" }
//   );

//   if (error) {
//     throw new Error(error.message);
//   }

//   return ROUTES.entrepreneur.dashboard;
// }

export async function completeInvestorProfileService(
  appUser: AppUser,
  values: CompleteInvestorProfileValues,
) {
  const now = new Date().toISOString();

  const { error: userError } = await supabase
    .from("users")
    .update({
      phone: values.phone,
      account_status: "active",
      updated_at: now,
    })
    .eq("id", appUser.id);

    if (userError) {
      console.error("users update error:", userError);
      throw new Error(userError.message || "تعذر تحديث بيانات المستخدم.");
    }

  const { error: profileError } = await supabase
    .from("investor_profiles")
    .upsert(
      {
        user_id: appUser.id,
        investor_type: values.investorType,
        organization_name: values.organizationName,
        bio: values.bio,
        website_url: values.websiteUrl || null,
        linkedin_url: values.linkedinUrl || null,
        profile_visibility: values.profileVisibility,
        is_discoverable: values.isDiscoverable,
        created_at: now,
        updated_at: now,
      },
      {
        onConflict: "user_id",
      },
    );

  if (profileError) {
    throw new Error("تعذر تحديث ملف المستثمر.");
  }

  await supabase.auth.signOut();

  return ROUTES.auth.signIn;
}


// export async function completeInvestorProfileService(
//   userId: string,
//   payload: CompleteInvestorProfilePayload
// ): Promise<string>;
// export async function completeInvestorProfileService(
//   payload: CompleteInvestorProfilePayload
// ): Promise<string>;
// export async function completeInvestorProfileService(
//   userIdOrPayload: string | CompleteInvestorProfilePayload,
//   maybePayload?: CompleteInvestorProfilePayload
// ): Promise<string> {
//   const userId =
//     typeof userIdOrPayload === "string" ? userIdOrPayload : await getCurrentUserId();
//   const payload =
//     typeof userIdOrPayload === "string" ? maybePayload : userIdOrPayload;

//   if (!payload) {
//     throw new Error("بيانات الملف الشخصي غير مكتملة");
//   }

//   const { error } = await supabase.from("investor_profiles").upsert(
//     {
//       user_id: userId,
//       investor_type: payload.investorType,
//       organization_name: normalizeText(payload.organizationName),
//       bio: normalizeText(payload.bio),
//       website_url: normalizeText(payload.websiteUrl),
//       linkedin_url: normalizeText(payload.linkedinUrl),
//       profile_visibility: payload.profileVisibility ?? "public",
//       is_discoverable: payload.isDiscoverable ?? true,
//     },
//     { onConflict: "user_id" }
//   );

//   if (error) {
//     throw new Error(error.message);
//   }

//   const { error: preferencesError } = await supabase.from("investor_preferences").upsert(
//     {
//       investor_id: userId,
//       min_ticket_sar: payload.minTicketSar ?? null,
//       max_ticket_sar: payload.maxTicketSar ?? null,
//     },
//     { onConflict: "investor_id" }
//   );

//   if (preferencesError) {
//     throw new Error(preferencesError.message);
//   }

//   return ROUTES.investor.dashboard;
// }

export const signInUser = signInService;
export const registerUser = registerService;
export const signOutUser = signOutService;
export const resolvePostAuthRoute = getPostAuthRedirect;