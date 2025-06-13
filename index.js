import dotenv from "dotenv";
import https from "https";
import http from "http";
import fs from "fs";

import { app } from "./src/app.js";
import { connectDb } from "./src/config/db.config.js";
import { createAdmin } from "./src/utils/createAdmin.util.js";
import { NotFoundException } from "./src/errors/index.js";

// ============================================
// 1. Dotenv configuration
// ============================================
dotenv.config();

// ============================================
// 2. Server Setup
// ============================================
let server;
if (
  process.env.NODE_ENV === "PRODUCTION" &&
  process.env.IS_SSL_ENABLED === "YES"
) {
  try {
    const PRIVEKEY = process.env?.PRIVKEY_PEM;
    const FULLCHAIN = process.env?.FULLCHAIN_PEM;

    if (!(PRIVEKEY && FULLCHAIN)) {
      throw new NotFoundException(
        "Please set Privkey and Fullchain keys location in dotenv file."
      );
    }

    const privateKey = fs.readFileSync(PRIVEKEY, "utf8");
    const certificate = fs.readFileSync(FULLCHAIN, "utf8");

    const options = {
      key: privateKey,
      cert: certificate,
    };

    server = https.createServer(options, app);
  } catch (err) {
    console.error("Error while reading pem files:", err);
  }
} else {
  server = http.createServer(app);
}

// ============================================
// 3. Server Listening & DB Connection
// ============================================
const PORT = process.env.PORT || 8585;
(async () => {
  try {
    await connectDb();
    server.listen(PORT, () => {
      if (process.env.NODE_ENV === "PRODUCTION") {
        console.log(`Server is running on port ${PORT}`);
      } else {
        console.info(`==> 🌎 Go to http://localhost:${PORT}`);
      }
    });
    createAdmin();
  } catch (error) {
    console.error("An error occurred while running server", error);
  }
})();
