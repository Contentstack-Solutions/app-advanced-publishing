/* Import node module CSS */
/* Import our CSS */
import "./styles.scss";

import ReferencesTable, { ReferencesTableLoading } from "./components/references-table";

/* Import other node modules */
import ContentstackAppSdk from "@contentstack/app-sdk";
import Extension from "@contentstack/app-sdk/dist/src/extension";
import { IAdvancedPublishingConfig } from "./models/models";
import { Link } from "react-router-dom";
import Options from "./components/options";
/* Import React modules */
import React from "react";
import ShowWarning from "./components/show-warning";
/* Import our modules */
import { useApp } from "./store/store";

function Error() {
  const { error } = useApp();
  return <>Error...: {JSON.stringify(error)}</>;
}

const SidebarWidget: React.FC = function () {
  const { loading, error, showWarning, setExtensionConfig } = useApp();

  React.useEffect(() => {
    ContentstackAppSdk.init().then((appSdk: Extension) => {
      console.log("AppSDK", appSdk);
      appSdk
        ?.getConfig()
        .then((sidebarConfig: any) => {
          // console.log("Config", sidebarConfig);
          if (sidebarConfig && sidebarConfig.advancedPublishingConfig) {
            const config: IAdvancedPublishingConfig = {
              ...sidebarConfig.advancedPublishingConfig,
              location: appSdk.location,
              appSdkInitialized: true,
              entryUid: appSdk.location?.SidebarWidget?.entry?.getData()?.uid,
              contentTypeUid: appSdk.location?.SidebarWidget?.entry?.content_type?.uid,
            };
            setExtensionConfig(config);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }, [setExtensionConfig]);

  return (
    <>
      <div className="layout-container">
        {/* <Link to={"/"}>Go to dashboard</Link> */}
        {error && <Error />}
        {showWarning && <ShowWarning />}
        {!showWarning && !error && <Options />}
        {!showWarning && !error && <>{loading ? <ReferencesTableLoading /> : <ReferencesTable />}</>}
      </div>
    </>
  );
};

export default SidebarWidget;
