import "dotenv/config";

import express from "express";
const app = express();

import { config } from "./config.js";
import { logError, logInfo } from "./utils/logger.js";

import bodyParser from 'body-parser';
import path from 'node:path';
import favicon from "serve-favicon";
import helmet from "helmet";
import compression from "compression";



const port = config.port;

app.use(helmet(config.helmet));
app.use(compression(config.compression));

app.use(express.static(config.paths.public, { maxAge: 31536000 }));
app.use(favicon(config.paths.favicon));

app.set("view engine", "pug");
app.set("views", config.paths.views);

app.use(bodyParser.urlencoded({ extended: config.bodyParser.extended }));
app.use(bodyParser.json({ limit: config.bodyParser.limit }));
app.disable('x-powered-by');


// يقوم هذا الملف بإنشاء قواعد البيانات المختلفة وجداولها.
import './database/databaseInitializer.js';

app.get("/", (req, res) => {
  res.send("home page")
});

/* API VERSION 1.0 ROUTES */
import APIv1Router from "./routes/api_v1.js";
app.use("/api/v1", APIv1Router);

const server = app.listen(port, () => {
  console.log(`[SahraRally] Server started on port http://localhost:${port}`);
});

function sigHandle(signal) {
  logInfo(`${signal} signal received.`);
  server.close((err) => {
    if (err) {
      console.error("[SahraRally] Error closing server:", err);
    } else {
      console.log("[SahraRally] Server closed.");
      process.exit(0); // Explicitly exit the process after the server is closed
    }
  });
}

const password = "Asdf1234"
// const { hashedPassword } = await passwordHandler(password, 'hash');
// console.log("hashedPassword: ", hashedPassword);
// const { isMatch } = await passwordHandler({ hashedPassword: "$2b$10$ufPcCMVRnb3MDK/1pipoa.JbttCSbDhtCdYiUKT.DirgkZqNcicyK", plainPassword: password }, 'compare');
// console.log("isMatch: ", isMatch);
process.on("SIGINT", sigHandle);
process.on("SIGTERM", sigHandle);