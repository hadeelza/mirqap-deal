export const APP_ROUTES = {
    landing: "/",
    main: "/main",
    about: "/about",
    contact: "/contact",
    signIn: "/sign-in",
    register: "/register",
  } as const;


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
      dashboard: "/entrepreneur/dashboard",
    },
  } as const;