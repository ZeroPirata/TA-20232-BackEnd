import { Repository } from "typeorm";
import { DataBaseSource } from "../config/database";
import { Subtask, Task } from "../models";
import mongoose from "mongoose";
import subtaskService from "./subtaskService";
import { MongoDataSource } from "../config/mongoConfig";
import { MongoTask } from "../models/MongoTask";
import { StatusLevels } from "../models/StatusLevels";
import { MongoFutureTask } from "../models/MongoFutureTasks";
import moment from "moment";
moment.locale('pt-br');

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
            console.log(newTask.id)
            return newTask.id.toString();
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

    public async getExpiredTasks(userId: number, date: string) {
        try {
            const tasks: Task[] = await this.taskRepository
                .createQueryBuilder("task")
                .where("task.userId = :userId", { userId })
                .andWhere("task.deadline = :date", { date })
                .getMany();

            return tasks;
        } catch (error) {
            return error;
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
            const updatedTask = await this.taskRepository.update(taskId, task);
            console.log(updatedTask);
            if (!updatedTask.affected) {
                throw new Error("Task not found");
            }
            return updatedTask;
            
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

            const createTask = await this.mongoTaskRepository.save(newTask);
            return createTask;

        } catch (error) {
            console.log(error);
            return error;
        }
    }

    public async createFutureTasks(taskId: number) {
        try {
            const task = await this.taskRepository.findOne({ where: { id: taskId } });
            if(!task){
                throw new Error("Task not found");
            }
            console.log(taskId);
            task.subtask =  await subtaskService.getSubtasksByTask(taskId) as Subtask[];

            let today = moment(task.createdAt);
            const futureTasks = [];

            for (let index = 0; index < 30; index++) {
                const newTask = new MongoFutureTask();
                today.add(task.customInterval, 'days');
              
                newTask.createdAt = today.toDate(); 
                newTask.customInterval = task.customInterval;
                newTask.id = new mongoose.Types.ObjectId().toString();
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
            
                futureTasks.push(newTask);

            } 
            
            await this.mongoFutureTaskRepository.save(futureTasks);
            
            return futureTasks;
            


        }catch(error){
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
