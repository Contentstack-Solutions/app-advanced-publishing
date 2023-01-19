import { OAuthService } from "@service/oauth-service";
import express from "express";
import { Inject } from "typescript-ioc";

export class OAuthController {
  private oauthService: OAuthService;

  constructor(@Inject oauthService: OAuthService) {
    this.oauthService = oauthService;
  }

  public async exchange(req: express.Request, res: express.Response): Promise<void> {
    this.oauthService.exchange(req, res);
  }
}
