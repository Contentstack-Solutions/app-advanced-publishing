import { ASSET_REGEXP, MAX_DEPTH, REF_REGEXP, SAVED_MESSAGE, SAVE_MESSAGE } from "../models/constants";
import {
  IAdvancedPublishingConfig,
  IDataStatus,
  IDictionary,
  IEnvironmentConfig,
  ILocaleConfig,
  ILog,
  IProcessedItem,
  IPublishStatus,
  IReference,
  OPERATIONS,
  ReferenceTree,
} from "../models/models";
import { IEntryReleaseInfo, useContentstackApi } from "../sdk/contentstack";
import { showErrorWithDetails, showSuccessWithDetails } from "../../utils";

import { FetchDataArgProp } from "@contentstack/venus-components/build/components/Table/InfiniteScrollTable";
import React from "react";

const useGlobalApplicationContext = () => {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [trackerObserver, setTrackerObserver] = React.useState<number>(0);
  const [operationInProgress, setOperationInProgress] = React.useState<OPERATIONS>(OPERATIONS.LOADING_REFERENCES);
  const [error, setError] = React.useState<any>();
  const [references, setReferences] = React.useState<ReferenceTree>({});
  const [entry, setEntry] = React.useState<any>();
  const [dataStatus, setDataStatus] = React.useState<IDataStatus>({
    allEntries: {},
    data: [],
    statuses: {},
    initiallySelected: {},
    selectedReferences: {},
  });
  // const [initiallySelectedItems, setInitiallySelectedItems] = React.useState<any>({});
  const [canRefresh, setCanRefresh] = React.useState(false);
  const [showWarning, setShowWarning] = React.useState(false);
  const [showLog, setShowLog] = React.useState(false);
  const [warningMessage, setWarningMessage] = React.useState<string>(SAVE_MESSAGE);
  const [log, setLog] = React.useState<ILog[]>([]);
  // const [selectedReferences, updateSelectedReferences] = React.useState({});

  const [extensionConfig, setExtensionConfig] = React.useState<IAdvancedPublishingConfig>({
    endpoint: "",
    splitByLocale: true,
    locales: [],
    environments: [],
    maxReleaseItems: 1000,
    appSdkInitialized: false,
  });

  const cmApi = useContentstackApi(extensionConfig);

  const addLogError = React.useCallback((msg: string) => {
    setLog((log: ILog[]) => {
      return [...log, { type: "error", message: msg }];
    });
  }, []);

  const addLogInfo = React.useCallback((msg: string) => {
    setLog((log: ILog[]) => {
      return [...log, { type: "info", message: msg }];
    });
  }, []);

  const showSuccess = React.useCallback((msg: string, description?: string) => {
    setLog((log) => {
      showSuccessWithDetails(
        msg,
        () => {
          setShowLog(true);
        },
        description
      );
      return [
        ...log,
        {
          type: "info",
          message: msg,
        },
      ];
    });
  }, []);

  const showError = React.useCallback((msg: string) => {
    setLog((log) => {
      showErrorWithDetails(msg, () => {
        setShowLog(true);
      });
      return [
        ...log,
        {
          type: "info",
          message: msg,
        },
      ];
    });
  }, []);

  const tracker = React.useRef<IProcessedItem[]>([]);

  const processItem = React.useCallback((item: IReference): void => {
    let idx = -1;
    if (item.isAsset) {
      idx = tracker.current.findIndex((i) => i.id === item.uid);
    } else {
      idx = tracker.current.findIndex((i) => i.id === item.uid && i.locale === item.locale);
    }

    if (idx > -1) {
      tracker.current[idx].processed = true;
    }
  }, []);

  const pushItem = React.useCallback((item: IReference, processed: boolean = false): void => {
    let idx = -1;
    if (item.isAsset) {
      idx = tracker.current.findIndex((i) => i.id === item.uid);
    } else {
      idx = tracker.current.findIndex((i) => i.id === item.uid && i.locale === item.locale);
    }

    if (idx <= -1) {
      tracker.current.push({
        id: item.uid,
        locale: item.locale,
        processed: processed,
      });
    }
  }, []);

  const getEntry = React.useCallback(
    async (uid: string, content_type_uid: string, locale: string): Promise<IReference> => {
      const response = await extensionConfig.location?.SidebarWidget?.stack
        .ContentType(content_type_uid)
        .Entry(uid)
        .language(locale)
        .fetch();
      const languagesResponse = await extensionConfig.location?.SidebarWidget?.stack
        .ContentType(content_type_uid)
        .Entry(uid)
        .getLanguages();
      // console.log("Getting entry", uid, content_type_uid, locale, response.entry);
      return {
        uniqueKey: `${response.entry.uid}_${locale}`,
        uid: response.entry.uid,
        isAsset: false,
        content_type_uid: content_type_uid,
        entry: response.entry,
        references: [],
        locale: locale,
        locales: languagesResponse.locales,
      };
    },
    [extensionConfig]
  );

  const publishEntry = React.useCallback(
    async (uid: string): Promise<IPublishStatus> => {
      const entry = dataStatus.allEntries[uid];
      let response: any;
      let ll = extensionConfig.locales?.filter((l) => l.checked).map((l) => l.code);

      try {
        if (entry.isAsset) {
          response = await extensionConfig.location?.SidebarWidget?.stack.Asset(entry.uid).publish({
            asset: {
              locales: ll,
              environments: extensionConfig.environments
                ?.filter((e: IEnvironmentConfig) => e.checked)
                .map((c: IEnvironmentConfig) => c.name),
            },
          });
        } else {
          ll = [entry.locale];
          response = await extensionConfig.location?.SidebarWidget?.stack
            .ContentType(entry.content_type_uid)
            .Entry(entry.uid)
            .publish({
              entry: {
                locales: ll,
                environments: extensionConfig.environments
                  ?.filter((e: IEnvironmentConfig) => e.checked)
                  .map((c: IEnvironmentConfig) => c.name),
              },
            });
        }
        // showSuccess(`Published ${entry.isAsset ? "asset" : "entry"} ${entry.uid} in ${ll?.join(", ")}`);
        addLogInfo(`Published ${entry.isAsset ? "asset" : "entry"} ${entry.uid} in ${ll?.join(", ")}`);
        return {
          uid: entry.uid,
          content_type_uid: entry.isAsset ? "_asset" : entry.content_type_uid,
          status: {
            success: true,
            payload: response,
          },
        };
      } catch (e: any) {
        console.log("Error:", entry.uid, e);
        // showError(`Error publishing ${entry.isAsset ? "asset" : "entry"} ${entry.uid} in ${ll?.join(", ")}`);
        addLogError(`Error publishing ${entry.isAsset ? "asset" : "entry"} ${entry.uid} in ${ll?.join(", ")}`);
        return {
          uid: entry.uid,
          content_type_uid: entry.isAsset ? "_asset" : entry.content_type_uid,
          status: {
            success: false,
            payload: e,
          },
        };
      }
    },
    //Jaime: we might need to use extensionConfig
    [
      dataStatus.allEntries,
      extensionConfig.locales,
      extensionConfig.location?.SidebarWidget?.stack,
      extensionConfig.environments,
      addLogInfo,
      addLogError,
    ]
  );

  const publishEntries = React.useCallback(
    (keys: string[]) => {
      setOperationInProgress(OPERATIONS.PUBLISHING);

      const promises: any = [];
      setLog([]);
      keys.forEach((key: string) => {
        promises.push(publishEntry(key));
      });

      Promise.all(promises)
        .then((results: IPublishStatus[]) => {
          setOperationInProgress(OPERATIONS.NONE);
          // console.log("Publish results", results);
          showSuccessWithDetails(
            "Publishing Completed!",
            () => {
              setShowLog(true);
            },
            `${results.length} entries published to ${extensionConfig.environments
              .filter((e: IEnvironmentConfig) => e.checked)
              .map((c: IEnvironmentConfig) => c.name)
              .join(", ")}`
          );
        })
        .catch((error) => {
          console.log("Publishing Error:", error);
        });
    },
    [extensionConfig.environments, publishEntry]
  );

  const addToRelease = React.useCallback(
    (entries: IEntryReleaseInfo[], releaseUid: string, releaseName: string): void => {
      setOperationInProgress(OPERATIONS.ADD_TO_RELEASE);
      let allLocalesEntries: IEntryReleaseInfo[] = [];

      const promises: any = [];
      let counter: number = 0;

      entries.forEach((entry: IEntryReleaseInfo) => {
        allLocalesEntries.push(entry);
        counter++;
        if (counter % 25 === 0) {
          // console.log("Adding Entries", allLocalesEntries.length, allLocalesEntries);
          promises.push(cmApi.addEntriesToRelease(releaseUid, allLocalesEntries, "main"));
          allLocalesEntries = [];
        }
      });

      if (allLocalesEntries.length > 0) {
        promises.push(cmApi.addEntriesToRelease(releaseUid, allLocalesEntries, "main"));
        Promise.all(promises)
          .then((results) => {
            showSuccess(
              `Added ${allLocalesEntries.length} entries to release '${releaseName}'.`
              // `[${allLocalesEntries.map((e) => e.uid).join(", ")}] `
            );
            setOperationInProgress(OPERATIONS.NONE);
          })
          .catch((error) => {
            console.log("Error", error);
            showError(`Error adding entries to release ${releaseUid}`);
            setOperationInProgress(OPERATIONS.NONE);
          });
      }
    },
    [cmApi, showError, showSuccess]
  );

  const getAsset = React.useCallback(
    async (uid: string): Promise<IReference> => {
      const response = await extensionConfig.location?.SidebarWidget?.stack.Asset(uid).fetch();
      return {
        uniqueKey: `${response.asset.uid}`,
        uid: response.asset.uid,
        isAsset: true,
        content_type_uid: "_asset",
        entry: response.asset,
        locale: "",
        references: [],
      };
    },
    [extensionConfig]
  );

  const addEntry = React.useCallback((entry: IReference) => {
    setDataStatus((ds: IDataStatus) => {
      let all: IDictionary<IReference> = {};
      const key = `${entry.uid}${entry.isAsset ? `` : `_${entry.locale}`}`;
      if (ds.allEntries[key]) {
        return { ...ds };
      } else {
        all = {
          ...ds.allEntries,
          [key]: entry,
        };
      }

      return { ...ds, allEntries: all };
    });
  }, []);

  const getEntryPromises = React.useCallback(
    (entry: any, locale: string): Promise<any>[] => {
      const promises: Promise<any>[] = [];
      let refs: string[] = [];
      const sJson = JSON.stringify(entry, null, 2);

      const refMatches = sJson.matchAll(REF_REGEXP);
      for (const rMatch of refMatches) {
        const refUid = rMatch[1] as string;
        const refCtUid = rMatch[2] as string;
        if (!refs.includes(refUid)) {
          promises.push(getEntry(refUid, refCtUid, locale));
          refs.push(refUid);
        }
      }
      return promises;
    },
    [getEntry]
  );

  const getAssetPromises = React.useCallback(
    (entry: any): Promise<any>[] => {
      const promises: Promise<any>[] = [];
      let refs: string[] = [];
      const sJson = JSON.stringify(entry, null, 2);
      const assetMatches = sJson.matchAll(ASSET_REGEXP);
      for (const aMatch of assetMatches) {
        const refUid = aMatch[1] as string;
        if (!refs.includes(refUid)) {
          // promises.push(sdk.getAsset(refUid, ""));
          promises.push(getAsset(refUid));
          refs.push(refUid);
        }
      }

      return promises;
    },
    [getAsset]
  );

  /**
   * Get all references (recursively) for an entry.
   * Once the recursion for an entry is completed, the function calls: processItem and updates the trackerObserver,
   * so it can determine whether all items have been processed.
   *
   * By updating the trackerObserver, the useEffect with its dependency will be triggered again,
   * and the app will check whether the recursion is completed, so the data can be displayed.
   *
   */
  const loadReferences = React.useCallback(
    (reference: IReference, level: number): void => {
      if (level > MAX_DEPTH) {
        // console.log("Stopping recursion", level, reference.uid, tracker.current);
        processItem(reference);
        return;
      }

      let promises = [...getEntryPromises(reference.entry, reference.locale), ...getAssetPromises(reference.entry)];

      Promise.all(promises)
        .then((results) => {
          for (const ref of results) {
            // console.log("Adding Reference", ref.uid, ref.content_type_uid, ref);
            if (reference.references && !reference.references.includes(ref.uid)) {
              reference.references.push(ref.uid);
              addEntry(ref);
              if (tracker.current.some((t: any) => t.id === ref.uid && t.locale === ref.locale)) {
                continue;
              }

              if (ref.isAsset || level >= MAX_DEPTH) {
                pushItem(ref, true);
                // tracker.current.push({ id: ref.uid, processed: true, locale: ref.locale });
                continue;
              }

              pushItem(ref);
              loadReferences(ref, level + 1);
            }
          }
          addEntry(reference);

          setTrackerObserver((prev: number) => {
            processItem(reference);
            return prev + 1;
          });
        })
        .catch((error) => {
          console.log("Loading References Error", error);
        });
    },
    [addEntry, getAssetPromises, getEntryPromises, processItem, pushItem]
  );

  const clearDataStatus = React.useCallback((clearTracker: boolean = false) => {
    setDataStatus((ds: IDataStatus) => {
      if (clearTracker) {
        tracker.current = [];
      }
      return { allEntries: {}, data: [], statuses: {}, initiallySelected: {}, selectedReferences: {} };
    });
  }, []);

  const showData = React.useCallback(
    (data?: IReference[]) => {
      const d = data || Object.values(dataStatus.allEntries);
      const statusMap: any = {};
      const initiallySelectedMap: any = [];
      d.forEach((item: any, index: number) => {
        statusMap[index] = "loaded";
      });
      d.forEach((item: any, index: number) => {
        initiallySelectedMap[item.uniqueKey] = true;
      });
      setLoading(false);
      setTrackerObserver(0);
      setOperationInProgress(OPERATIONS.NONE);
      setDataStatus((ds) => {
        return { ...ds, data: d, statuses: statusMap, initiallySelected: initiallySelectedMap };
      });
    },
    [dataStatus.allEntries]
  );

  /**
   * This function loads recursively all the references based on the user selection.
   * The most important calls this function makes are:
   * 1. pushItem: This function adds the item to the tracker. For further processing.
   * 2. loadReferences: This function loads the references for the item that was just added to the tracker.
   *    Then recursively calls itself.
   *
   * See loadReferences for more details.
   */
  const load = React.useCallback(() => {
    if (extensionConfig.locales && extensionConfig.locales.some((l) => l.checked)) {
      setOperationInProgress(OPERATIONS.LOADING_REFERENCES);
      setLoading(true);
      clearDataStatus(true);
      extensionConfig.locales
        .filter((l) => l.checked)
        .forEach((locale: ILocaleConfig) => {
          extensionConfig.location?.SidebarWidget?.stack
            .ContentType(extensionConfig.contentTypeUid)
            .Entry(entry.uid)
            .language(locale.code)
            .fetch()
            .then((entryResponse: any) => {
              extensionConfig.location?.SidebarWidget?.stack
                .ContentType(extensionConfig.contentTypeUid)
                .Entry(entry.uid)
                .getLanguages()
                .then((response: any) => {
                  const localeTopRef: IReference = {
                    uniqueKey: `${entry.uid}_${locale.code}`,
                    uid: entry.uid,
                    isAsset: false,
                    content_type_uid: extensionConfig.contentTypeUid,
                    entry: entryResponse.entry,
                    references: [],
                    locales: response.locales,
                    locale: locale.code,
                  };
                  pushItem(localeTopRef);
                  loadReferences(localeTopRef, 1);
                })
                .catch((error: any) => {
                  showError("Error Getting Languages");
                  console.log("Error Getting Languages", error);
                });
            })
            .catch((error: any) => {
              showError("Error Getting Entry");
              console.log("Error Getting Entry", error);
            });
        });
    } else {
      // console.log("No locales selected");
      setTrackerObserver((to) => to + 1);
    }
  }, [clearDataStatus, entry, extensionConfig, loadReferences, pushItem, showError]);

  /**
   * This hook will be called when all the references are loaded.
   * The useEffect is reacting to the trackerObserver state change. See load() function above.
   */
  React.useEffect(() => {
    if (loading && tracker.current.length > 0 && tracker.current.every((c) => c.processed)) {
      showData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackerObserver]);

  React.useEffect(() => {
    if (entry) {
      // console.log("Loading References...", loading);
      load();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry, extensionConfig.locales]);

  React.useEffect(() => {
    // console.log("React.useEffect >> extensionConfig", extensionConfig);
    if (extensionConfig.appSdkInitialized) {
      // console.log(">>>> Configuration Loaded", extensionConfig);

      cmApi
        .getLocales()
        .then((localesResponse: any) => {
          setExtensionConfig((config: IAdvancedPublishingConfig) => {
            const locales = localesResponse.data.locales.map((l: any) => {
              return {
                code: l.code,
                name: l.name,
                isMaster: l.fallback_locale === null,
                checked: extensionConfig.locales.some((c: ILocaleConfig) => c.code === l.code && c.checked),
              };
            });
            console.log("Actual Locales", localesResponse.data.locales, "My Locales", locales);
            cmApi
              .getEnvironments()
              .then((environmentsResponse: any) => {
                setExtensionConfig((config: IAdvancedPublishingConfig) => {
                  const environments = environmentsResponse.data.environments.map((e: any) => {
                    return {
                      id: e.uid,
                      name: e.name,
                      checked: extensionConfig.environments.some(
                        (c: IEnvironmentConfig) => c.name === e.name && c.checked
                      ),
                    };
                  });
                  console.log("Actual Environments", environments);
                  // console.log("Widget", extensionConfig.location?.SidebarWidget);
                  // console.log("Entry", extensionConfig.location?.SidebarWidget?.entry?.getData());
                  // console.log("Entry UID", extensionConfig.entryUid);
                  // console.log("Content Type UID", extensionConfig.contentTypeUid);

                  extensionConfig.location?.SidebarWidget?.stack
                    .ContentType(extensionConfig.contentTypeUid)
                    .Entry(extensionConfig.entryUid)
                    .language(extensionConfig.location.SidebarWidget.entry.locale)
                    .fetch()
                    .then((response: any) => {
                      setEntry(() => {
                        // console.log("Setting Entry!", response);
                        return response.entry;
                      });
                    });
                  extensionConfig.location?.SidebarWidget?.entry.onChange((e: any, b: any) => {
                    setShowWarning(true);
                    setWarningMessage(SAVE_MESSAGE);
                    setCanRefresh(false);
                  });
                  extensionConfig.location?.SidebarWidget?.entry.onSave((e: any, b: any) => {
                    setShowWarning(true);
                    setWarningMessage(SAVED_MESSAGE);
                    setCanRefresh(true);
                  });

                  return { ...config, locales: locales, environments: environments };
                });
              })
              .catch((error: any) => {
                console.log("Error Getting Environments", error);
              });
            return { ...config, locales: locales };
          });
        })
        .catch((error: any) => {
          // showError("Error Getting Environments");
          console.log("Error Getting Locales", error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extensionConfig.appSdkInitialized]);

  return {
    dataStatus,
    setOperationInProgress,
    addToRelease,
    operationInProgress,
    warningMessage,
    setShowLog,
    showLog,
    log,
    setLog,
    setExtensionConfig,
    extensionConfig,
    publishEntries,
    entry,
    loading,
    error,
    showWarning,
    setShowWarning,
    setError,
    references,
    setReferences,
    canRefresh,
    showError,
    showSuccess,
    cmApi,
    clearDataStatus,
    resetData: showData,
    updateSelectedReferences: (refs: any) => {
      setDataStatus((ds) => {
        return { ...ds, selectedReferences: refs };
      });
    },
    filterData: (fetchTableDataArg: FetchDataArgProp): void => {
      setLoading(true);
      setOperationInProgress(OPERATIONS.LOADING_REFERENCES);
      let d: any = Object.values(dataStatus.allEntries);

      if (fetchTableDataArg.searchText && fetchTableDataArg.searchText.length > 0) {
        d = d.filter(
          (d: any) =>
            (d.entry && d.entry.title && d.entry.title.indexOf(fetchTableDataArg.searchText) > -1) ||
            (d.entry && d.entry.locale && d.entry.locale.indexOf(fetchTableDataArg.searchText) > -1)
        );
      }
      const statusMap: any = {};
      d.forEach((item: any, index: number) => {
        statusMap[index] = "loaded";
      });
      showData(d);
    },
    reload: (): void => {
      setCanRefresh(() => {
        window.location.reload();
        return false;
      });
    },
  };
};
export type UseAppContextType = ReturnType<typeof useGlobalApplicationContext>;

const ApplicationGlobalContext = React.createContext<UseAppContextType | null>(null);

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const value = useGlobalApplicationContext();
  return <ApplicationGlobalContext.Provider value={value}>{children}</ApplicationGlobalContext.Provider>;
};

export const useApp = () => React.useContext(ApplicationGlobalContext)!;
export default AppProvider;
