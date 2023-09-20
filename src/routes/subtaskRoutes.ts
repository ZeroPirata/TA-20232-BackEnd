import { Router } from "express";
import { SubtaskController } from "../controllers";
const subtaskRouter = Router();

subtaskRouter.post("/create", SubtaskController.createSubtask);
subtaskRouter.get("/getByTask/:taskId", SubtaskController.getSubtasksByTask);



export default subtaskRouter;