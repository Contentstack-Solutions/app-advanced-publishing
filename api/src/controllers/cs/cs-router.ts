import { Container } from "typescript-ioc";
import { ContentstackController } from "./cs-controller";
import express from "express";

const urlPath = "/api*";

const router = express.Router();

const csController = Container.get(ContentstackController);

router.all(urlPath, (req, res) => {
  csController.all(req, res);
});

export { router as csRouter };
