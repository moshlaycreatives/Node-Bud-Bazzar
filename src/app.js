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
app.use(cors("*"));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("public"));

// ╔═════════════════════════╗
// ║      Testing Route      ║
// ╚═════════════════════════╝
app.route("/").get((req, res) => {
  return res.send(
    "<h1 style='display: flex; justify-content: center;  align-items: center; font-size:9rem; margin-top:10rem;'>Server is running.</h1>"
  );
});

// ╔══════════════════════╗
// ║      All Routes      ║
// ╚══════════════════════╝
app.use("/api/v1", router);

// ╔══════════════════════════════════════╗
// ║      Error Handling Middlewares      ║
// ╚══════════════════════════════════════╝
app.use(routeNotFound);
app.use(errorHandler);
export { app };
