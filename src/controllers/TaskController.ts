import { Request, Response } from "express";
import TaskService from "../services/taskService";
import { Task } from "../models";
import userService from "../services/userService";

class TaskController {
  public async createTask(req: Request, res: Response) {
    try {
      const taskData: Task = req.body; 
      const createdTask = await TaskService.createTask(taskData);
      res.status(200).json({ message: "Task created successfully", data: createdTask });
    } catch (error) {
        res.status(400).json({  error: "Error creating task" });
    }
}

public async getAllTasks(req: Request, res: Response) {
    try {
      const allTasks = await TaskService.getAllTasks();
      res.status(200).json({ message: "All tasks", data: allTasks });
    } catch (error) {
      res.status(400).json({ error: "Tasks not found" });
    }
  }

  public async getTaskById(req: Request, res: Response) {
    try {
      const taskId: number = parseInt(req.params.id, 10);
      const task = await TaskService.getTaskById(taskId);
      res.status(200).json({ message: "Task found", data: task });
    } catch (error: any) { 
      if (error.message === "Task not found") {
        res.status(400).json({ error: "Task not found" });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }

  public async getTasksByUserId(req: Request, res: Response) {
    try {
      const userId: number = parseInt(req.params.userId, 10);
      const tasks = await TaskService.getTasksByUserId(userId);

      console.log(tasks);

      if (!Array.isArray(tasks) || tasks.length === 0) {
        return res.status(404).json({ error: "No tasks found for this user" });
      }

      res.status(200).json({ message: "Tasks found for user", data: tasks });
    } catch (error: any) {
      if (error.message === "User not found") {
        res.status(404).json({ error: "User not found" });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }

}

export default new TaskController();
