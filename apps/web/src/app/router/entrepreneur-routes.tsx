import type { RouteObject } from "react-router-dom";
import EntrepreneurLayout from "../layouts/EntrepreneurLayout";
import RequireEntrepreneur from "../guards/RequireEntrepreneur";
import EntrepreneurDashboardPage from "../../features/entrepreneur/dashboard/pages/EntrepreneurDashboardPage";
import { ROUTES } from "../../core/constants/routes";

export const entrepreneurRoutes: RouteObject[] = [
  {
    path: ROUTES.entrepreneur.root,
    element: (
      <RequireEntrepreneur>
        <EntrepreneurLayout />
      </RequireEntrepreneur>
    ),
    children: [
      {
        path: ROUTES.entrepreneur.dashboard,
        element: <EntrepreneurDashboardPage />,
      },
    ],
  },
];