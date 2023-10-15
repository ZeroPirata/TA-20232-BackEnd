import { Router } from "express";
import { statusController } from "../controllers";

const statusRouter = Router();

statusRouter.get("/status", statusController.getStatus,
    // #swagger.tags = ['Status']
);
// statusRouter.get("/timeUpdate/:id", statusController.timeUpdate);
statusRouter.get("/renewCyclicTasks/:id", statusController.renewCyclicTasks);

export default statusRouter;
