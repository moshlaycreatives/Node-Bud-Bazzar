// ╔══════════════════════════╗
// ║      Express Router      ║
// ╚══════════════════════════╝
import { Router } from "express";
const orderRouter = Router();

// ╔═══════════════════════╗
// ║      Middlewares      ║
// ╚═══════════════════════╝
import {
  trimBodyObject,
  requiredFields,
  loginAuth,
  adminAuth,
  sellerAuth,
} from "../middlewares/index.js";

// ╔═══════════════════════╗
// ║      Controllers      ║
// ╚═══════════════════════╝
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrderByCustomId,
  getOrdersByCustomer,
  getOrdersBySeller,
  updateOrder,
  deleteOrder,
  getOrderStatistics,
} from "../controllers/order.controller.js";

// ╔═══════════════════════════════════════════════════╗
// ║      Create + Get All Orders (Without Signin)     ║
// ╚═══════════════════════════════════════════════════╝
orderRouter
  .route("/")
  .post(
    loginAuth,
    trimBodyObject,
    requiredFields(["customerId", "order", "whitneyBlockId", "paymentMethod"]),
    createOrder
  )
  .get(getAllOrders);

// ╔════════════════════════════════╗
// ║      Get Order By ID           ║
// ╚════════════════════════════════╝
orderRouter.route("/:id").get(getOrderById);

// ╔════════════════════════════════╗
// ║      Get Order By Custom ID    ║
// ╚════════════════════════════════╝
orderRouter.route("/custom/:orderCustomId").get(getOrderByCustomId);

// ╔════════════════════════════════╗
// ║      Get Orders By Customer    ║
// ╚════════════════════════════════╝
orderRouter.route("/customer/:customerId").get(getOrdersByCustomer);

// ╔════════════════════════════════╗
// ║      Get Orders By Seller      ║
// ╚════════════════════════════════╝
orderRouter.route("/seller/:sellerId").get(getOrdersBySeller);

// ╔════════════════════════════════╗
// ║      Update Order              ║
// ╚════════════════════════════════╝
orderRouter.route("/:id").patch(loginAuth, trimBodyObject, updateOrder);

// ╔════════════════════════════════╗
// ║      Delete Order              ║
// ╚════════════════════════════════╝
orderRouter.route("/:id").delete(loginAuth, adminAuth, deleteOrder);

// ╔════════════════════════════════╗
// ║      Get Order Statistics      ║
// ╚════════════════════════════════╝
orderRouter.route("/statistics").get(loginAuth, adminAuth, getOrderStatistics);

export { orderRouter };
