import type { RouteObject } from "react-router-dom";
import EntrepreneurLayout from "../layouts/EntrepreneurLayout";
import RequireEntrepreneur from "../guards/RequireEntrepreneur";
import EntrepreneurDashboardPage from "../../features/entrepreneur/dashboard/pages/EntrepreneurDashboardPage";
import EntrepreneurProfilePage from "../../features/entrepreneur/profile/pages/EntrepreneurProfilePage";
import EditEntrepreneurProfilePage from "../../features/entrepreneur/profile/pages/EditEntrepreneurProfilePage";
import CreateProjectPage from "../../features/entrepreneur/projects/pages/CreateProjectPage";
import MyProjectsPage from "../../features/entrepreneur/projects/pages/MyProjectsPage";
import EntrepreneurProjectDetailsPage from "../../features/entrepreneur/projects/pages/EntrepreneurProjectDetailsPage";
import EditProjectPage from "../../features/entrepreneur/projects/pages/EditProjectPage";
import ProjectEvaluationPage from "../../features/entrepreneur/ai/pages/ProjectEvaluationPage";
import ProjectSimulationPage from "../../features/entrepreneur/ai/pages/ProjectSimulationPage";

export const entrepreneurRoutes: RouteObject[] = [
  {
    path: "entrepreneur",
    element: (
      <RequireEntrepreneur>
        <EntrepreneurLayout />
      </RequireEntrepreneur>
    ),
    children: [
      {
        path: "dashboard",
        element: <EntrepreneurDashboardPage />,
      },
      {
        path: "profile",
        element: <EntrepreneurProfilePage />,
      },
      {
        path: "profile/edit",
        element: <EditEntrepreneurProfilePage />,
      },
      {
        path: "projects/create",
        element: <CreateProjectPage />,
      },
      {
        path: "projects",
        element: <MyProjectsPage />,
      },
      {
        path: "projects/:projectId",
        element: <EntrepreneurProjectDetailsPage />,
      },
      {
        path: "projects/:projectId/edit",
        element: <EditProjectPage />,
      },
      {
        path: "projects/:projectId/evaluation",
        element: <ProjectEvaluationPage />,
      },
      {
        path: "projects/:projectId/simulation",
        element: <ProjectSimulationPage />,
      },
      {
        path: "browse-investors",
        element: <div className="page-placeholder">تصفح المستثمرين</div>,
      },
      {
        path: "offers",
        element: <div className="page-placeholder">العروض المستلمة</div>,
      },
      {
        path: "chats",
        element: <div className="page-placeholder">المحادثات</div>,
      },
      {
        path: "notifications",
        element: <div className="page-placeholder">الإشعارات</div>,
      },
    ],
  },
];