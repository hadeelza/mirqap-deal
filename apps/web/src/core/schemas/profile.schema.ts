import { z } from "zod";

export const entrepreneurProfileSchema = z.object({
  fullName: z.string().trim().min(3, "الاسم الكامل مطلوب"),
  phone: z.string().trim().min(8, "رقم الجوال غير صحيح"),
  entrepreneurType: z.enum(["individual", "team", "company", "institution"]),
  bio: z.string().trim().min(10, "نبذة مختصرة مطلوبة"),
  city: z.string().trim().min(2, "المدينة مطلوبة"),
  country: z.string().trim().min(2, "الدولة مطلوبة"),
  organizationName: z.string().trim().min(2, "اسم الجهة أو المشروع مطلوب"),
  websiteUrl: z.string().trim().optional().or(z.literal("")),
  linkedinUrl: z.string().trim().optional().or(z.literal("")),
});

export const investorProfileSchema = z.object({
  fullName: z.string().trim().min(3, "الاسم الكامل مطلوب"),
  phone: z.string().trim().min(8, "رقم الجوال غير صحيح"),
  investorType: z.enum([
    "angel",
    "individual",
    "institution",
    "incubator",
    "accelerator",
  ]),
  organizationName: z.string().trim().min(2, "اسم الجهة الاستثمارية مطلوب"),
  bio: z.string().trim().min(10, "نبذة مختصرة مطلوبة"),
  websiteUrl: z.string().trim().optional().or(z.literal("")),
  linkedinUrl: z.string().trim().optional().or(z.literal("")),
  profileVisibility: z.enum(["public", "private"]),
  isDiscoverable: z.boolean(),
});