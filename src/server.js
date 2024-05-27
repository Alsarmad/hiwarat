import "dotenv/config";

import express from "express";
const app = express();

import { config } from "./config.js";
import { logError, logInfo } from "./utils/logger.js";
import path from 'node:path';

// المتغيرات العامة 
import variablesMiddleware from "./utils/middleware/variablesMiddleware.js";
app.use(variablesMiddleware(config));

// الترجمات
import translationManager from "./utils/translationManager.js";
import translationMiddleware from "./utils/middleware/translationMiddleware.js";
app.use(translationMiddleware(translationManager, config.defaultLang));

import helmet from "helmet";
app.use(helmet(config.helmet));

import cors from "cors";
// تمكين CORS لجميع الطلبات
app.use(cors());

import compression from "compression";
app.use(compression(config.compression));

app.use(express.static(config.paths.public, {
  maxAge: 31536000
}));

import favicon from "serve-favicon";
app.use(favicon(config.paths.favicon));

app.set("view engine", "pug");
app.set("views", config.paths.views);

import bodyParser from 'body-parser';
app.use(bodyParser.urlencoded({
  extended: config.bodyParser.extended
}));
app.use(bodyParser.json({
  limit: config.bodyParser.limit
}));

import cookieParser from 'cookie-parser';
app.use(cookieParser());

app.disable('x-powered-by');

// يقوم هذا الملف بإنشاء قواعد البيانات المختلفة وجداولها.
import './database/databaseInitializer.js';

// قواعد البيانات
import DatabaseManager from './database/DatabaseManager.js';
const DBdir = config.paths.database;
const usersDBPath = path.join(DBdir, 'users.db');
const postsDBPath = path.join(DBdir, 'posts.db');
const reportsDBPath = path.join(DBdir, 'reports.db');
const usersDBManager = new DatabaseManager(usersDBPath);
const postsDBManager = new DatabaseManager(postsDBPath);
const reportsDBManager = new DatabaseManager(reportsDBPath);
usersDBManager.openDatabase();
postsDBManager.openDatabase();
reportsDBManager.openDatabase();
const DBManager = {
  usersDBManager,
  postsDBManager,
  reportsDBManager
}

// الجلسات 
import SessionManager from './utils/sessionManager.js';
import authenticateSession from './utils/middleware/authenticateSession.js';
const sessionManager = new SessionManager(usersDBManager);
app.use(authenticateSession(sessionManager));

// DASHBOARD PAGE
app.get('/dashboard', (req, res) => {
  const session = req.session;

  if (session) {
    res.status(200).json({
      message: 'Welcome to your dashboard',
      userId: session.userId
    });
  } else {
    res.status(401).json({
      message: 'Unauthorized: Please log in to access this resource.'
    });
  }
});


/* API VERSION 1.0 ROUTES */
import APIv1Router from "./routes/api_v1.js";
app.use("/api/v1", APIv1Router(DBManager, translationManager));

/* FORUM (Hiwarat) ROUTES */
import forum from "./routes/forum.js";
app.use("/", forum(DBManager, translationManager, sessionManager));

/* INTERNAL SERVER ERROR */
app.use((err, req, res, next) => {
  res.status(500).json({
    err
  });
});

/* NOT FOUND */
app.use((req, res) => {
  res.status(404).json({
    message: "not found"
  });
});

const port = config.port || 3000;
const server = app.listen(port, () => {
  const megServer = `[Hiwarat] Server started on port http://localhost:${port}`
  console.log(megServer);
  logInfo(megServer);
});

// تشغيل التحقق من الجلسات المنتهية وحذفها كل 24 ساعة
setInterval(() => {
  try {
    sessionManager.cleanupExpiredSessions();
  } catch (error) {
    logError("[Hiwarat] Error: ", error);
  }
}, 24 * 60 * 60 * 1000); // 24 ساعة

function sigHandle(signal) {
  logInfo(`${signal} signal received.`);
  server.close((err) => {
    if (err) {
      logError("[Hiwarat] Error closing server:", err);
    } else {
      logInfo("[Hiwarat] Server closed.");
      process.exit(0); // Explicitly exit the process after the server is closed
    }
  });
}

process.on("SIGINT", sigHandle);
process.on("SIGTERM", sigHandle);