import { Router } from "express";
import { SubtaskController } from "../controllers";
const subtaskRouter = Router();

subtaskRouter.post("/create", SubtaskController.createSubtask,
    // #swagger.tags = ['SubTask']
);
subtaskRouter.get("/getById/:subtaskId", SubtaskController.getSubtaskById,
    // #swagger.tags = ['SubTask']
);
subtaskRouter.get("/getAll", SubtaskController.getAllSubtasks,
    // #swagger.tags = ['SubTask']
);
subtaskRouter.get("/getByTask/:taskId", SubtaskController.getSubtasksByTask,
    // #swagger.tags = ['SubTask']
);
subtaskRouter.put("/update/:id", SubtaskController.updateSubtask,
    // #swagger.tags = ['SubTask']
);
subtaskRouter.delete("/delete/:id", SubtaskController.deleteSubtask,
    // #swagger.tags = ['SubTask']
);
export default subtaskRouter;