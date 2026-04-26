import type { RouteObject } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import RequireAdmin from "../guards/RequireAdmin";
import AdminDashboardPage from "../../features/admin/dashboard/pages/AdminDashboardPage";
import { ROUTES } from "../../core/constants/routes";

export const adminRoutes: RouteObject[] = [
  {
    path: ROUTES.admin.root,
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      {
        path: ROUTES.admin.dashboard,
        element: <AdminDashboardPage />,
      },
    ],
  },
];