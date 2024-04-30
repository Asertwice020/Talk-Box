import {
  RouterProvider,
  createBrowserRouter,
  Route,
  createRoutesFromElements,
} from "react-router-dom";

import { ChakraProvider } from "@chakra-ui/react";
import { lazy } from "react";
import Router from "./Router";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Router />}>
      <Route path="" element={<HomePage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="login" element={<LoginPage />} />
    </Route>
  )
);

import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import store from "./redux/store";
// import ChatProvider from "./Context/chatProvider";

const App = () => {
  return (
    <ChakraProvider>
      <Provider store={store}>
        <RouterProvider router={router} />
        <Toaster />
      </Provider>
    </ChakraProvider>
  );
};

export default App