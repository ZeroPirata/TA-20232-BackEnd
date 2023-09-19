import { Router } from "express";
import { SubtaskController } from "../controllers";
const subtaskRouter = Router();

subtaskRouter.post("/create", SubtaskController.createSubtask);



export default subtaskRouter;