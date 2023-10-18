import { Request, Response } from "express";
import TaskService from "../services/taskService";
import { Task } from "../models";
import userService from "../services/userService";
import { TaskUpdateDto } from "../dtos/tasks/taskUpdateDto";
import { taskRepository } from "../repositories/TaskRepository";
import { tasktimeUpdateDto } from "../dtos/tasks/tasktimeUpdateDto";
import taskService from "../services/taskService";
import { parse } from "path";

class TaskController {
  public async createTask(req: Request, res: Response) {
    try {
      const taskData: Task = req.body; 
      const createdTask = await TaskService.createTask(taskData);
      
      

      if(createdTask && taskData.customInterval > 0 ){
        console.log("Criando tarefas futuras");
        await TaskService.createFutureTasks(createdTask as Task);
      }
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

public async getTasksByUserId(req: Request, res: Response) {
  try {
      const userId = parseInt(req.params.userId, 10);
      
      const cyclicTasks : Task[] = await TaskService.getTasksByUserId(userId);
      const tasks = cyclicTasks.filter(task => task.customInterval !== 0);

      if (!Array.isArray(tasks) || tasks.length === 0) {
          return res.status(404).json({ error: "No tasks found for this user" });
      }

      res.status(200).json({ message: "Cyclic tasks found for user", data: tasks });
  } catch (error: any) {
      if (error.message === "User not found") {
          res.status(404).json({ error: "User not found" });
      } else {
          res.status(500).json({ error: "Internal Server Error" });
      }
  }
}


public async getTaskById(req: Request, res: Response){
  try {
    const id: string = req.params.id; 
    let task;
    const taskId: number = parseInt(id, 10); 
    task = await TaskService.getTaskById(taskId);

      if (task === null) {
        res.status(400).json({ error: "Task not found" });
      } else {
        res.status(200).json({ message: "Task found", data: task });
      }
    
  } catch (error: any) { 
    if (error.message === "Task not found") {
      res.status(400).json({ error: "Task not found" });
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
      
      if (tasks.recorrente.length === 0 && tasks.naoRecorrente.length === 0) {
        return res.status(404).json({ error: "No tasks found for this user" });
      }
      tasks.recorrente = [... new Set(tasks.recorrente)]
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
  
  public async getTimeSpentMonthly(req: Request, res: Response) {
    const { id, year } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "O parâmetro 'id' não é um número válido" });
    }

    try {
      const timeSpent = await taskService.getTimeSpentMonthly(userId, parseInt(year));
      res.status(200).json({ message: "Tempo gasto encontrado para o usuário", data: timeSpent });
    } catch (error: any) {
      if (error.message === "User not found") {
        res.status(404).json({ error: "Usuário não encontrado" });
      } else {
        res.status(500).json({ error: "Erro interno do servidor" });
      }
    }
  }
  
  
  public async updateTask(req: Request, res: Response) {
    const { id } = req.params;
    const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
    try {
      let taskUpdate : TaskUpdateDto = req.body;

      if(isNaN(parseInt(id, 10))){
        if(!mongoIdRegex.test(id)){
          return res.status(400).json({ error: "Only today's task can be updated." });
        }else{
          return res.status(400).json({ error: "ID cannot be null." });
        }
      } else {

        let task = taskRepository.create(taskUpdate);
        task.id = parseInt(id, 10);
        await taskRepository.save(task);
        
        if(task.customInterval > 0){
          await TaskService.updateFutureTasks(task);
        }else{
          await TaskService.deleteAllFutureTasks(task.id as number);
        }
        return res.status(200).json({ message: "Task updated successfully", data: task });
      }
      
  }

    catch (error: any) {
      if (error.message === "Task not found") {
        res.status(404).json({ error: "Task not found" });
      } else {
        res.status(500).json({ error: "Internal Server Error", data: JSON.stringify(error)});
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

public async repeatTask(req: Request, res: Response) {
  try {
   let id = req.params.id;
  
   const taskId = parseInt(id, 10);
   if(!taskId){
      return res.status(400).json({ message: "parameter 'id' is not a valid number or not exists" });
   }

    await TaskService.cloneTask(taskId);
    await TaskService.deleteFutureTask(taskId);
    const refreshedTask = await TaskService.refreshTask(taskId);
    res.status(200).json({ message: "Task repeated successfully", data: refreshedTask });
    
  } catch (error:any) {
    return res.status(500).json({ message: error.message });
  }
}
  public async getAllNonCyclicTasks(req: Request, res: Response){
    try{
      let id = req.params.id
      const userId = parseInt(id, 10)
      if(!userId){
        return res.status(400).json({message: "parameter 'id' is not a valid number or not exists"})
      }
      const tasks = await TaskService.getAllNonCyclicTasks(userId);
      res.status(200).json({message: "Found Tasks", data: tasks})
    }catch(error: any){
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
