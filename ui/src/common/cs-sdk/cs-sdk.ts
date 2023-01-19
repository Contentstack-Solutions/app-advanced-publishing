import axios, { AxiosPromise, AxiosRequestConfig } from "axios";

import { OAuthToken } from "../oauth2";
import React from "react";

interface SdkResult {
  axios: (query: string, options?: AxiosRequestConfig) => AxiosPromise;
  getReleases: (options?: AxiosRequestConfig) => AxiosPromise;
  getLocales: (options?: AxiosRequestConfig) => AxiosPromise;
  getEnvironments: (options?: AxiosRequestConfig) => AxiosPromise;
  writeSomething: (options?: AxiosRequestConfig) => AxiosPromise;
}

/**
 * Custom hook that exposes useful methods to interact with the Contentstack API
 * @param config
 * @returns
 */
export const useOauthCsApi = (accessToken: string): SdkResult => {
  const endpoint = "https://api.contentstack.io";
  const getDefaultAxiosOptions = React.useCallback(
    (options: AxiosRequestConfig<any>): AxiosRequestConfig<any> => {
      if (accessToken && accessToken !== "") {
        const o: AxiosRequestConfig<any> = {
          ...options,
          headers: {
            authorization: `Bearer ${accessToken}`,
            organization_uid: "blt69be4afa58c24727",
          },
        };
        console.log("Options", o);
        return o;
      }

      console.log("Options", {});
      return {};
    },
    [accessToken]
  );

  const getUrl = (query: string): string => {
    let url = endpoint;

    // if (endpoint && endpoint.endsWith("/") && query.startsWith("/")) {
    //   url = `${endpoint}${query.substring(1)}`;
    // } else if (endpoint && endpoint.endsWith("/")) {
    //   url = `${endpoint}${query}`;
    // } else {
    //   url = endpoint && endpoint.trim() === "" ? query : `${endpoint}/${query}`;
    // }
    console.log("URL", `${url}${query}`);
    return `${url}${query}`;
  };

  return {
    axios: (query: string, options?: AxiosRequestConfig): AxiosPromise => {
      return axios(`${getUrl(query)}`, getDefaultAxiosOptions(options || {}));
    },
    getReleases: (options?: AxiosRequestConfig): AxiosPromise => {
      return axios(getUrl("/v3/releases?include_count=true"), getDefaultAxiosOptions(options || {}));
    },

    getLocales: (options?: AxiosRequestConfig<any>): AxiosPromise => {
      return axios(getUrl("/v3/locales"), getDefaultAxiosOptions(options || {}));
    },
    getEnvironments: (options?: AxiosRequestConfig<any>): AxiosPromise => {
      const url = getUrl("/v3/environments");
      console.log("URL 2", url);
      return axios(url, getDefaultAxiosOptions(options || {}));
    },
    writeSomething: (options?: AxiosRequestConfig<any>): AxiosPromise => {
      return axios(getUrl("/v3/entry"), getDefaultAxiosOptions(options || {}));
    },
  };
};
