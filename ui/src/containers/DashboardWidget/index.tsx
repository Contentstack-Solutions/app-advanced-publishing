/* Import our modules */
/* Import node module CSS */
/* Import our CSS */
import "./styles.scss";

/* Import React modules */
import React, { useEffect, useState } from "react";

/* Import other node modules */
import ContentstackAppSdk from "@contentstack/app-sdk";
import { TypeSDKData } from "../../common/types";

const DashboardWidget: React.FC = function () {
  const [state, setState] = useState<TypeSDKData>({
    config: {},
    location: {},
    appSdkInitialized: false,
  });

  useEffect(() => {
    ContentstackAppSdk.init().then(async (appSdk) => {
      const config = await appSdk.getConfig();
      appSdk?.location?.DashboardWidget?.frame?.enableAutoResizing?.();
      setState({
        config,
        location: appSdk.location,
        appSdkInitialized: true,
      });
    });
  }, []);

  return <div className="layout-container">{state.appSdkInitialized && <div>Not used</div>}</div>;
};

export default DashboardWidget;
