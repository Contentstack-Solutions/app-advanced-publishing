/* Import node module CSS */
import "@contentstack/venus-components/build/main.css";
/* Import our CSS */
import "./styles.scss";

import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import ConfigScreen from "../ConfigScreen";
/* Import other node modules */
/* Import our modules */
import ErrorBoundary from "../../components/ErrorBoundary";
/* Import React modules */
import React from "react";
import SidebarWidget from "../SidebarWidget";

const HomeRedirectHandler = function () {
  if (window?.location?.pathname !== "/") {
    return <Navigate to={{ pathname: window.location.pathname }} />;
  }
  return null;
};

const App: React.FC = function () {
  return (
    <div className="app">
      <ErrorBoundary>
        <HashRouter>
          {/* If the path is changed here,
              be sure to update the path for corresponding UI location
              in Update App API */
          /* Below list has all the possible UI paths\.
              Keep only the paths that are required for your app and
              remove the remaining paths and their source code also. */}
          <Routes>
            <Route path="/" element={<HomeRedirectHandler />} />
            <Route path="/config" element={<ConfigScreen />} />
            <Route path="/advanced-publishing-sidebar-widget" element={<SidebarWidget />} />
            {/* <Route path="/dashboard-widget" element={<DashboardWidget />} />
            <Route path="/custom-field" element={<CustomField />} /> */}
          </Routes>
        </HashRouter>
      </ErrorBoundary>
    </div>
  );
};

export default App;
