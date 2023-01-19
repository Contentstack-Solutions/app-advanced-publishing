import { Container } from "typescript-ioc";
import { OAuthController } from "./oauth-controller";
import express from "express";

const router = express.Router();

const oauthController = Container.get(OAuthController);

router.get(`/exchange`, (req, res) => {
  oauthController.exchange(req, res);
});

export { router as oauthRouter };
