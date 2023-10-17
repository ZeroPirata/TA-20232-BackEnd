import { Router } from "express";
import { statusController } from "../controllers";

const statusRouter = Router();

statusRouter.get("/status", statusController.getStatus);
statusRouter.get("/renewCyclicTasks/:id", statusController.renewCyclicTasks);

export default statusRouter;
