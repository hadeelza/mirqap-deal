import type { RouteObject } from "react-router-dom";
import InvestorLayout from "../layouts/InvestorLayout";
import RequireInvestor from "../guards/RequireInvestor";

import InvestorDashboardPage from "../../features/investor/dashboard/pages/InvestorDashboardPage";
import InvestorProfilePage from "../../features/investor/profile/pages/InvestorProfilePage";
import EditInvestorProfilePage from "../../features/investor/profile/pages/EditInvestorProfilePage";
import InvestorPreferencesPage from "../../features/investor/profile/pages/InvestorPreferencesPage";

import ExploreProjectsPage from "../../features/investor/explore/pages/ExploreProjectsPage";
import ProjectDetailsPage from "../../features/investor/explore/pages/ProjectDetailsPage";

import InterestedProjectsPage from "../../features/investor/interests/pages/InterestedProjectsPage";

import SubmitOfferPage from "../../features/investor/offers/pages/SubmitOfferPage";
import MyOffersPage from "../../features/investor/offers/pages/MyOffersPage";
import OfferDetailsPage from "../../features/investor/offers/pages/OfferDetailsPage";

import InvestorDealsPage from "../../features/investor/deals/pages/InvestorDealsPage";
import InvestorDealDetailsPage from "../../features/investor/deals/pages/InvestorDealDetailsPage";

import InvestorChatsPage from "../../features/investor/messages/pages/InvestorChatsPage";
import InvestorChatDetailsPage from "../../features/investor/messages/pages/InvestorChatDetailsPage";

import InvestorNotificationsPage from "../../features/investor/notifications/pages/InvestorNotificationsPage";
import InvestorNotificationDetailsPage from "../../features/investor/notifications/pages/InvestorNotificationDetailsPage";


export const investorRoutes: RouteObject[] = [
  {
    path: "investor",
    element: (
      <RequireInvestor>
        <InvestorLayout />
      </RequireInvestor>
    ),
    children: [
      {
        path: "dashboard",
        element: <InvestorDashboardPage />,
      },
      {
        path: "profile",
        element: <InvestorProfilePage />,
      },
      {
        path: "profile/edit",
        element: <EditInvestorProfilePage />,
      },
      {
        path: "preferences",
        element: <InvestorPreferencesPage />,
      },
      {
        path: "explore",
        element: <ExploreProjectsPage />,
      },
      {
        path: "explore/:projectId",
        element: <ProjectDetailsPage />,
      },
      {
        path: "interests",
        element: <InterestedProjectsPage />,
      },
      {
        path: "offers",
        element: <MyOffersPage />,
      },
      {
        path: "offers/submit/:projectId",
        element: <SubmitOfferPage />,
      },
      {
        path: "offers/:offerId",
        element: <OfferDetailsPage />,
      },
      {
        path: "deals",
        element: <InvestorDealsPage />,
      },
      {
        path: "deals/:dealId",
        element: <InvestorDealDetailsPage />,
      },
      {
        path: "chats",
        element: <InvestorChatsPage />,
      },
      {
        path: "chats/:chatId",
        element: <InvestorChatDetailsPage />,
      },
      {
        path: "notifications",
        element: <InvestorNotificationsPage />,
      },
      {
        path: "notifications/:notificationId",
        element: <InvestorNotificationDetailsPage />,
      },
    ],
  },
];