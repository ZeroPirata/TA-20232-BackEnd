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

public async getAllTasks(req: Request, res: Response) {
    try {
      const allTasks = await TaskService.getAllTasks();
      res.status(200).json({ message: "All tasks", data: allTasks });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  public async getTaskById(req: Request, res: Response) {
    try {
      const taskId: number = parseInt(req.params.id, 10);
      const task = await TaskService.getTaskById(taskId);
      res.status(200).json({ message: "Task found", data: task });
    } catch (error: any) { // Indicar 'any' para que o TypeScript permita acessar 'message'
      if (error.message === "Task not found") {
        res.status(404).json({ error: "Task not found" });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }

}

export default new TaskController();
