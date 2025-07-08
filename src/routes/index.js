import { Router } from "express";
import { authRouter } from "./auth.route.js";
import { adminRouter } from "./admin.route.js";
import { categoryRouter } from "./category.route.js";
import { loginAuth, adminAuth } from "../middlewares/index.js";
import { productRouter } from "./product.route.js";

const router = Router();

// ╔═══════════════════════╗
// ║      User Routes      ║
// ╚═══════════════════════╝
router.use("/user", authRouter);

// ╔════════════════════════╗
// ║      Admin Routes      ║
// ╚════════════════════════╝
router.use("/admin", loginAuth, adminAuth, adminRouter);

// ╔═══════════════════════════╗
// ║      Category Routes      ║
// ╚═══════════════════════════╝
router.use("/category", categoryRouter);

// ╔═══════════════════╗
// ║      Product      ║
// ╚═══════════════════╝
router.use("/product", productRouter);

export { router };
