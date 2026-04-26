export const formatArabicNumber = (value: number) => {
    return new Intl.NumberFormat("ar-SA").format(value);
  };
  
  export const formatSar = (value: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  export const getStartupStageLabel = (value: "idea" | "mvp_seed") => {
    if (value === "idea") return "فكرة";
    return "مرحلة MVP / Seed";
  };
  
  export const getCustomerFocusLabel = (
    value: "b2b" | "b2c" | "b2g" | "marketplace" | "other",
  ) => {
    if (value === "b2b") return "B2B";
    if (value === "b2c") return "B2C";
    if (value === "b2g") return "B2G";
    if (value === "marketplace") return "منصة";
    return "أخرى";
  };