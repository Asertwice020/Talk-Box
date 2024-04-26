import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import Loader from "./elements/Loader";

const Router = () => {
  return (
    <>
      <Suspense fallback={<Loader />}>
        <Outlet />
      </Suspense>
    </>
  );
};

export default Router;
