import { ContentstackService } from "@service/cs-service";
import express from "express";
import { Inject } from "typescript-ioc";

export class ContentstackController {
  private csService: ContentstackService;

  constructor(@Inject csService: ContentstackService) {
    this.csService = csService;
  }

  public async all(req: express.Request, res: express.Response): Promise<void> {
    this.csService.all(req, res);
  }
}
