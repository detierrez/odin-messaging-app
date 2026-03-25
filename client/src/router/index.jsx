import { RouterProvider, createBrowserRouter } from "react-router";

import HydrateFallback from "../components/common/HydrateFallback";
import ErrorPage from "../components/layout/Pages/ErrorPage";

import Controller from "../Controller";
// import { rockAction, rockLoader, rocksLoader } from "./actions-loaders";

export default function AppRouterProvider() {
  return (
    <>
      <RouterProvider
        router={createBrowserRouter([
          {
            id: "root",
            path: "/",
            element: <Controller />,
            // errorElement: <ErrorPage />,
            // shouldRevalidate: () => true,
            // HydrateFallback,
            // children: [
            //   { index: true, element: <Rocks />, loader: rocksLoader },
            //   {
            //     path: "rocks/:rockId",
            //     element: <Rock />,
            //     loader: rockLoader,
            //     action: rockAction,
            //   },
            // ],
          },
        ])}
      />
    </>
  );
}
