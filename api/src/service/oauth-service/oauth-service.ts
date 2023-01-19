import axios from "axios";
import express from "express";
import qs from "qs";

require("dotenv").config();

export class OAuthService {
  public async exchange(req: express.Request, res: express.Response): Promise<void> {
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", process.env.CS_CLIENT_ID || "");
    params.append("client_secret", process.env.CS_CLIENT_SECRET || "");
    params.append("redirect_uri", process.env.CS_REDIRECT_URI || "");
    params.append("code", req.query.code as string);

    console.log("Params", params);
    axios
      .post("https://app.contentstack.com/apps-api/apps/token", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
      .then((response) => {
        res.send(response.data);
      })
      .catch((error) => {
        console.log("error", error.response.data);
        res.send(error.response.data);
      });
  }
}
