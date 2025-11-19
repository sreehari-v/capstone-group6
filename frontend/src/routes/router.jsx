import { createBrowserRouter } from "react-router";
import AppLayout from "../layouts/AppLayout";
import NotFoundPage from "../pages/NotFoundPage";
import Home from "../pages/Home";
import Features from "../pages/Features";
import Science from "../pages/Science";
import About from "../pages/About";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import DashboardLayout from "../layouts/DashboardLayout";
import DashBoard from "../pages/DashBoard";
import StepTracking from "../pages/StepTracking";
import Breaths from "../pages/Breaths";
import Medication from "../pages/Medication";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "features", element: <Features /> },
      { path: "science", element: <Science /> },
      { path: "about", element: <About /> },
      { path: "/step-tracking", element: <StepTracking /> },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <SignupPage /> },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashBoard /> },
      { path: "steps", element: <StepTracking /> },
      { path: "medication", element: <Medication /> },
      { path: "breath", element: <Breaths /> },
    ],
  },
]);

export default router;
