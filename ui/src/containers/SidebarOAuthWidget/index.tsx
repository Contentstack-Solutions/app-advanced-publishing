/* Import node module CSS */
/* Import our CSS */
import "./styles.scss";

import { Link, Navigate } from "react-router-dom";

/* Import other node modules */
import ContentstackAppSdk from "@contentstack/app-sdk";
import Extension from "@contentstack/app-sdk/dist/src/extension";
import { IAdvancedPublishingConfig } from "../SidebarWidget/models/models";
/* Import React modules */
import React from "react";
/* Import our modules */
import { useApp } from "../SidebarWidget/store/store";
import { useOAuth2Token } from "../../common/oauth2";
import { useOauthCsApi } from "../../common/cs-sdk/cs-sdk";

function Error() {
  const { error } = useApp();
  return <>Error...: {JSON.stringify(error)}</>;
}

const SidebarOAuthWidget: React.FC = function () {
  const [environments, setEnvironments] = React.useState([]);
  const { code, token, getUserCode } = useOAuth2Token({
    authorizeUrl: "https://app.contentstack.com/#!/apps/6336f43b57469b0019995038/authorize",
    clientID: "Yo1twKPJ9uaQle-a",
    responseType: "code",
    redirectUri: "http://localhost:3000/callback",
  });
  const { getEnvironments } = useOauthCsApi(token || "");

  React.useEffect(() => {
    ContentstackAppSdk.init().then((appSdk: Extension) => {
      console.log("AppSDK", appSdk);
      getUserCode();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (token) {
      getEnvironments()
        .then((response) => {
          setEnvironments(response.data.environments);
        })
        .catch((error) => {
          console.log("OAuth Error", error);
        });
    }
  }, [token]);

  if (token) {
    return <Navigate to={"/advanced-publishing-sidebar-widget"} />;
  }
  return (
    <>
      {token ? (
        <div className="layout-container">
          I am authorized! [{token}] {environments.length}
        </div>
      ) : (
        <div className="layout-container">I am NOT authorized!</div>
      )}
      <br />
      <Link to={"/"}>Go to dashboard</Link>
    </>
  );
};

export default SidebarOAuthWidget;
