import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import GreenApronCardPage from "../pages/GreenApronCardPage/GreenApronCardPage";
import LoginPage from "../pages/LoginPage/LoginPage";
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <GreenApronCardPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
]);
