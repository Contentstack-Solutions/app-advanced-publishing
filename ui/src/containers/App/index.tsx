/* Import node module CSS */
import "@contentstack/venus-components/build/main.css";
/* Import our CSS */
import "./styles.scss";

import { HashRouter, Link, Navigate, Route, Routes } from "react-router-dom";

import { Provider as BulkPublishingProvider } from "jotai";
import ConfigScreen from "../ConfigScreen";
/* Import other node modules */
/* Import our modules */
import ErrorBoundary from "../../components/ErrorBoundary";
import { OAuthCallback } from "../../common/oauth2";
/* Import React modules */
import React from "react";
import SidebarOAuthWidget from "../SidebarOAuthWidget";
import SidebarWidget from "../SidebarWidget";

const HomeRedirectHandler = function () {
  console.log("HomeRedirectHandler");
  console.log(window.location?.pathname);
  if (window?.location?.pathname === "/callback") {
    return <Navigate to={{ pathname: window.location.pathname }} />;
  }
  return (
    <>
      <ul>
        <li>
          <Link to={"/advanced-publishing-sidebar-widget"}>Management Token</Link>
        </li>
        <li>
          <Link to={"/oauth-sidebar-widget"}>OAuth</Link>
        </li>
      </ul>
    </>
  );
  // }
  // return (
  //   <InstructionText style={{ fontSize: 18, color: "#f40" }}>Extension is not properly configured!</InstructionText>
  // );
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
            <Route path="/oauth-sidebar-widget" element={<SidebarOAuthWidget />} />
            <Route path="/callback" element={<OAuthCallback />} />
            {/* <Route path="/dashboard-widget" element={<DashboardWidget />} />
            <Route path="/custom-field" element={<CustomField />} /> */}
          </Routes>
        </HashRouter>
      </ErrorBoundary>
    </div>
  );
};

export default App;
