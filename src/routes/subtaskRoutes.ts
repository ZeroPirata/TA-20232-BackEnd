import { Router } from "express";
import { SubtaskController } from "../controllers";
const subtaskRouter = Router();

subtaskRouter.post("/create", SubtaskController.createSubtask);
subtaskRouter.get("/getById/:subtaskId", SubtaskController.getSubtaskById);
subtaskRouter.get("/getAll", SubtaskController.getAllSubtasks);
subtaskRouter.get("/getByTask/:taskId", SubtaskController.getSubtasksByTask);
subtaskRouter.put("/update/:id", SubtaskController.updateSubtask)
subtaskRouter.delete("/delete/:id", SubtaskController.deleteSubtask);
export default subtaskRouter;