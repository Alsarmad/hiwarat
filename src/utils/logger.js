import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";

const logsDir = path.resolve(config.paths.logs);
const errorLogPath = path.resolve(logsDir, "error.log");
const infoLogPath = path.resolve(logsDir, "info.log");

// Function to initialize log files
const initializeLogs = async () => {
  try {
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logsDir)) {
      await fs.promises.mkdir(logsDir, { recursive: true });
    }

    // Create info log file if it doesn't exist
    if (!fs.existsSync(infoLogPath)) {
      await fs.promises.writeFile(infoLogPath, "");
    }

    // Create error log file if it doesn't exist
    if (!fs.existsSync(errorLogPath)) {
      await fs.promises.writeFile(errorLogPath, "");
    }
  } catch (error) {
    console.error("Error initializing log files:", error);
  }
};

// Initialize logger
await initializeLogs();

// Log error message
export const logError = (message, error = null) => {
  let logMessage = `[ERROR] ${new Date().toISOString()} - ${message}\n`;
  if (error) {
    logMessage += `Error Details: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}\n`;
  }
  console.log(logMessage);
  fs.appendFileSync(errorLogPath, logMessage);
};

// Log info message
export const logInfo = (message) => {
  const logMessage = `[INFO] ${new Date().toISOString()} - ${message}\n`;
  fs.appendFileSync(infoLogPath, logMessage);
};