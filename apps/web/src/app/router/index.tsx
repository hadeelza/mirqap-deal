import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import NotFoundView from "../../components/feedback/NotFoundView";
import { publicRoutes } from "./public-routes";
import { authRoutes } from "./auth-routes";
import { adminRoutes } from "./admin-routes";
import { investorRoutes } from "./investor-routes";
import { entrepreneurRoutes } from "./entrepreneur-routes";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      ...publicRoutes,
      ...authRoutes,
      ...adminRoutes,
      ...investorRoutes,
      ...entrepreneurRoutes,
      {
        path: "*",
        element: <NotFoundView />,
      },
    ],
  },
]);

export default router;