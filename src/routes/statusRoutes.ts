import { Router } from "express";
import { statusController } from "../controllers";

const statusRouter = Router();

statusRouter.get("/status", statusController.getStatus);
statusRouter.get("/timeUpdate", statusController.timeUpdate);

export default statusRouter;
