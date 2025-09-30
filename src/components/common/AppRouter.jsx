import React from "react";
import { Route, Routes } from "react-router-dom";
import routes from "../../utils/routes";

const AppRouter = () => {
  return (
    <Routes>
      {routes.map((route) => (
        <Route key={route.url} element={route.component} path={route.url} />
      ))}
    </Routes>
  );
};

export default AppRouter;
