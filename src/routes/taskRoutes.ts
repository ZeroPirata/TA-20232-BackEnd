import { Router } from "express";
import { TaskController } from "../controllers";

const taskRouter = Router();

taskRouter.post("/create", TaskController.createTask,
    // #swagger.tags = ['Task']
);
taskRouter.get("/getExpiredTasks/:id/:date", TaskController.getExpiredTasks,
    // #swagger.tags = ['Task']
);
taskRouter.get("/getTimeSpentbyMonth/:id/:month", TaskController.getTimeSpentByMonth,
    // #swagger.tags = ['Task']
);
taskRouter.get("/getTimeSpentMonthly/:id/:year", TaskController.getTimeSpentMonthly,
    // #swagger.tags = ['Task']
);
taskRouter.put("/update/:id", TaskController.updateTask,
    // #swagger.tags = ['Task']
);
taskRouter.put("/updateTime/:id", TaskController.updatetaskTimeSpent,
    // #swagger.tags = ['Task']
);
taskRouter.delete("/delete/:id/:userId", TaskController.deleteTask,
    // #swagger.tags = ['Task']
);
taskRouter.get("/repeatTask/:id", TaskController.repeatTask,
    // #swagger.tags = ['Task']
);
taskRouter.get("/getNonCyclicTaskByUserId/:id", TaskController.getAllNonCyclicTasks,
    // #swagger.tags = ['Task']
);
taskRouter.get("/getById/:id", TaskController.getTaskById,
    // #swagger.tags = ['Task']
);
taskRouter.get("/all", TaskController.getAllTasks,
    // #swagger.tags = ['Task']
);
taskRouter.get("/getByUserId/:userId", TaskController.getTasksByUserId,
    // #swagger.tags = ['Task']
);
taskRouter.post("/UpdateHistorico/:idTask/:idUser", TaskController.UpdateHistorico,
    // #swagger.tags = ['Task']
);
taskRouter.get("/getAllSharedTasks/", TaskController.getAllSharedTasks,
);  // #swagger.tags = ['Task']);

taskRouter.post("/shareTask/:id", TaskController.shareTask,
); // #swagger.tags = ['Task']);

taskRouter.delete("/stopTaskSharing/:id", TaskController.stopTaskSharing,
); // #swagger.tags = ['Task']);

taskRouter.get("/getHistoricTask/:id", TaskController.getHistoricTaskById,
    // #swagger.tags = ['Task']
)
taskRouter.get("/getHistoricTaskByUser/:idUser", TaskController.getHistoricTaskByUser,
    // #swagger.tags = ['Task']
)
taskRouter.get("/getHisotricTaskByOwner/:idUser", TaskController.getHisotricTaskByOwner,
    // #swagger.tags = ['Task']
)
taskRouter.get("/getSharedTasksByUserId/:userId", TaskController.getSharedTasksByUserId,
    // #swagger.tags = ['Task']
)

export default taskRouter;