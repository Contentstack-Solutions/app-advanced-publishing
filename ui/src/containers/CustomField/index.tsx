/* Import node module CSS */
/* Import our CSS */
import "./styles.scss";

import { FieldLabel, TextInput } from "@contentstack/venus-components";
/* Import React modules */
import React, { useEffect, useState } from "react";

/* Import other node modules */
import ContentstackAppSdk from "@contentstack/app-sdk";
import { TypeSDKData } from "../../common/types";
/* Import our modules */
import localeTexts from "../../common/locale/en-us";

/* To add any labels / captions for fields or any inputs, use common/local/en-us/index.ts */

const CustomField: React.FC = function () {
  const [state, setState] = useState<TypeSDKData>({
    config: {},
    location: {},
    appSdkInitialized: false,
  });

  useEffect(() => {
    ContentstackAppSdk.init().then(async (appSdk) => {
      const config = await appSdk?.getConfig();
      setState({
        config,
        location: appSdk.location,
        appSdkInitialized: true,
      });
    });
  }, []);

  return <div className="layout-container">{state.appSdkInitialized && <div>Not used</div>}</div>;
};

export default CustomField;
