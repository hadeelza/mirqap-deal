import type { RouteObject } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import LandingPage from "../../features/public/pages/LandingPage";
import MainPage from "../../features/public/pages/MainPage";
import AboutPage from "../../features/public/pages/AboutPage";
import ContactPage from "../../features/public/pages/ContactPage";
import { ROUTES } from "../../core/constants/routes";

export const publicRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: ROUTES.public.main,
        element: <MainPage />,
      },
      {
        path: ROUTES.public.about,
        element: <AboutPage />,
      },
      {
        path: ROUTES.public.contact,
        element: <ContactPage />,
      },
    ],
  },
];