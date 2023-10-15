import {Request, Response} from "express";
import * as http from "http";
import taskService from "../services/taskService";
import { Task } from "../models";

class StatusController {
  public async getStatus(req: Request, res: Response) {
    try {

      const isExpressListening = checkExpressListening();

      if (isExpressListening) {
        res.status(200).json({status: "OK"});
      } else {
        throw new Error("A conexão do Express está com problemas");
      }
    } catch (error) {
      res.status(500).json("Frontend não deve ser renderizado");
    }
  }

  public async renewCyclicTasks(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const cyclicTaks: Task[] = await taskService.getAllCyclicTasks(userId) as Task[];
      if( cyclicTaks.length === 0){
        return res.status(200).json({message: "No cyclic tasks found for this user"})
      }

      const tasksToRenew: Task[] = await taskService.checkTaskToRenew(cyclicTaks) as Task[];
      if(tasksToRenew.length === 0){
        return res.status(200).json({message: "No tasks to renew"})
      }
      
      let refreshedTask =  tasksToRenew.forEach(async (task) => {
        await taskService.cloneTask(task.id as number);
        await taskService.deleteFutureTask(task.id as number);
        return await taskService.refreshTask(task.id as number);
        
      });
      res.status(200).json({message: "Tasks renewed successfully", data: refreshedTask})

    } catch (error) {
      
    }


  }
}
  

export default new StatusController();

function checkExpressListening() {
  const expressPort = 5000;

  const options = {
    hostname: "localhost",
    port: expressPort,
  };

  const req = http.request(options, (res: http.IncomingMessage) => {
    if (res.statusCode === 200) {
      return true;
    } else {
      return false;
    }
  });

  req.on("error", (error) => {
    console.error(`Erro ao verificar o servidor Express: ${error.message}`);
  });

  req.end();

  return req;
}
