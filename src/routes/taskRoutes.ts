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
taskRouter.delete("/delete/:id", TaskController.deleteTask,
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

taskRouter.get("/getSharedTasksByUserId/:userId", TaskController.getSharedTasksByUserId,)




export default taskRouter;