import express from "express";
import morgan from "morgan";
import cors from "cors";
import { errorHandler, routeNotFound } from "./middlewares/index.js";
import { router } from "./routes/index.js";

// ╔═════════════════════════════════════╗
// ║      Create "Express" Instance      ║
// ╚═════════════════════════════════════╝
const app = express();

// ╔═══════════════════════╗
// ║      Middlewares      ║
// ╚═══════════════════════╝
// const allowedOrigins = [
//   "http://localhost:5173",
//   "https://winco-ai-admin-panel.netlify.app",
// ];
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   credentials: true,
//   optionsSuccessStatus: 204,
// };
// app.use(cors(corsOptions));
app.use(cors("*"));
app.use(
  morgan("dev", {
    skip: function (req) {
      return req.url === "/favicon.ico";
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("public"));

// ╔═════════════════════════╗
// ║      Testing Route      ║
// ╚═════════════════════════╝
app.route("/").get((req, res) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  return res.send(
    "<h1 style='display: flex; justify-content: center;   align-items: center; font-size:9rem; margin-top:10rem;'>Server is running.</h1>"
  );
});

// ╔═════════════════════════════════════════════════════════════╗
// ║      Handle favicon.ico requests to prevent 404 errors      ║
// ╚═════════════════════════════════════════════════════════════╝
app.get("/favicon.ico", (req, res) => res.status(204).send());

// ╔══════════════════════╗
// ║      All Routes      ║
// ╚══════════════════════╝
app.use("/api", router);

// ╔══════════════════════════════════════╗
// ║      Error Handling Middlewares      ║
// ╚══════════════════════════════════════╝
app.use(routeNotFound);
app.use(errorHandler);
export { app };
