import { Router } from "express";

import TaskController from "../controllers/TaskController";

const taskRouter = Router();

taskRouter.post("/create", TaskController.createTask);
taskRouter.get("/all", TaskController.getAllTasks);


export default taskRouter;