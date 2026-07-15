import { RouterProvider, createBrowserRouter } from "react-router";
import HydrateFallback from "@components/common/HydrateFallback";
import ErrorPage from "@components/common/ErrorPage";
import Controller from "../Controller";
import Login from "@components/features/auth/Login";
import { actions as a, loaders as l } from "./actions-loaders";
import App from "@components/App";

const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    element: <Controller />,
    loader: l.controller,
    // errorElement: <ErrorPage />,
    shouldRevalidate: ({ formAction }) => formAction === "/login",
    HydrateFallback,
    handle: {},
    children: [
      { index: true, element: <App />, loader: l.app },
      {
        path: "/login",
        element: <Login />,
        loader: l.login,
        action: a.login,
      },
      { path: "/logout", loader: l.logout },
    ],
  },
]);

export default function AppRouterProvider() {
  return <RouterProvider router={router} />;
}
