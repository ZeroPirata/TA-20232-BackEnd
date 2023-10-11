import { Repository } from "typeorm";
import { DataBaseSource } from "../config/database";
import { Task } from "../models";
import logService from "./logService";

class TaskService {
    private taskRepository: Repository<Task>;

    constructor() {
        this.taskRepository = DataBaseSource.getRepository(Task);
    }

    public async createTask(task: Task) {
        try {
            const newTask = await this.taskRepository.save(task);
            return newTask;
        } catch (error) {
            return error;
        }
    }

    public async getAllTasks() {
        try {
            const allTasks = await this.taskRepository
                .createQueryBuilder("task")
                .getMany();
            return allTasks;
        } catch (error) {
            return error;
        }
    }

    public async getTaskById(id: number) {
        try {
            const task = await this.taskRepository.findOne({ where: { id } });
            if (!task) {
                return null;
            }
            return task;
        } catch (error) {
            return error;
        }
    }
    
    public async getTasksByUserId(userId: number) {
        try {
            const tasks = await this.taskRepository
                .createQueryBuilder("task")
                .where("task.userId = :userId", { userId })
                .getMany();

            return tasks;
        } catch (error) {
            return error;
        }
    }

    public async getExpiredTasks(userId: number, date: string) {
        try{
            const tasks: Task[] = await this.taskRepository
                .createQueryBuilder("task")
                .where("task.userId = :userId", { userId })
                .andWhere("task.deadline = :date", { date })
                .getMany();

            return tasks;
        } catch(error){
            return error;
        }
    }

    public async updateTask(id: number, task: Task) {
        try {
            const updatedTask = await this.taskRepository.update(id, task);
            if (!updatedTask.affected) {
                throw new Error("Task not found");
            }
            return updatedTask;
        } catch (error) {
            return error;
        }
    }

    public async updateTasktimeSpent(id: number, timeSpent: number) {
        try {
            const updatedTask = await this.taskRepository.update(id, {timeSpent});
            if (!updatedTask.affected) {
                throw new Error("Task not found");
            }
            return updatedTask;
        } catch (error) {
            return error;
        }
    }

    public async deleteTask(id: number) {
        try {
            const deletedTask = await this.taskRepository.delete(id);
            if (!deletedTask.affected) {
                throw new Error("Task not found");
            }
            return deletedTask;
        } catch (error) {
            return error;
        }
    }

    public async completeNormalTask(task:any){
        try {
            const updatedTask = await this.taskRepository.update(task.id, {done : true});
            if(!updatedTask.affected || !task){
                throw new Error("Task not found");
            }
            return updatedTask;
        } catch (error) {
            return error;
        }
    }

    /**
     * @param task 
     * @returns Verdadeiro caso a tarefa seja ciclica
     */
    public isTaskCyclic(task : Task | any) : boolean{
        const isCyclic = task.customInterval != 0
        return isCyclic; 
    }

}

export default new TaskService();
