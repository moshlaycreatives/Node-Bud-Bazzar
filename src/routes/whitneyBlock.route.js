// ╔══════════════════════════╗
// ║      Express Router      ║
// ╚══════════════════════════╝
import { Router } from "express";
const whitneyBlockRouter = Router();

// ╔═══════════════════════╗
// ║      Middlewares      ║
// ╚═══════════════════════╝
import {
  trimBodyObject,
  requiredFields,
  loginAuth,
} from "../middlewares/index.js";

// ╔═══════════════════════╗
// ║      Controllers      ║
// ╚═══════════════════════╝
import {
  createWhitneyBlock,
  getAllWhitneyBlocks,
  getWhitneyBlockById,
} from "../controllers/whitneyBlock.controller.js";

// ╔══════════════════════════════════════════════════╗
// ║      Create + Get All WhitneyBlocks              ║
// ╚══════════════════════════════════════════════════╝
whitneyBlockRouter
  .route("/")
  .post(
    loginAuth,
    trimBodyObject,
    requiredFields([
      "firstName",
      "lastName",
      "address",
      "strAptBid",
      "city",
      "state",
      "zipCode",
      "phoneNo",
    ]),
    createWhitneyBlock
  )
  .get(getAllWhitneyBlocks);

// ╔════════════════════════════════╗
// ║      Get WhitneyBlock By ID    ║
// ╚════════════════════════════════╝
whitneyBlockRouter.route("/:id").get(getWhitneyBlockById);

export { whitneyBlockRouter };
