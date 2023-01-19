import {
  Accordion,
  Button,
  Field,
  FieldLabel,
  InfiniteScrollTable,
  InstructionText,
  Select,
  SkeletonTile,
  TextInput,
  Tooltip,
} from "@contentstack/venus-components";
import { IDictionary, IEnvironmentConfig, ILocaleConfig, IReference, OPERATIONS } from "../models/models";

import { IEntryReleaseInfo } from "../sdk/contentstack";
import LogDetails from "./log-details";
import React from "react";
import { useApp } from "../store/store";

function ReferencesTable() {
  const [viewBy, updateViewBy] = React.useState("Comfortable");
  const [selectedRelease, setSelectedRelease] = React.useState<any>();
  const [showExistingReleases, setShowExistingReleases] = React.useState(false);
  const [showReleaseForm, setShowReleaseForm] = React.useState(false);
  const [releases, setReleases] = React.useState([]);
  const [releaseName, setReleaseName] = React.useState("");
  const [releaseDescription, setReleaseDescription] = React.useState("");

  const getSelectedRow = (singleSelectedRowIds: any, selectedData: any) => {
    let selectedObj: any = {};
    singleSelectedRowIds.forEach((refUid: any) => {
      selectedObj[refUid] = true;
    });
    updateSelectedReferences({ ...selectedObj });
  };

  const {
    extensionConfig,
    dataStatus,
    filterData,
    operationInProgress,
    publishEntries,
    addToRelease,
    setOperationInProgress,
    setLog,
    showError,
    showSuccess,
    cmApi,
    updateSelectedReferences,
  } = useApp();

  const getColumns = React.useCallback((): any => {
    return [
      {
        Header: "Key",
        id: "uniqueKey",
        accessor: (data: any) => (
          <div className="title-container">
            <div className="content-title">{data.uniqueKey}</div>
          </div>
        ),
        columnWidthMultiplier: 2,
      },
      {
        Header: "Title",
        id: "title",
        accessor: (data: IReference) => {
          return (
            <div className="title-container">
              <div className="content-title">
                <strong>{data.entry?.title}</strong>
              </div>
              {viewBy === "Comfortable" && (
                <InstructionText>
                  {data.uid} <br />
                </InstructionText>
              )}
            </div>
          );
        },
        default: true,
        columnWidthMultiplier: 2,
      },
      {
        Header: "Locales",
        id: "uid",
        accessor: (data: any) => {
          const isLocalized = data.locales && data.locales.some((locale: any) => locale.localized);
          const tooltipContent = data.isAsset
            ? `n/a`
            : `${
                isLocalized
                  ? `Localized in: ${data.locales
                      .filter((l: any) => l.localized)
                      .map((l: any) => l.code)
                      .join(", ")}`
                  : `Not Localized`
              }`;

          return (
            <Tooltip content={tooltipContent} position="top" showArrow={false}>
              <div className="title-container">
                <div className="content-title">{data.locale || `n/a (asset)`}</div>
              </div>
            </Tooltip>
          );
        },
        columnWidthMultiplier: 1,
      },
    ];
  }, [viewBy]);
  return (
    <>
      <Accordion title={"References"} renderExpanded>
        <div style={{ paddingLeft: 5 }}>
          <InfiniteScrollTable
            initialSelectedRowIds={dataStatus.initiallySelected}
            disabled={operationInProgress !== OPERATIONS.NONE}
            canSearch
            totalCounts={dataStatus.data.length}
            data={dataStatus.data}
            isLoading={operationInProgress !== OPERATIONS.NONE}
            fetchTableData={filterData}
            loadMoreItems={() => {}}
            itemStatusMap={dataStatus.statuses}
            columns={getColumns()}
            uniqueKey={"uniqueKey"}
            hiddenColumns={["uniqueKey"]}
            isRowSelect
            getSelectedRow={getSelectedRow}
            // onRowSelectProp={[
            //   {
            //     label: "References",
            //   },
            // ]}
            getViewByValue={(selectedViewBy: any) => {
              updateViewBy(selectedViewBy);
            }}
            emptyHeading={"No references found"}
            viewSelector={true}
            columnSelector={false}
            tableHeight={400}
          />
        </div>
      </Accordion>
      <>
        <br />
        <div className="flex">
          <Button
            disabled={
              !(
                extensionConfig &&
                dataStatus.selectedReferences &&
                Object.keys(dataStatus.selectedReferences).length > 0
              ) ||
              (extensionConfig.environments?.filter((e: IEnvironmentConfig) => e.checked) || []).length === 0 ||
              (extensionConfig.locales?.filter((l: ILocaleConfig) => l.checked) || []).length === 0 ||
              (operationInProgress !== OPERATIONS.NONE && operationInProgress !== OPERATIONS.PUBLISHING)
            }
            onClick={() => {
              if (extensionConfig && dataStatus.selectedReferences && extensionConfig.locales) {
                publishEntries(Object.keys(dataStatus.selectedReferences));
              }
            }}
            isLoading={operationInProgress === OPERATIONS.PUBLISHING}
            icon={"PublishWhite"}
            buttonType="primary"
          >
            Publish
          </Button>
          &nbsp;
          <Button
            icon={"CreateWhite"}
            buttonType="primary"
            onClick={() => {
              setShowReleaseForm(true);
              setOperationInProgress(OPERATIONS.CREATE_RELEASE);
            }}
            disabled={
              !(
                extensionConfig &&
                dataStatus.selectedReferences &&
                Object.keys(dataStatus.selectedReferences).length > 0
              ) ||
              (extensionConfig.environments?.filter((e: IEnvironmentConfig) => e.checked) || []).length === 0 ||
              (extensionConfig.locales?.filter((l: ILocaleConfig) => l.checked) || []).length === 0 ||
              operationInProgress !== OPERATIONS.NONE
            }
          >
            Create Release
          </Button>
          &nbsp;
          <Button
            onClick={() => {
              setOperationInProgress(OPERATIONS.ADD_TO_RELEASE);
              cmApi
                .getReleases()
                .then((res: any) => {
                  if (res.data.releases && res.data.releases.length > 0) {
                    const rr = res.data.releases.map((release: any) => {
                      return { uid: release.uid, label: release.name };
                    });
                    setReleases(rr);
                    setSelectedRelease(rr[0].id);
                    setShowExistingReleases(true);
                  } else {
                    showError("No releases found");
                    setOperationInProgress(OPERATIONS.NONE);
                  }
                })
                .catch((err: any) => {
                  console.log(err);
                });
            }}
            icon={"PurpleAdd"}
            buttonType="secondary"
            disabled={
              showExistingReleases ||
              !(
                extensionConfig &&
                dataStatus.selectedReferences &&
                Object.keys(dataStatus.selectedReferences).length > 0
              ) ||
              (extensionConfig.environments?.filter((e: IEnvironmentConfig) => e.checked) || []).length === 0 ||
              (extensionConfig.locales?.filter((l: ILocaleConfig) => l.checked) || []).length === 0 ||
              operationInProgress !== OPERATIONS.NONE
            }
          >
            Add to Release
          </Button>
        </div>
        <br />
        <br />
        {showReleaseForm && (
          <>
            <Field>
              <FieldLabel required htmlFor="name">
                Name
              </FieldLabel>

              <TextInput
                placeholder={"Enter a name..."}
                error={undefined}
                value={releaseName}
                onChange={(e: any) => {
                  setReleaseName(e.target.value);
                }}
                type="text"
                name={"releaseName"}
                required={true}
              />

              <InstructionText>The selected references will be added to this release.</InstructionText>
            </Field>
            <Field>
              <FieldLabel required htmlFor="name">
                Description
              </FieldLabel>

              <TextInput
                placeholder={"Enter a description..."}
                error={undefined}
                value={releaseDescription}
                onChange={(e: any) => {
                  setReleaseDescription(e.target.value);
                }}
                type="text"
                name={"releaseDescription"}
                required={true}
              />

              <InstructionText>The selected references will be added to this release.</InstructionText>
            </Field>

            <div className="flex" style={{ marginTop: 10 }}>
              <Button
                disabled={
                  !(
                    dataStatus.selectedReferences &&
                    Object.keys(dataStatus.selectedReferences).length > 0 &&
                    releaseName.trim() !== "" &&
                    releaseDescription.trim() !== ""
                  )
                }
                buttonType="primary"
                loading={operationInProgress === OPERATIONS.CREATING_RELEASE}
                onClick={() => {
                  if (
                    extensionConfig.locales &&
                    extensionConfig.locales.filter((l: ILocaleConfig) => l.checked).length > 0 &&
                    dataStatus.selectedReferences &&
                    Object.keys(dataStatus.selectedReferences).length > 0 &&
                    releaseName.trim() !== "" &&
                    releaseDescription.trim() !== ""
                  ) {
                    const releases: IDictionary<IEntryReleaseInfo[]> = {};
                    setLog([]);
                    //Initialize releases
                    extensionConfig.locales
                      ?.filter((l: ILocaleConfig) => l.checked)
                      .forEach((locale: ILocaleConfig) => {
                        releases[locale.code] = [];
                      });

                    Object.keys(dataStatus.selectedReferences).forEach((key: string) => {
                      const ref = dataStatus.allEntries[key];
                      let releaseInfo: IEntryReleaseInfo = {
                        uid: ref.uid,
                        version: ref.entry._version,
                        locale: ref.locale,
                        action: "publish",
                        content_type_uid: ref.isAsset ? "built_io_upload" : ref.content_type_uid,
                      };
                      if (ref.isAsset) {
                        extensionConfig.locales?.forEach((locale: ILocaleConfig) => {
                          if (locale.checked) {
                            releases[locale.code].push({ ...releaseInfo, locale: locale.code });
                          }
                        });
                      } else {
                        releases[ref.locale].push(releaseInfo);
                      }
                    });

                    if (
                      extensionConfig.splitByLocale &&
                      extensionConfig.locales?.filter((l: ILocaleConfig) => l.checked).length > 1
                    ) {
                      const keys = Object.keys(releases);
                      keys.forEach((key: string) => {
                        const release: IEntryReleaseInfo[] = releases[key];
                        if (release.length > 0) {
                          const name = releaseName + " - " + key;
                          cmApi
                            .createRelease(name, releaseDescription, "main", false, false)
                            .then((result: any) => {
                              showSuccess(`Release ${name}, created.`);
                              extensionConfig.locales
                                ?.filter((l: ILocaleConfig) => l.checked)
                                .forEach((locale: ILocaleConfig) => {
                                  addToRelease(
                                    releases[key].filter((r: IEntryReleaseInfo) => r.locale === locale.code),
                                    result.data.release.uid,
                                    name
                                  );
                                });
                              setOperationInProgress(OPERATIONS.NONE);
                              setShowReleaseForm(false);
                            })
                            .catch((err: any) => {
                              console.log(err);
                              showError(`Error creating release ${releaseName}`);
                            });
                        }
                      });
                    } else {
                      const allItems = Object.values(releases).reduce((acc: any, val: any) => acc.concat(val), []);
                      cmApi
                        .createRelease(releaseName, releaseDescription, "main", false, false)
                        .then((result: any) => {
                          showSuccess(`Release ${releaseName}, created.`);
                          extensionConfig.locales
                            ?.filter((l: ILocaleConfig) => l.checked)
                            .forEach((locale: ILocaleConfig) => {
                              addToRelease(
                                allItems.filter((r: IEntryReleaseInfo) => r.locale === locale.code),
                                result.data.release.uid,
                                releaseName
                              );
                            });
                          setOperationInProgress(OPERATIONS.NONE);
                          setShowReleaseForm(false);
                        })
                        .catch((err: any) => {
                          console.log(err);
                          setLog((log) => [
                            ...log,
                            {
                              type: "error",
                              message: `Error creating release ${releaseName}`,
                            },
                          ]);
                        });
                    }
                  }
                }}
              >
                Create
              </Button>
              &nbsp;
              <Button
                onClick={() => {
                  setShowReleaseForm(false);
                  setOperationInProgress(OPERATIONS.NONE);
                }}
                buttonType="secondary"
                icon={"Cancel"}
              >
                Cancel
              </Button>
            </div>
          </>
        )}
        {showExistingReleases && (
          <>
            <Field>
              <FieldLabel required htmlFor="name">
                Releases
              </FieldLabel>
              <br />
              <br />

              <div className="Select-wrapper" style={{ paddingLeft: 20 }}>
                <Select
                  selectLabel={"Select a release"}
                  value={selectedRelease}
                  onChange={(data: any) => {
                    setSelectedRelease(data);
                  }}
                  isMulti={false}
                  options={releases}
                  placeholder={"No release selected"}
                  isClearable={true}
                  isSearchable={true}
                  isDisabled={
                    operationInProgress !== OPERATIONS.NONE && operationInProgress !== OPERATIONS.ADD_TO_RELEASE
                  }
                  hideSelectedOptions={true}
                  noOptionsMessage={() => "No release selected yet"}
                />
              </div>

              <InstructionText>The selected references will be added to this release.</InstructionText>
            </Field>

            <div className="flex" style={{ marginTop: 10 }}>
              <Button
                disabled={
                  !selectedRelease ||
                  !dataStatus.selectedReferences ||
                  Object.keys(dataStatus.selectedReferences).length === 0
                }
                icon={"PurpleAdd"}
                buttonType="primary"
                loading={operationInProgress === OPERATIONS.ADDING_TO_RELEASE}
                onClick={() => {
                  if (
                    dataStatus.selectedReferences &&
                    Object.keys(dataStatus.selectedReferences).length > 0 &&
                    selectedRelease
                  ) {
                    const references: IEntryReleaseInfo[] = [];

                    Object.keys(dataStatus.selectedReferences).forEach((key: string) => {
                      const ref = dataStatus.allEntries[key];
                      if (ref.isAsset) {
                        extensionConfig.locales
                          ?.filter((l: ILocaleConfig) => l.checked)
                          .forEach((locale: ILocaleConfig) => {
                            references.push({
                              uid: ref.uid,
                              version: ref.entry._version,
                              locale: locale.code,
                              action: "publish",
                              content_type_uid: "built_io_upload",
                            });
                          });
                      } else {
                        // console.log("Ref", ref);
                        let e: IEntryReleaseInfo = {
                          uid: ref.uid,
                          version: ref.entry._version,
                          locale: ref.locale,
                          action: "publish",
                          content_type_uid: ref.content_type_uid,
                        };
                        references.push(e);
                      }
                    });

                    //TODO: make one call per locale or individually, ideally per locale
                    extensionConfig.locales
                      ?.filter((l: ILocaleConfig) => l.checked)
                      .forEach((locale: ILocaleConfig) => {
                        addToRelease(
                          references.filter((r: IEntryReleaseInfo) => r.locale === locale.code),
                          selectedRelease.uid,
                          selectedRelease.label
                        );
                      });
                  }
                  setShowExistingReleases(false);
                }}
              >
                Add
              </Button>
              &nbsp;
              <Button
                onClick={() => {
                  setShowExistingReleases(false);
                  setOperationInProgress(OPERATIONS.NONE);
                }}
                buttonType="secondary"
                icon={"Cancel"}
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </>
      <LogDetails />
    </>
  );
}

export function ReferencesTableLoading() {
  return (
    <div>
      <div className="flex">
        <SkeletonTile
          numberOfTiles={6}
          testId="cs-skeleton-tile"
          tileBottomSpace={10}
          tileHeight={15}
          tileTopSpace={0}
          tileWidth={"100%"}
          tileleftSpace={5}
        />
      </div>
    </div>
  );
}

export default ReferencesTable;
