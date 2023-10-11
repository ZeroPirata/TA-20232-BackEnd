import { Request, Response } from "express";
import TaskService from "../services/taskService";
import { Task } from "../models";
import userService from "../services/userService";
import { TaskUpdateDto } from "../dtos/tasks/taskUpdateDto";
import { taskRepository } from "../repositories/TaskRepository";
import { tasktimeUpdateDto } from "../dtos/tasks/tasktimeUpdateDto";
import taskService from "../services/taskService";
import logService from "../services/logService";

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
      const userId = parseInt(req.params.userId, 10);
      const tasks = await TaskService.getTasksByUserId(userId);

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

  public async getExpiredTasks(req: Request, res: Response) {
    const { id, date } = req.params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({message:"parameter 'id' is not a valid number"})
    }

    try {
      const tasks = await TaskService.getExpiredTasks(userId, date);
      
      if (!Array.isArray(tasks) || tasks.length === 0) {
        return res.status(404).json({ error: "No tasks found for this user" });
      }
      res.status(200).json({ message: "Expired tasks found for user", data: tasks });

    }catch(error: any){
      if (error.message === "User not found") {
        res.status(404).json({ error: "User not found" });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
    
  }

  public async getTimeSpentByMonth(req: Request, res: Response) {
    const { id, month } = req.params;
    const userId = parseInt(id, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({message:"parameter 'id' is not a valid number"})
    }

    try {
      const timeSpent = await TaskService.getTimeSpentByMonth(userId, parseInt(month));
      res.status(200).json({ message: "Time spent found for user", data: timeSpent });
    } catch (error: any) {
      if (error.message === "User not found") {
        res.status(404).json({ error: "User not found" });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }

    
  public async updateTask(req: Request, res: Response) {

    const { id } = req.params;
    const userId = parseInt(id, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({message:"parameter 'id' is not a valid number"})
    }

    try {
      let taskUpdate : TaskUpdateDto = req.body;
      let task = taskRepository.create(taskUpdate);
      task.id = parseInt(id, 10);

      await taskRepository.save(task);
      return res.status(200).json({ message: "Task updated successfully", data: task });
  }

    catch (error: any) {
      if (error.message === "Task not found") {
        res.status(404).json({ error: "Task not found" });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
}

public async updatetaskTimeSpent(req: Request, res: Response) {
  
  const { id } = req.params;
  const userId = parseInt(id, 10);
  
  if (isNaN(userId)) {
    return res.status(400).json({message:"parameter 'id' is not a valid number"})
  }

  try {
    let taskUpdate : tasktimeUpdateDto = req.body;
    let task = taskRepository.create(taskUpdate);
    task.id = parseInt(id, 10);

    await taskRepository.save(task);
    return res.status(200).json({ message: "Task updated successfully", data: task });
}

  catch (error: any) {
    if (error.message === "Task not found") {
      res.status(404).json({ error: "Task not found" });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

public async completeTask(req: Request, res: Response) {
  try {
    const id: string = req.params.id; // Receive the ID as a string
    const isLogId: boolean = id.toUpperCase().includes('TASK'); // Check if the string contains "TASK"
    let log;
    let task : any;
    let result;

    if(isLogId === false){
      const taskId: number = parseInt(id, 10); // Convert the ID to a number
      task = await TaskService.getTaskById(taskId);

      if(!task){
        throw new Error("Task not found");
      }

      if(taskService.isTaskCyclic(task)){
        log = await logService.taskToLog(task, true);

        result = await logService.createLogFromTask(true, log)
      }else{
        result = await taskService.completeNormalTask(task);
      }

    }else{
      log = await logService.findLogByGetterId(id);

      if(log.name == null){
        throw new Error("Task not found");
      }

      result = await logService.createLogFromTask(true, log);
    }

    return res.status(200).json({ message: "Task completed successfully" });
  } catch (error:any) {
    return res.status(500).json({ message: error.message });
  }
}

  public async deleteTask(req: Request, res: Response) {

    const { id } = req.params;
    const userId = parseInt(id, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "O parâmetro 'id' não é um número válido" });
    }

    try {
      const taskId: number = parseInt(req.params.id, 10);
      const task = await TaskService.deleteTask(taskId);
      res.status(200).json({ message: "Task deleted successfully", data: task });
    } catch (error: any) {
      if (error.message === "Task not found") {
        res.status(404).json({ error: "Task not found" });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }
}

export default new TaskController();
