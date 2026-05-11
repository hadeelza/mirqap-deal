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
import BrowseInvestorsPage from "../../features/entrepreneur/projects/pages/BrowseInvestorsPage";
import ProjectEvaluationPage from "../../features/entrepreneur/ai/pages/ProjectEvaluationPage";
import ProjectSimulationPage from "../../features/entrepreneur/ai/pages/ProjectSimulationPage";
import ReceivedOffersPage from "../../features/entrepreneur/offers/pages/ReceivedOffersPage";
import OfferReviewPage from "../../features/entrepreneur/offers/pages/OfferReviewPage";
import EditDealPage from "../../features/entrepreneur/offers/pages/EditDealPage";
import EntrepreneurChatsPage from "../../features/entrepreneur/messages/pages/EntrepreneurChatsPage";
import EntrepreneurChatDetailsPage from "../../features/entrepreneur/messages/pages/EntrepreneurChatDetailsPage";
import EntrepreneurNotificationsPage from "../../features/entrepreneur/notifications/pages/EntrepreneurNotificationsPage";
import EntrepreneurNotificationDetailsPage from "../../features/entrepreneur/notifications/pages/EntrepreneurNotificationDetailsPage";

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
        element: <BrowseInvestorsPage />,
      },
      {
        path: "offers",
        element: <ReceivedOffersPage />,
      },
      {
        path: "offers/:offerId",
        element: <OfferReviewPage />,
      },
      {
        path: "deals/:dealId/edit",
        element: <EditDealPage />,
      },
      {
        path: "chats",
        element: <EntrepreneurChatsPage />,
      },
      {
        path: "chats/:chatId",
        element: <EntrepreneurChatDetailsPage />,
      },
      {
        path: "notifications",
        element: <EntrepreneurNotificationsPage />,
      },
      {
        path: "notifications/:notificationId",
        element: <EntrepreneurNotificationDetailsPage />,
      },
    ],
  },
];