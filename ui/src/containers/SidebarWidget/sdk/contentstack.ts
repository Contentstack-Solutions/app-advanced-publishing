import axios, { AxiosPromise, AxiosRequestConfig } from "axios";

import { IReference } from "../models/models";
import React from "react";

export interface IApiConfig {
  apiKey: string;
  token: string;
  endpoint: string;
}
export interface IEntryReleaseInfo {
  uid: string;
  version: number;
  locale: string;
  content_type_uid?: string;
  action: "publish" | "unpublish";
}
export interface SdkResult {
  axios: (query: string, options?: AxiosRequestConfig) => AxiosPromise;
  getReleases: (options?: AxiosRequestConfig) => AxiosPromise;
  getLocales: (options?: AxiosRequestConfig) => AxiosPromise;
  getEnvironments: (options?: AxiosRequestConfig) => AxiosPromise;
  getEntry: (
    contentTypeUid: string,
    entryUid: string,
    version: string,
    locale: string,
    options?: AxiosRequestConfig
  ) => Promise<IReference>;
  getAsset: (assetUid: string, version: string, locale: string, options?: AxiosRequestConfig) => Promise<IReference>;
  addEntriesToRelease: (
    release: string,
    entries: IEntryReleaseInfo[],
    branch: string,
    options?: AxiosRequestConfig
  ) => AxiosPromise;
  createRelease: (
    name: string,
    description: string,
    branch: string,
    locked: boolean,
    archived: boolean,
    options?: AxiosRequestConfig
  ) => AxiosPromise;
}

/**
 * Custom hook that exposes useful methods to interact with the Contentstack API
 * @param config
 * @returns
 */
export const useContentstackApi = (config: IApiConfig): SdkResult => {
  const getDefaultAxiosOptions = React.useCallback(
    (options: AxiosRequestConfig<any>): AxiosRequestConfig<any> => {
      if (config) {
        const o: AxiosRequestConfig<any> = {
          ...options,
          // headers: {
          //   authorization: config.token,
          //   api_key: config.apiKey,
          //   "Content-Type": "application/json",
          // },
          // withCredentials: true,
        };

        // if (options.headers) {
        //   o.headers = {
        //     ...o.headers,
        //     ...options.headers,
        //   };
        // }
        return o;
      }

      // console.log("Options", o);
      return {};
    },
    [config]
  );

  const getUrl = React.useCallback(
    (query: string): string => {
      let url = config.endpoint;

      if (config.endpoint && config.endpoint.endsWith("/") && query.startsWith("/")) {
        url = `${config.endpoint}${query.substring(1)}`;
      } else if (config.endpoint && config.endpoint.endsWith("/")) {
        url = `${config.endpoint}${query}`;
      } else {
        url = config.endpoint && config.endpoint.trim() === "" ? query : `${config.endpoint}/${query}`;
      }
      console.log("URL", url);
      return url;
    },
    [config]
  );

  return {
    axios: (query: string, options?: AxiosRequestConfig): AxiosPromise => {
      return axios(`${getUrl(query)}`, getDefaultAxiosOptions(options || {}));
    },
    getReleases: (options?: AxiosRequestConfig): AxiosPromise => {
      return axios(getUrl("v3/releases?include_count=true"), getDefaultAxiosOptions(options || {}));
    },
    addEntriesToRelease: (
      release: string,
      entries: IEntryReleaseInfo[],
      branch: string,
      options?: AxiosRequestConfig
    ): AxiosPromise => {
      // console.log("Data", { items: entries });
      const ops = getDefaultAxiosOptions({
        ...options,
        method: "POST",
        data: { items: entries },
      });
      return axios(getUrl(`/v3/releases/${release}/items?branch=${branch}`), ops);
    },
    createRelease: (
      name: string,
      description: string,
      branch: string,
      locked: boolean,
      archived: boolean,
      options?: AxiosRequestConfig
    ): AxiosPromise => {
      const ops = getDefaultAxiosOptions({
        ...options,
        method: "POST",
        data: {
          release: {
            name: name,
            description: description,
            locked: locked,
            archived: archived,
          },
        },
      });

      return axios(getUrl(`/v3/releases?branch=${branch}`), ops);
    },
    getLocales: (options?: AxiosRequestConfig<any>): AxiosPromise => {
      return axios(getUrl("/v3/locales"), getDefaultAxiosOptions(options || {}));
    },
    getEnvironments: (options?: AxiosRequestConfig<any>): AxiosPromise => {
      return axios(getUrl("/v3/environments"), getDefaultAxiosOptions(options || {}));
    },
    getEntry: async (
      contentTypeUid: string,
      entryUid: string,
      version: string,
      locale: string,
      options?: AxiosRequestConfig<any>
    ): Promise<IReference> => {
      const response = await axios(
        getUrl(
          `/v3/content_types/${contentTypeUid}/entries/${entryUid}?locale=${locale}${
            version && version.trim() !== "" ? `&version=${version}` : ""
          }`
        ),
        getDefaultAxiosOptions(options || {})
      );
      return {
        uniqueKey: `${response.data.entry.uid}_${locale}`,
        uid: response.data.entry.uid,
        isAsset: false,
        content_type_uid: contentTypeUid,
        entry: response.data.entry,
        references: [],
        locale: locale,
      };
    },
    getAsset: async (
      assetUid: string,
      version: string,
      locale: string,
      options?: AxiosRequestConfig<any>
    ): Promise<IReference> => {
      const response = await axios(
        getUrl(`/v3/assets/${assetUid}${version && version.trim() !== "" ? `?version=${version}` : ""}`),
        getDefaultAxiosOptions(options || {})
      );
      return {
        uniqueKey: `${response.data.entry.uid}_${locale}`,
        uid: response.data.entry.uid,
        isAsset: true,
        content_type_uid: "_asset",
        entry: response.data.entry,
        references: [],
        locale: "n/a",
      };
    },

    // setKey,
    // setToken,
    // setEndpoint,
  };
};
