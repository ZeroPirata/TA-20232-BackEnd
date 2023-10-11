import { Router } from "express";
import { TaskController } from "../controllers";

const taskRouter = Router();

taskRouter.post("/create", TaskController.createTask);
taskRouter.get("/all", TaskController.getAllTasks);
taskRouter.get("/getById/:id", TaskController.getTaskById);
taskRouter.get("/getExpiredTasks/:id/:date", TaskController.getExpiredTasks);
taskRouter.get("/getByUserId/:userId", TaskController.getTasksByUserId);
taskRouter.get("/getTimeSpentbyMonth/:id/:month", TaskController.getTimeSpentByMonth);
taskRouter.get("/getTimeSpentMonthly/:id/:year", TaskController.getTimeSpentMonthly);
taskRouter.put("/update/:id", TaskController.updateTask);
taskRouter.put("/updateTime/:id", TaskController.updatetaskTimeSpent);
taskRouter.delete("/delete/:id", TaskController.deleteTask);
taskRouter.post("/completeTask/:id", TaskController.completeTask);
taskRouter.get("/getAllCyclicTasks", TaskController.getAllCyclicTasks);
taskRouter.get("/getTaskByIdLog/:id", TaskController.getTaskByIdLog);

export default taskRouter;