// import { getDataFromAPI } from '../../services'; //If no services are required, this can be removed\
/* Import node module CSS */
import "@contentstack/venus-components/build/main.css";
/* Import our CSS */
import "./styles.scss";

/* Import other node modules */
import { Button, FieldLabel, InstructionText } from "@contentstack/venus-components";
/* Import React modules */
import React, { useEffect, useState } from "react";
import { showError, showSuccess } from "../utils";

import CodeEditor from "@uiw/react-textarea-code-editor";
import ContentstackAppSdk from "@contentstack/app-sdk";
import { IAdvancedPublishingConfig } from "../SidebarWidget/models/models";
import { TypeAppSdkConfigState } from "../../common/types";
/* Import our modules */
import localeTexts from "../../common/locale/en-us";
import utils from "../../common/utils";

const json: IAdvancedPublishingConfig = {
  environments: [],
  locales: [],
  splitByLocale: true,
  maxReleaseItems: 200,
  endpoint: "http://localhost:8080/",
};
const isValidJson = (json: any) => {
  try {
    JSON.parse(json);
  } catch (e) {
    return false;
  }
  return true;
};
const ConfigScreen: React.FC = function () {
  const [loading, setLoading] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [state, setState] = useState<TypeAppSdkConfigState & { advancedPublishingConfig: IAdvancedPublishingConfig }>({
    installationData: {
      configuration: {},
      serverConfiguration: {},
    },
    setInstallationData: (): any => {},
    appSdkInitialized: false,
    advancedPublishingConfig: json,
  });

  useEffect(() => {
    setLoading(true);
    ContentstackAppSdk.init().then(async (appSdk) => {
      const sdkConfigData = appSdk?.location?.AppConfigWidget?.installation;
      if (sdkConfigData) {
        const installationDataFromSDK = await sdkConfigData.getInstallationData();
        const setInstallationDataOfSDK = sdkConfigData.setInstallationData;

        setState(() => {
          setLoading(false);
          return {
            ...state,
            installationData: utils.mergeObjects(state.installationData, installationDataFromSDK),
            setInstallationData: setInstallationDataOfSDK,
            appSdkInitialized: true,
            advancedPublishingConfig: installationDataFromSDK.configuration.advancedPublishingConfig,
          };
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** updateConfig - Function where you should update the state variable
   * Call this function whenever any field value is changed in the DOM
   * */
  const updateConfig = React.useCallback(() => {
    setLoading(true);
    const updatedConfig = state?.installationData?.configuration || {};
    updatedConfig.advancedPublishingConfig = state.advancedPublishingConfig;

    const updatedServerConfig = state.installationData.serverConfiguration;
    updatedServerConfig.advancedPublishingConfig = state.advancedPublishingConfig;

    if (typeof state.setInstallationData !== "undefined") {
      state
        .setInstallationData({
          ...state.installationData,
          configuration: updatedConfig,
          serverConfiguration: updatedServerConfig,
        })
        .then(() => {
          showSuccess("Configuration saved successfully");
          setLoading(false);
        })
        .catch((error: any) => {
          showError(error);
          setLoading(false);
        });
    }

    return true;
  }, [state]);

  return (
    <div className="layout-container">
      <div className="page-wrapper">
        <div className="config-wrapper">
          <FieldLabel required htmlFor="advancedPublishingConfig" error={!isValid}>
            {localeTexts.configFields.advancedPublishingConfig.label}
          </FieldLabel>

          {loading ? (
            <>Loading...</>
          ) : (
            <>
              {!isValid && <InstructionText style={{ color: "red" }}>Invalid JSON</InstructionText>}
              <div
                style={{
                  border: !isValid ? "1px solid red" : "",
                }}
              >
                <CodeEditor
                  key="advancedPublishingConfig"
                  value={
                    state.appSdkInitialized ? JSON.stringify(state.advancedPublishingConfig, null, 2) : "Loading..."
                  }
                  language="json"
                  placeholder="Please enter JSON content."
                  onChange={(e: any) => {
                    const valid = isValidJson(e.target.value);
                    setIsValid(valid);
                    if (valid) {
                      setState((s) => {
                        return { ...s, advancedPublishingConfig: JSON.parse(e.target.value) };
                      });
                    }
                  }}
                  padding={15}
                  style={{
                    fontSize: 12,
                    width: "100%",
                    backgroundColor: "#f5f5f5",
                    fontFamily: "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                  }}
                />
              </div>
            </>
          )}
          <br />
        </div>
      </div>
      <Button
        isLoading={loading}
        buttonType="primary"
        disabled={!isValid}
        onClick={() => {
          updateConfig();
        }}
      >
        Update Configuration
      </Button>
    </div>
  );
};

export default ConfigScreen;
