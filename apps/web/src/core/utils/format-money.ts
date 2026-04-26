export const formatMoney = (value: number, currency = "SAR") => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  export const formatNumber = (value: number) => {
    return new Intl.NumberFormat("ar-SA", {
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  export const formatStartupStage = (value: "idea" | "mvp_seed") => {
    return value === "idea" ? "فكرة" : "مرحلة MVP / Seed";
  };
  
  export const formatCustomerFocus = (
    value: "b2b" | "b2c" | "b2g" | "marketplace" | "other",
  ) => {
    switch (value) {
      case "b2b":
        return "B2B";
      case "b2c":
        return "B2C";
      case "b2g":
        return "B2G";
      case "marketplace":
        return "منصة";
      default:
        return "أخرى";
    }
  };