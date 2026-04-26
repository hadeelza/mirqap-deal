import type { RouteObject } from "react-router-dom";
import InvestorLayout from "../layouts/InvestorLayout";
import RequireInvestor from "../guards/RequireInvestor";
import InvestorDashboardPage from "../../features/investor/dashboard/pages/InvestorDashboardPage";

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
        element: <div>Investor Profile</div>,
      },
      {
        path: "preferences",
        element: <div>Investor Preferences</div>,
      },
      {
        path: "projects",
        element: <div>Explore Projects</div>,
      },
      {
        path: "interests",
        element: <div>Interested Projects</div>,
      },
      {
        path: "offers",
        element: <div>My Offers</div>,
      },
      {
        path: "deals",
        element: <div>Deals</div>,
      },
      {
        path: "chats",
        element: <div>Chats</div>,
      },
      {
        path: "notifications",
        element: <div>Notifications</div>,
      },
    ],
  },
];