import { Accordion, Checkbox, Field, InstructionText, ToggleSwitch } from "@contentstack/venus-components";
import { IAdvancedPublishingConfig, IEnvironmentConfig, ILocaleConfig, OPERATIONS } from "../models/models";

import React from "react";
import { useApp } from "../store/store";

function Options() {
  const { extensionConfig, operationInProgress, setExtensionConfig } = useApp();
  const [allLocalesChecked, setAllLocalesChecked] = React.useState(false);
  const [allEnvironmentsChecked, setAllEnvironmentsChecked] = React.useState(false);
  return (
    <>
      <Accordion title={"Locales"}>
        <Field>
          <div key="locales" className="Checkbox-wrapper" style={{ paddingLeft: 20 }}>
            <div key="locale_all" className="Checkbox-wrapper" style={{ paddingLeft: 20 }}>
              <ToggleSwitch
                onClick={() => {
                  setAllLocalesChecked((p) => {
                    setExtensionConfig((config) => {
                      return {
                        ...config,
                        locales: config.locales.map((locale) => {
                          return { ...locale, checked: !p };
                        }),
                      };
                    });
                    return !p;
                  });
                }}
                label={"Select All"}
                checked={allLocalesChecked || extensionConfig.locales?.every((l: any) => l.checked)}
                disabled={operationInProgress !== OPERATIONS.NONE}
              />
            </div>
            {extensionConfig.locales &&
              extensionConfig.locales.length > 0 &&
              extensionConfig.locales.map((locale: ILocaleConfig) => {
                return (
                  <div key={locale.code} className="Checkbox-wrapper" style={{ paddingLeft: 20 }}>
                    <Checkbox
                      onClick={() => {
                        setExtensionConfig((c: IAdvancedPublishingConfig) => {
                          const index = c.locales.findIndex((l: ILocaleConfig) => l.code === locale.code);
                          const result = [
                            ...c.locales.slice(0, index),
                            { ...c.locales[index], checked: !c.locales[index].checked },
                            ...c.locales.slice(index + 1),
                          ];
                          setAllLocalesChecked(result.every((l: any) => l.checked));
                          return { ...c, locales: result };
                        });
                      }}
                      label={locale.name}
                      checked={locale.checked}
                      disabled={operationInProgress !== OPERATIONS.NONE}
                      isButton={false}
                      isLabelFullWidth={false}
                    />
                  </div>
                );
              })}
          </div>
          <InstructionText>The selected references will be published in these locales.</InstructionText>
        </Field>
      </Accordion>
      <Accordion title={"Environments"}>
        <Field>
          <div key="environments" className="Checkbox-wrapper" style={{ paddingLeft: 20 }}>
            <div key="environment_all" className="Checkbox-wrapper" style={{ paddingLeft: 20 }}>
              <ToggleSwitch
                onClick={() => {
                  setAllEnvironmentsChecked((p) => {
                    setExtensionConfig((config) => {
                      return {
                        ...config,
                        environments: config.environments.map((environment) => {
                          return { ...environment, checked: !p };
                        }),
                      };
                    });
                    return !p;
                  });
                }}
                label={"Select All"}
                checked={allEnvironmentsChecked || extensionConfig.environments?.every((l: any) => l.checked)}
                disabled={operationInProgress !== OPERATIONS.NONE}
              />
            </div>
            {extensionConfig.environments &&
              extensionConfig.environments.length > 0 &&
              extensionConfig.environments.map((env: IEnvironmentConfig) => {
                return (
                  <div key={env.name} className="Checkbox-wrapper" style={{ paddingLeft: 20 }}>
                    <Checkbox
                      onClick={() => {
                        setExtensionConfig((c: IAdvancedPublishingConfig) => {
                          const index = c.environments.findIndex((e: IEnvironmentConfig) => e.name === env.name);
                          const result = [
                            ...c.environments.slice(0, index),
                            { ...c.environments[index], checked: !c.environments[index].checked },
                            ...c.environments.slice(index + 1),
                          ];
                          setAllEnvironmentsChecked(result.every((l: any) => l.checked));
                          return { ...c, environments: result };
                        });
                      }}
                      label={env.name}
                      checked={env.checked}
                      disabled={operationInProgress !== OPERATIONS.NONE}
                      isButton={false}
                      isLabelFullWidth={false}
                    />
                  </div>
                );
              })}
          </div>
          <InstructionText>The selected references will be published to these environments.</InstructionText>
        </Field>
      </Accordion>
      <Accordion title={"Releases"}>
        <Field>
          <div className="Checkbox-wrapper" style={{ paddingLeft: 20 }}>
            <Checkbox
              onClick={() => {
                setExtensionConfig((c: IAdvancedPublishingConfig) => {
                  return { ...c, splitByLocale: !c.splitByLocale };
                });
              }}
              label={"Create one release per locale"}
              checked={extensionConfig.splitByLocale}
              disabled={operationInProgress !== OPERATIONS.NONE && operationInProgress !== OPERATIONS.CREATE_RELEASE}
              isButton={false}
              isLabelFullWidth={false}
            />
          </div>
          <InstructionText>The selected references will be added to separate locale releases.</InstructionText>
        </Field>
      </Accordion>
    </>
  );
}
export default Options;
