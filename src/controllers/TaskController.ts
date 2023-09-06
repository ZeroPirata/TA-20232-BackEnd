import { Request, Response } from "express";
import TaskService from "../services/taskService";
import { Task } from "../models";

class TaskController {
  public async createTask(req: Request, res: Response) {
    try {
      const taskData: Task = req.body; 
      const createdTask = await TaskService.createTask(taskData);
      res.status(201).json({ message: "Task created successfully", data: createdTask });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}



}

export default new TaskController();
