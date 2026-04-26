export const ROUTES = {
    public: {
      landing: "/",
      main: "/main",
      about: "/about",
      contact: "/contact",
    },
    auth: {
      signIn: "/auth/sign-in",
      register: "/auth/register",
      forgotPassword: "/auth/forgot-password",
      resetPassword: "/auth/reset-password",
      completeProfile: "/auth/complete-profile",
    },
    admin: {
      root: "/admin",
      dashboard: "/admin/dashboard",
    },
    investor: {
      root: "/investor",
      dashboard: "/investor/dashboard",
      profile: "/investor/profile",
      preferences: "/investor/preferences",
      explore: "/investor/explore",
      interests: "/investor/interests",
      offers: "/investor/offers",
      deals: "/investor/deals",
      chats: "/investor/chats",
      notifications: "/investor/notifications",
    },
    entrepreneur: {
      root: "/entrepreneur",
      dashboard: "/entrepreneur/dashboard",
      profile: "/entrepreneur/profile",
      projects: "/entrepreneur/projects",
    },
  } as const;