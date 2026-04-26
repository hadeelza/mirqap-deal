import type { RouteObject } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import SignInPage from "../../features/auth/pages/SignInPage";
import RegisterPage from "../../features/auth/pages/RegisterPage";
import ForgotPasswordPage from "../../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../../features/auth/pages/ResetPasswordPage";
import CompleteProfilePage from "../../features/auth/pages/CompleteProfilePage";
import { ROUTES } from "../../core/constants/routes";

export const authRoutes: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.auth.signIn,
        element: <SignInPage />,
      },
      {
        path: ROUTES.auth.register,
        element: <RegisterPage />,
      },
      {
        path: ROUTES.auth.forgotPassword,
        element: <ForgotPasswordPage />,
      },
      {
        path: ROUTES.auth.resetPassword,
        element: <ResetPasswordPage />,
      },
      {
        path: ROUTES.auth.completeProfile,
        element: <CompleteProfilePage />,
      },
    ],
  },
];