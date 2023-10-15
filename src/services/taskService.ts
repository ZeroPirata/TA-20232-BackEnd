import { Repository } from "typeorm";
import { DataBaseSource } from "../config/database";
import { Subtask, Task, User } from "../models";
import mongoose from "mongoose";
import subtaskService from "./subtaskService";
import { MongoDataSource } from "../config/mongoConfig";
import { MongoTask } from "../models/MongoTask";
import { StatusLevels } from "../models/StatusLevels";
import { MongoFutureTask } from "../models/MongoFutureTasks";
import moment from "moment-timezone";
import { create } from "domain";

class TaskService {
    private taskRepository: Repository<Task>;
    private mongoTaskRepository: Repository<MongoTask>;
    private mongoFutureTaskRepository: Repository<MongoFutureTask>;

    constructor() {
        this.taskRepository = DataBaseSource.getRepository(Task);
        this.mongoTaskRepository = MongoDataSource.getMongoRepository(MongoTask);
        this.mongoFutureTaskRepository = MongoDataSource.getMongoRepository(MongoFutureTask);
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
                .where('task.customInterval IS NOT NULL AND task.customInterval = 0')
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

    public async getExpiredTasks(userId: number, date: string): Promise<{ recorrente: any[], naoRecorrente: any[], error?: unknown }> {
        try {
            let tasks: any = []
            tasks = await this.taskRepository
                .createQueryBuilder("task")
                .where("task.userId = :userId", { userId })
                .andWhere("task.deadline = :date", { date })
                .getMany();
            const recorente = tasks.filter((task: Task) => { return task.customInterval > 0 })
            const naoRecorente = tasks.filter((task: Task) => { return task.customInterval === 0 })
            const pastCycleTasks = await this.mongoTaskRepository.find({ where: { userId: userId, deadline: date } });
            const futureCycleTasks = await this.mongoFutureTaskRepository.find({where: {userId: userId, deadline: date}});
            const retorno = { recorrente: [...recorente, ...pastCycleTasks, ...futureCycleTasks], naoRecorrente: [...naoRecorente] };
            return retorno
        } catch (error) {
            console.log(error)
            return { recorrente: [], naoRecorrente: [] };
        }
    }

    public async getTimeSpentByMonth(userId: number, month: number) {
        try {
            let tasks: Task[] = await this.taskRepository
                .createQueryBuilder("task")
                .where("task.userId = :userId", { userId })
                .andWhere("MONTH(task.deadline) = :month", { month })
                .getMany();
            let timeSpent = 0;
            tasks.forEach(task => {
                timeSpent += task.timeSpent;
            });

            return timeSpent;
        } catch (error) {
            return error;
        }
    }

    public async getTimeSpentMonthly(userId: number, year: number) {
        try {
            const tasks: Task[] = await this.taskRepository
                .createQueryBuilder('task')
                .where('task.userId = :userId', { userId })
                .andWhere('DATE_FORMAT(task.createdAt, "%Y-%m-%d") BETWEEN :start AND :end', {
                    start: `${year}-01-01`,
                    end: `${year}-12-31`
                })
                .getMany();

            const monthlyTimeSpent: { [month: string]: number } = {};

            tasks.forEach((task) => {
                const createdAt = task.createdAt;
                const month = createdAt.toLocaleString('en-US', { month: 'long' });
                const timeSpent = task.timeSpent;

                if (!monthlyTimeSpent[month]) {
                    monthlyTimeSpent[month] = 0;
                }

                monthlyTimeSpent[month] += timeSpent;
            });

            return monthlyTimeSpent;
        } catch (error) {
            throw error;
        }
    }

    public async getAllNonCyclicTasks(userId: number){
        try {
            const tasks = await this.taskRepository.find({where: { userId: { id: userId } }})
            const nonCyclicTasks = tasks.filter((task)=>{ return task.customInterval === 0})
            return nonCyclicTasks
        } catch (error) {
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

    public async getAllCyclicTasks(userId: number){
        try {
            const tasks = await this.taskRepository.find({where: {userId: userId}})
            const cyclicTasks = tasks.filter((task)=>{ return task.customInterval > 0})
            return cyclicTasks
        } catch (error) {
            console.log(error)
            return []
        }
    }

    public async checkTaskToRenew(cyclicTaks: Task[]) {
        try {
            const today = moment(new Date()).format("YYYY-MM-DD");
            const tasksToRenew = cyclicTaks.filter((task) => { return moment(task.lastExecution).add(task.customInterval, "days").format("YYYY-MM-DD") == today });
            return tasksToRenew;
        } catch (error) {
            console.log(error)
            return []
        }
    }



    public async updateTasktimeSpent(id: number, timeSpent: number) {
        try {
            const updatedTask = await this.taskRepository.update(id, { timeSpent });
            if (!updatedTask.affected) {
                throw new Error("Task not found");
            }
            return updatedTask;
        } catch (error) {
            return error;
        }
    }

    public async deleteTask(id: number) {
        const mongoFutureTaskRepository = MongoDataSource.getMongoRepository(MongoFutureTask);
        const mongoTaskRepository = MongoDataSource.getMongoRepository(MongoTask);
        
        try {
            const deletedTask = await this.taskRepository.delete(id);
            mongoTaskRepository.deleteMany({ "taskId": id });
            mongoFutureTaskRepository.deleteMany({ "taskId": id });
            
            if (!deletedTask.affected) {
                throw new Error("Task not found");
            }
            return deletedTask;
        } catch (error) {
            return error;
        }
    }

    public async refreshTask(taskId: number){
        try {
            const task = await this.taskRepository.findOne({ where: { id: taskId } });
            if(!task){
                throw new Error("Task not found");
            }
            let subtasks =  await subtaskService.getSubtasksByTask(taskId) as Subtask[];
            subtasks.forEach(subtask => {
                subtask.done = false;
                subtaskService.updateSubtask(subtask.id,subtask);
            });


            task.lastExecution = new Date();
            task.done = false;
            task.status = StatusLevels.TODO;
            task.deadline = moment(new Date()).tz('America/Sao_Paulo').format("YYYY-MM-DD")
            const updatedTask = await this.taskRepository.update(taskId, task);
            if (!updatedTask.affected) {
                throw new Error("Task not found");
            }
            return updatedTask;
            
        } catch (error) {
            return error;
        }
    }

    public async deleteFutureTask(taskId: number) {
        try {
            const task = await this.taskRepository.findOne({ where: { id: taskId } });
            if (!task) {
                throw new Error("Task not found");
            }
            
            const today = moment(new Date()).tz('America/Sao_Paulo')
            const deletedTask = await this.mongoFutureTaskRepository.delete({ taskId: taskId, deadline: today.format("YYYY-MM-DD") });
            if (!deletedTask.affected) {
                throw new Error("Task not found");
            }
            return deletedTask;
        } catch (error) {
            return error;
        }
    }
    
    public async cloneTask(taskId: number) {
        try {
            const task = await this.taskRepository.findOne({ where: { id: taskId } });
            if(!task){
                throw new Error("Task not found");
            }
            
            task.subtask =  await subtaskService.getSubtasksByTask(taskId) as Subtask[];

            const newTask = new MongoTask();
            // Transformando Task em MongoTask
            newTask.id = new mongoose.Types.ObjectId().toString();
            newTask.createdAt = task.createdAt;
            newTask.customInterval = task.customInterval;
            newTask.deadline = task.deadline;
            newTask.description = task.description;
            newTask.done = task.done;
            newTask.lastExecution = task.lastExecution;
            newTask.name = task.name;
            newTask.priority = task.priority;
            newTask.status = task.status;
            newTask.subtask = task.subtask;
            newTask.taskId = task.id;
            newTask.timeSpent = task.timeSpent;
            newTask.subtask = task.subtask;
            newTask.userId = typeof task.userId === "number"? task.userId: task.userId.id as number;

            const createTask = await this.mongoTaskRepository.save(newTask);
            return createTask;

        } catch (error) {
            console.log(error);
            return error;
        }
    }

    public async createFutureTasks(task: Task) {
        try {
       
            task.subtask =  await subtaskService.getSubtasksByTask(task.id as number) as Subtask[];

            let today = moment(task.createdAt);
            const futureTasks = [];
            console.log(today)
            for (let index = 0; index < 30; index++) {
                const newTask = new MongoFutureTask();
                today.add(task.customInterval, 'days').tz('America/Sao_Paulo').format("YYYY-MM-DD");

                // Transformando Task em MongoTask
                newTask.createdAt = task.createdAt; 
                newTask.customInterval = task.customInterval;
                newTask.id = new mongoose.Types.ObjectId().toString();
                newTask.deadline = today.tz('America/Sao_Paulo').format("YYYY-MM-DD");
                newTask.description = task.description;
                newTask.done = task.done;
                newTask.lastExecution = task.lastExecution;
                newTask.name = task.name;
                newTask.priority = task.priority;
                newTask.status = task.status;
                newTask.subtask = task.subtask;
                newTask.taskId = task.id;
                newTask.timeSpent = task.timeSpent;
                newTask.userId = task.userId;
                
                futureTasks.push(newTask);

            } 
            
            await this.mongoFutureTaskRepository.save(futureTasks);
            
            return futureTasks;
            
        } catch(error){
            console.log(error);
            return error;
        }
    }

    public async getTasksByUserId(userId: number): Promise<Task[]> {

        try {
            let allTasks = await this.taskRepository
                .createQueryBuilder('task')
                .where('task.userId = :userId', { userId })
                .getMany();

            if (allTasks.length === 0) {
                throw new Error("tasks not found");
            }

          
            return allTasks;
        } catch (error: any) {
            throw new Error(error);
        }
    }
}

export default new TaskService();
