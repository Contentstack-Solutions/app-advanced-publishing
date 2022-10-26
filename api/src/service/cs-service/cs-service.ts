import axios, { AxiosRequestConfig } from "axios";

import express from "express";

require("dotenv").config();

const getDefaultAxiosOptions = (options: AxiosRequestConfig<any>): AxiosRequestConfig<any> => {
  const o: AxiosRequestConfig<any> = {
    ...options,
    headers: {
      authorization: process.env.CS_CM_TOKEN,
      api_key: process.env.CS_API_KEY,
      ...options.headers,
      "Content-Type": "application/json",
    },
    withCredentials: true,
  };
  return o;
};

export class ContentstackService {
  public async all(req: express.Request, res: express.Response): Promise<void> {
    // const protocol = req.protocol;
    // const host = req.hostname;
    // const port = process.env.PORT || "";
    const url = req.originalUrl;
    const newUrl = `${process.env.CS_API_HOST}${url.replace("/cs/api", "")}`;
    // console.log("URL: ", newUrl);
    const options: AxiosRequestConfig<any> = getDefaultAxiosOptions({
      method: req.method,
      data: req.body,
      url: newUrl,
    });
    res.setHeader("Content-Type", "application/json");
    // console.log("options", options);
    axios(options)
      .then((response) => {
        res.send(response.data);
      })
      .catch((error) => {
        // console.log("error", error);
        res.status(500).send(
          JSON.stringify({
            error: "Error calling Contentstack's API",
            details: {
              url: newUrl,
              data: req.body,
              error: error.response.data,
            },
          })
        );
      });
  }
}
