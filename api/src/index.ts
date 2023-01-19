import "module-alias/register";

import { csRouter, greeterRouter } from "@controllers/";

import cors from "cors";
import express from "express";
import { oauthRouter } from "./controllers/oauth";

// import * as fs from "fs";

// import https from "https";

require("dotenv").config();

const app = express();
const port = process.env.PORT; // default port to listen

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

app.use("/api", greeterRouter);
app.use("/cs", csRouter);
app.use("/oauth", oauthRouter);

// https
//   .createServer(
//     {
//       key: fs.readFileSync("./ssl/key.pem"),
//       cert: fs.readFileSync("./ssl/cert.pem"),
//     },
//     app
//   )
//   .listen(port, () => {
//     console.log(`Server started at https://localhost:${port}`);
//   });

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
