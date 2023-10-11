import { Router } from "express";
import { TaskController } from "../controllers";

const taskRouter = Router();

taskRouter.post("/create", TaskController.createTask);
taskRouter.get("/getExpiredTasks/:id/:date", TaskController.getExpiredTasks);
taskRouter.get("/getTimeSpentbyMonth/:id/:month", TaskController.getTimeSpentByMonth);
taskRouter.get("/getTimeSpentMonthly/:id/:year", TaskController.getTimeSpentMonthly);
taskRouter.put("/update/:id", TaskController.updateTask);
taskRouter.put("/updateTime/:id", TaskController.updatetaskTimeSpent);
taskRouter.delete("/delete/:id", TaskController.deleteTask);

taskRouter.post("/completeTask/:id", TaskController.completeTask);

taskRouter.get("/getById/:id", TaskController.getTaskById);
taskRouter.get("/all", TaskController.getAllTasksIncludeLog);
taskRouter.get("/getAllNonCyclicTasks", TaskController.getAllTasks);
taskRouter.get("/getNonCyclicTaskByUserId/:userId", TaskController.getNonCyclicTasksByUserId);
taskRouter.get("/getByUserId/:userId", TaskController.getTasksByUserId);

export default taskRouter;